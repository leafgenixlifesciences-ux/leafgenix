import "server-only";

import crypto from "node:crypto";
import Razorpay from "razorpay";

/** The public key id, read on the server at REQUEST time.
 *
 *  Deliberately not a NEXT_PUBLIC_ variable: those are inlined into the client
 *  bundle at build time, which would mean rebuilding and redeploying just to
 *  add a key. The id is handed to the browser by /api/razorpay/create-order
 *  instead, so keys can be rotated with a restart. NEXT_PUBLIC_RAZORPAY_KEY_ID
 *  is still honoured for backwards compatibility. */
export function razorpayKeyId(): string | undefined {
  return (
    process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  );
}

/** True once real keys are present. The checkout page reads this on the server
 *  so the site still renders — with payment disabled — before keys are added. */
export function razorpayConfigured(): boolean {
  return Boolean(razorpayKeyId() && process.env.RAZORPAY_KEY_SECRET);
}

let cached: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (cached) return cached;

  const key_id = razorpayKeyId();
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET " +
        "to .env.local (Razorpay Dashboard → Account & Settings → API Keys).",
    );
  }

  cached = new Razorpay({ key_id, key_secret });
  return cached;
}

/**
 * Verifies the signature Razorpay Checkout hands back to the browser.
 * HMAC-SHA256 of "<razorpay_order_id>|<razorpay_payment_id>" keyed with the
 * API secret. Compared in constant time.
 */
export function verifyPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
    .digest("hex");

  return timingSafeEqual(expected, params.razorpay_signature);
}

/**
 * Verifies a webhook delivery. Razorpay signs the *raw* request body with the
 * webhook secret — so the route handler must pass req.text(), never a
 * re-serialised object.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
