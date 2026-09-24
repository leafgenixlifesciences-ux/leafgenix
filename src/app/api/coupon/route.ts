import { NextResponse } from "next/server";

import { COUPON } from "@/lib/offer";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { couponLeadSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[
        char
      ] ?? char,
  );
}

async function sendEmail(body: Record<string, unknown>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
  }
}

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

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error("[coupon] Resend email settings are not configured");
    return NextResponse.json(
      { error: "Coupon email is temporarily unavailable." },
      { status: 503 },
    );
  }

  const { name, email, phone } = parsed.data;
  const recipient = process.env.LEAD_NOTIFICATION_EMAIL || site.email;
  const from = process.env.RESEND_FROM_EMAIL;

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({
      name,
      email,
      phone,
      subject: `Coupon lead · ${COUPON.code}`,
      message: `Requested the ${COUPON.percent}% welcome coupon and consented to promotional email and phone contact.`,
    });
    if (error) throw new Error(error.message);

    await sendEmail({
      from,
      to: [recipient],
      reply_to: email,
      subject: `New ${COUPON.percent}% coupon lead — ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#163126">
          <h2 style="color:#005c2d">New LeafGenix coupon lead</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> +91 ${escapeHtml(phone)}</p>
          <p><strong>Coupon issued:</strong> ${COUPON.code} (${COUPON.percent}% off)</p>
        </div>`,
    });

    // The on-screen success state is sufficient to deliver the coupon. This
    // confirmation is helpful, but a provider failure must not make the user
    // submit their details twice after the business notification succeeded.
    await sendEmail({
      from,
      to: [email],
      subject: `Your ${COUPON.percent}% LeafGenix coupon`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#163126">
          <p>Hi ${escapeHtml(name)},</p>
          <h2 style="color:#005c2d">Your coupon is ${COUPON.code}</h2>
          <p>Use it at checkout for ${COUPON.percent}% off your order. It has also been applied in this browser.</p>
          <p>Warmly,<br>${site.name}</p>
        </div>`,
    }).catch((error) => console.error("[coupon] customer confirmation:", error));
  } catch (error) {
    console.error("[coupon]", error);
    return NextResponse.json(
      { error: "We couldn't issue your coupon right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, couponCode: COUPON.code });
}
