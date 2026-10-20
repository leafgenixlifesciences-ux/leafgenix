/** Coupon pricing is opt-in. Products are advertised at M.R.P.; the reduction
 * is applied only when a valid code is attached to the cart. */
export const COUPON = {
  code: "LEAF10",
  percent: 10,
  label: "10% off",
} as const;

export type CouponOffer = { code: string; percent: number };

export function normalizeCouponCode(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export function couponIsValid(value: string | null | undefined): boolean {
  return normalizeCouponCode(value) === COUPON.code;
}

export function couponFormatValid(value: string | null | undefined): boolean {
  return /^[A-Z0-9_-]{4,32}$/.test(normalizeCouponCode(value));
}

function percentFor(offer?: CouponOffer | string | null): number {
  if (typeof offer === "string") return couponIsValid(offer) ? COUPON.percent : 0;
  return offer?.percent && offer.percent > 0 && offer.percent <= 80 ? offer.percent : 0;
}

/**
 * The price a customer actually pays for one unit: M.R.P. less the offer.
 * This — not `product.price_paise` — is the selling price everywhere.
 */
export function couponPricePaise(
  mrpPaise: number,
  offer?: CouponOffer | string | null,
): number {
  const percent = percentFor(offer);
  if (!percent || mrpPaise <= 0) return mrpPaise;
  return Math.round((mrpPaise * (100 - percent)) / 100);
}

/** What one unit saves against M.R.P. */
export function unitSavingPaise(
  mrpPaise: number,
  offer?: CouponOffer | string | null,
): number {
  return mrpPaise - couponPricePaise(mrpPaise, offer);
}

/** Totals for a set of lines, priced from M.R.P. only. */
export function priceLines<T extends { mrpPaise: number; quantity: number }>(
  lines: readonly T[],
  offer?: CouponOffer | string | null,
): { subtotalPaise: number; discountPaise: number; listTotalPaise: number } {
  let subtotalPaise = 0;
  let listTotalPaise = 0;

  for (const line of lines) {
    subtotalPaise += couponPricePaise(line.mrpPaise, offer) * line.quantity;
    listTotalPaise += line.mrpPaise * line.quantity;
  }

  return {
    subtotalPaise,
    listTotalPaise,
    discountPaise: listTotalPaise - subtotalPaise,
  };
}
