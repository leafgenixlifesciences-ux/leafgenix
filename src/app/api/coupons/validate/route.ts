import { NextResponse } from "next/server";

import { activeCoupon } from "@/lib/coupon-db";
import { adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Coupons are unavailable." }, { status: 503 });
  try {
    const offer = await activeCoupon(new URL(request.url).searchParams.get("code"));
    if (!offer) return NextResponse.json({ error: "This coupon is invalid or expired." }, { status: 404 });
    return NextResponse.json({ offer }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[coupons/validate]", error);
    return NextResponse.json({ error: "Could not check this coupon." }, { status: 503 });
  }
}
