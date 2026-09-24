import { NextResponse } from "next/server";

import { COUPON } from "@/lib/offer";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { couponLeadSchema } from "@/lib/validation";
import { emailConfigured, sendCouponEmails } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(`coupon:${clientIp(request)}`, 3, 10 * 60_000);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      "You have already tried a few times. Please wait before trying again.",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = couponLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your details" },
      { status: 422 },
    );
  }

  if (!adminConfigured()) {
    console.error("[coupon] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json(
      { error: "Coupon sign-up is temporarily unavailable." },
      { status: 503 },
    );
  }

  if (!emailConfigured()) {
    console.error("[coupon] Resend email settings are not configured");
    return NextResponse.json(
      { error: "Coupon email is temporarily unavailable." },
      { status: 503 },
    );
  }

  const { name, email, phone } = parsed.data;
  try {
    const admin = createAdminClient();
    const { data: lead, error } = await admin
      .from("contact_messages")
      .insert({
        name,
        email,
        phone,
        subject: `Coupon lead · ${COUPON.code}`,
        message: `Requested the ${COUPON.percent}% welcome coupon and consented to promotional email and phone contact.`,
      })
      .select("id")
      .single();
    if (error || !lead) throw new Error(error?.message ?? "Coupon lead was not saved");

    await sendCouponEmails({ id: lead.id, name, email, phone });
  } catch (error) {
    console.error("[coupon]", error);
    return NextResponse.json(
      { error: "We couldn't issue your coupon right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, couponCode: COUPON.code });
}
