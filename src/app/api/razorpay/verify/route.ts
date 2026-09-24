import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifySchema } from "@/lib/validation";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Statuses from which an order may still move to "paid". */
const UNPAID = ["created", "pending", "failed"] as const;

/**
 * Called by the browser immediately after Razorpay Checkout succeeds.
 *
 * This is the fast path, for a good confirmation experience. The webhook is
 * the authoritative one and fires at almost the same moment, so the two race
 * by design. Nothing here may assume it is the only writer: the status
 * transition is a single conditional UPDATE, and stock movement is claimed
 * inside `decrement_stock_for_order`, which is itself idempotent.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`verify:${clientIp(request)}`, 20, 60_000);
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, "Too many attempts. Please wait a moment.");
  }

  if (!adminConfigured()) {
    console.error("[verify] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json(
      { error: "Order verification is not configured on this server." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 422 });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    parsed.data;

  const admin = createAdminClient();

  if (
    !verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })
  ) {
    // Only an order that has not been paid may be marked failed. Without the
    // status guard a replayed call with a junk signature could flip a captured
    // order back to "failed" while the money is already taken.
    await admin
      .from("orders")
      .update({ status: "failed", failure_reason: "Signature verification failed" })
      .eq("id", orderId)
      .eq("razorpay_order_id", razorpay_order_id)
      .in("status", ["created", "pending"]);

    return NextResponse.json(
      { error: "We could not verify this payment. Please contact support." },
      { status: 400 },
    );
  }

  // Match on BOTH ids so a valid signature for someone else's order can never
  // mark this one paid.
  const { data: claimed, error: claimError } = await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
      failure_reason: null,
    })
    .eq("id", orderId)
    .eq("razorpay_order_id", razorpay_order_id)
    .in("status", UNPAID)
    .select("id");

  if (claimError) {
    console.error("[verify] update:", claimError.message);
    return NextResponse.json(
      { error: "Payment succeeded but we could not update the order. Contact support." },
      { status: 500 },
    );
  }

  // Nothing claimed: either the webhook got there first (fine - report success)
  // or the order does not exist / does not match (report not found).
  if (!claimed || claimed.length === 0) {
    const { data: existing } = await admin
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, orderId, alreadyRecorded: true });
  }

  // Idempotent in the database: returns false when stock has already moved.
  const { error: stockError } = await admin.rpc("decrement_stock_for_order", {
    p_order_id: orderId,
  });
  if (stockError) console.error("[verify] stock:", stockError.message);

  return NextResponse.json({ ok: true, orderId });
}
