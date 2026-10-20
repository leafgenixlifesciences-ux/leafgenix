import "server-only";

import { couponFormatValid, normalizeCouponCode, type CouponOffer } from "@/lib/offer";
import { createAdminClient } from "@/lib/supabase/admin";

export async function activeCoupon(rawCode: string | null | undefined): Promise<CouponOffer | null> {
  const code = normalizeCouponCode(rawCode);
  if (!couponFormatValid(code)) return null;
  const { data, error } = await createAdminClient()
    .from("coupons")
    .select("code, discount_percent, active, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(`Coupon lookup failed: ${error.message}`);
  if (!data?.active || (data.expires_at && Date.parse(data.expires_at) <= Date.now())) return null;
  return { code: data.code, percent: data.discount_percent };
}
