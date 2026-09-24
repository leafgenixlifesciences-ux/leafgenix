import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validation";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Unauthenticated public write. Five a minute is generous for a human and
  // useless for a spam script.
  const limit = rateLimit(`contact:${clientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      "You have sent several messages already. Please wait a minute.",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form" },
      { status: 422 },
    );
  }

  if (!adminConfigured()) {
    console.error("[contact] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json(
      { error: "The contact form is not configured. Please email us directly." },
      { status: 503 },
    );
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    });

    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "We couldn't send that. Please email us directly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
