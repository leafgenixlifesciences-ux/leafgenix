import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { normalizeCouponCode } from "@/lib/offer";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(4).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  percent: z.number().int().min(1).max(80),
  expiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a code, discount from 1–80%, and optional expiry date." }, { status: 422 });
  const expiresAt = parsed.data.expiresOn ? new Date(`${parsed.data.expiresOn}T23:59:59+05:30`) : null;
  if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now())) {
    return NextResponse.json({ error: "Choose a future expiry date." }, { status: 422 });
  }
  const code = normalizeCouponCode(parsed.data.code);
  const { data, error } = await createAdminClient().from("coupons").insert({
    code,
    discount_percent: parsed.data.percent,
    active: true,
    expires_at: expiresAt?.toISOString() ?? null,
  }).select("code, discount_percent, active, expires_at, created_at").single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "This coupon code already exists." }, { status: 409 });
    console.error("[admin/coupons]", error.message);
    return NextResponse.json({ error: "Could not create coupon." }, { status: 500 });
  }
  return NextResponse.json({ coupon: data }, { status: 201 });
}
