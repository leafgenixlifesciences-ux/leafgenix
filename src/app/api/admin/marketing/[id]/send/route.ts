import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { sendMarketingEmail } from "@/lib/email";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  const admin = createAdminClient();
  const { data: campaign, error: campaignError } = await admin.from("marketing_campaigns")
    .select("id, subject, body").eq("id", id).single();
  if (campaignError || !campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  const { data: batch, error: batchError } = await admin.from("marketing_deliveries")
    .select("id, email, name").eq("campaign_id", id).eq("status", "pending")
    .order("email").limit(4);
  if (batchError) return NextResponse.json({ error: "Could not load campaign queue." }, { status: 500 });

  for (const delivery of batch ?? []) {
    const { data: subscriber, error: subscriberError } = await admin.from("marketing_subscribers")
      .select("unsubscribe_token, unsubscribed_at").eq("email", delivery.email).maybeSingle();
    if (subscriberError) return NextResponse.json({ error: "Could not verify subscriber consent." }, { status: 500 });
    if (!subscriber || subscriber.unsubscribed_at) {
      await admin.from("marketing_deliveries").update({ status: "skipped", updated_at: new Date().toISOString() }).eq("id", delivery.id);
      continue;
    }
    try {
      await sendMarketingEmail({
        campaignId: id,
        to: delivery.email,
        name: delivery.name,
        subject: campaign.subject,
        body: campaign.body,
        unsubscribeToken: subscriber.unsubscribe_token,
      });
      const { error } = await admin.from("marketing_deliveries")
        .update({ status: "sent", sent_at: new Date().toISOString(), error: null, updated_at: new Date().toISOString() })
        .eq("id", delivery.id);
      if (error) console.error("[admin/marketing] sent receipt", error.message);
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (error) {
      console.error("[admin/marketing] send failed", error);
      await admin.from("marketing_deliveries").update({ status: "failed", error: error instanceof Error ? error.message.slice(0, 200) : "Send failed", updated_at: new Date().toISOString() }).eq("id", delivery.id);
    }
  }

  const statuses = ["pending", "sent", "failed", "skipped"] as const;
  const counts = await Promise.all(statuses.map(async (status) => {
    const { count, error } = await admin.from("marketing_deliveries")
      .select("id", { count: "exact", head: true }).eq("campaign_id", id).eq("status", status);
    if (error) throw error;
    return count ?? 0;
  }));
  return NextResponse.json({ campaign: Object.fromEntries(statuses.map((status, index) => [status, counts[index]])) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid campaign." }, { status: 400 });
  const { error } = await createAdminClient().from("marketing_deliveries")
    .update({ status: "pending", error: null }).eq("campaign_id", id).eq("status", "failed");
  if (error) return NextResponse.json({ error: "Could not retry failed emails." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
