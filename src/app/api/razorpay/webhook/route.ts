import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendPaidOrderEmails } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Statuses from which an order may still move to "paid". */
const UNPAID = ["created", "pending", "failed"] as const;

/**
 * Razorpay -> us. This is the source of truth for payment state: it fires even
 * if the customer closes the tab mid-redirect.
 *
 * It races the browser's /verify call by design, and `payment.captured` and
 * `order.paid` both arrive for the same payment, so every write here is a
 * single conditional UPDATE and stock is moved through an idempotent RPC.
 *
 * Configure at Razorpay Dashboard -> Settings -> Webhooks:
 *   URL     https://leafgenix.in/api/razorpay/webhook
 *   Events  payment.captured, payment.failed, order.paid, refund.processed
 *   Secret  -> RAZORPAY_WEBHOOK_SECRET in .env.local
 */
export async function POST(request: Request) {
  // The signature is computed over the raw bytes - never re-serialise.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    console.warn("[webhook] rejected: bad or missing signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      refund?: { entity?: Record<string, unknown> };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  if (!adminConfigured()) {
    console.error("[webhook] SUPABASE_SERVICE_ROLE_KEY is not set");
    // 503 makes Razorpay retry rather than treating the event as delivered.
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const payment = event.payload?.payment?.entity as
    | {
        id?: string;
        order_id?: string;
        method?: string;
        error_description?: string;
        error_reason?: string;
      }
    | undefined;

  try {
    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        if (!payment?.order_id) break;

        // One statement does the check and the write, so a concurrent /verify
        // or a duplicate delivery of the sibling event cannot both win.
        const { data: claimed, error } = await admin
          .from("orders")
          .update({
            status: "paid",
            razorpay_payment_id: payment.id ?? null,
            payment_method: payment.method ?? null,
            failure_reason: null,
          })
          .eq("razorpay_order_id", payment.order_id)
          .in("status", UNPAID)
          .select("id");

        if (error) throw new Error(error.message);

        let paidOrderId = claimed?.[0]?.id as string | undefined;

        if (paidOrderId) {
          const { error: stockError } = await admin.rpc(
            "decrement_stock_for_order",
            { p_order_id: paidOrderId },
          );
          if (stockError) console.error("[webhook] stock:", stockError.message);
        } else {
          // A sibling webhook or the browser verification may have won the
          // paid-state race. Still retry any transactional email that has not
          // been durably marked as delivered.
          const { data: existing } = await admin
            .from("orders")
            .select("id, status")
            .eq("razorpay_order_id", payment.order_id)
            .maybeSingle();
          if (existing?.status === "paid") paidOrderId = existing.id;
        }

        if (paidOrderId) {
          // Throwing makes Razorpay retry a transient Resend failure. The
          // order is already safely paid, and both emails are idempotent.
          await sendPaidOrderEmails(paidOrderId);
        }
        break;
      }

      case "payment.failed": {
        if (!payment?.order_id) break;
        await admin
          .from("orders")
          .update({
            status: "failed",
            razorpay_payment_id: payment.id ?? null,
            payment_method: payment.method ?? null,
            failure_reason:
              payment.error_description ?? payment.error_reason ?? "Payment failed",
          })
          .eq("razorpay_order_id", payment.order_id)
          .in("status", ["created", "pending"]);
        break;
      }

      case "refund.processed": {
        const refund = event.payload?.refund?.entity as
          | { payment_id?: string }
          | undefined;
        if (!refund?.payment_id) break;

        const { data: refunded } = await admin
          .from("orders")
          .update({ status: "refunded" })
          .eq("razorpay_payment_id", refund.payment_id)
          .neq("status", "refunded")
          .select("id");

        // Goods are coming back, so the stock has to go back on the shelf.
        // `restock_for_order` is idempotent the same way the decrement is.
        for (const order of refunded ?? []) {
          const { error: restockError } = await admin.rpc("restock_for_order", {
            p_order_id: order.id,
          });
          if (restockError) {
            console.error("[webhook] restock:", restockError.message);
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    // 500 tells Razorpay to retry - which is what we want on a transient fault.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
