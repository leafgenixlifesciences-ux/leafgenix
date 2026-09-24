import "server-only";

/**
 * A small fixed-window rate limiter held in process memory.
 *
 * Scope, stated plainly: this counts per server instance. On a single VM or a
 * warm serverless container it stops the obvious abuse - a script hammering
 * /api/razorpay/create-order to fill the orders table with PII and burn
 * Razorpay order creations. Across many cold lambdas the effective ceiling is
 * (limit x live instances), so a determined attacker gets more room.
 *
 * For a hard guarantee put a shared store in front of it - Upstash Redis, or
 * rate limiting at the edge (Vercel WAF / Cloudflare). Only the body of
 * `rateLimit` changes; every call site stays as it is.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/** Drop expired buckets so a long-lived process cannot grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets. Sent back as Retry-After on a 429. */
  retryAfter: number;
  remaining: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    ok: existing.count <= limit,
    retryAfter,
    remaining: Math.max(0, limit - existing.count),
  };
}

/**
 * Best-effort client address. Behind Vercel or Cloudflare the left-most entry
 * of x-forwarded-for is the real client; each proxy appends its own hop after.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/** The single shape every rate-limited route returns. */
export function tooManyRequests(retryAfter: number, message: string): Response {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
