/** Single source of truth for shipping rules. Referenced by the cart UI, the
 *  checkout summary and the server-side order builder so the three can never
 *  disagree. */

export const FREE_SHIPPING_THRESHOLD_PAISE = 99900; // ₹999
export const FLAT_SHIPPING_PAISE = 5900; // ₹59
/** The hidden checkout test product costs ₹1; it ships free so a test costs ₹1. */
const TEST_ORDER_MAX_PAISE = 100;

export function shippingFor(subtotalPaise: number): number {
  if (subtotalPaise <= TEST_ORDER_MAX_PAISE) return 0;
  return subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : FLAT_SHIPPING_PAISE;
}

export function amountToFreeShipping(subtotalPaise: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise);
}

export const MAX_QTY_PER_LINE = 10;
