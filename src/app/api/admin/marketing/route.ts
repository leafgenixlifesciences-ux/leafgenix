import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { emailConfigured } from "@/lib/email";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  subject: z.string().trim().min(5).max(120),
  body: z.string().trim().min(20).max(4000),
});

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!adminConfigured() || !emailConfigured()) return NextResponse.json({ error: "Email or database is not configured." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Add a subject (5–120 characters) and message (20–4000 characters)." }, { status: 422 });

  const admin = createAdminClient();
  const subscribers: { email: string; name: string }[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await admin.from("marketing_subscribers")
      .select("email, name").is("unsubscribed_at", null).order("email")
      .range(from, from + 499);
    if (error) {
      console.error("[admin/marketing] subscribers", error.message);
      return NextResponse.json({ error: "Could not load opted-in subscribers." }, { status: 500 });
    }
    subscribers.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) break;
  }
  if (!subscribers.length) return NextResponse.json({ error: "There are no opted-in subscribers to email." }, { status: 422 });

  const { data: campaign, error: campaignError } = await admin.from("marketing_campaigns")
    .insert({ subject: parsed.data.subject, body: parsed.data.body })
    .select("id, subject, body, created_at").single();
  if (campaignError || !campaign) return NextResponse.json({ error: "Could not create campaign." }, { status: 500 });

  for (let i = 0; i < subscribers.length; i += 200) {
    const { error } = await admin.from("marketing_deliveries").insert(
      subscribers.slice(i, i + 200).map((subscriber) => ({ campaign_id: campaign.id, ...subscriber })),
    );
    if (error) {
      console.error("[admin/marketing] delivery queue", error.message);
      await admin.from("marketing_campaigns").delete().eq("id", campaign.id);
      return NextResponse.json({ error: "Could not prepare the mailing list." }, { status: 500 });
    }
  }
  return NextResponse.json({ campaign: { ...campaign, pending: subscribers.length, sent: 0, failed: 0, skipped: 0 } }, { status: 201 });
}
