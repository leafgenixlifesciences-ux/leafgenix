import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { adminPushConfigured } from "@/lib/admin-push";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const endpointSchema = z.string().url().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password &&
      (host === "fcm.googleapis.com" || host.endsWith(".push.services.mozilla.com") ||
        host === "web.push.apple.com" || host.endsWith(".notify.windows.com"));
  } catch { return false; }
}, "Unsupported push service endpoint.");

const subscriptionSchema = z.object({
  endpoint: endpointSchema,
  keys: z.object({
    p256dh: z.string().regex(/^[A-Za-z0-9_-]{80,120}$/),
    auth: z.string().regex(/^[A-Za-z0-9_-]{16,50}$/),
  }),
});

async function guard(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const rejected = await guard(request);
  if (rejected) return rejected;
  return NextResponse.json({
    configured: adminPushConfigured(),
    publicKey: adminPushConfigured() ? process.env.ADMIN_PUSH_VAPID_PUBLIC_KEY : null,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const rejected = await guard(request);
  if (rejected) return rejected;
  if (!adminPushConfigured()) return NextResponse.json({ error: "Phone alerts are not configured." }, { status: 503 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid push subscription." }, { status: 422 });

  const { error } = await createAdminClient().from("admin_push_subscriptions").upsert({
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
  }, { onConflict: "endpoint" });
  if (error) {
    console.error("[admin/push] subscription save failed", error.message);
    return NextResponse.json({ error: "Could not save this device. Check database setup." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const rejected = await guard(request);
  if (rejected) return rejected;
  if (!adminPushConfigured()) return NextResponse.json({ error: "Phone alerts are not configured." }, { status: 503 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const parsed = z.object({ endpoint: endpointSchema }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid push subscription." }, { status: 422 });
  const { error } = await createAdminClient().from("admin_push_subscriptions").delete().eq("endpoint", parsed.data.endpoint);
  if (error) return NextResponse.json({ error: "Could not remove this device." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
