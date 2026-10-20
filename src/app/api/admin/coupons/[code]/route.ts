import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { couponFormatValid, normalizeCouponCode } from "@/lib/offer";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const code = normalizeCouponCode((await params).code);
  if (!couponFormatValid(code)) return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const parsed = z.object({ active: z.boolean() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon status." }, { status: 422 });
  const { data, error } = await createAdminClient().from("coupons")
    .update({ active: parsed.data.active }).eq("code", code)
    .select("code, active").single();
  if (error || !data) return NextResponse.json({ error: "Could not update coupon." }, { status: 500 });
  return NextResponse.json({ coupon: data });
}
