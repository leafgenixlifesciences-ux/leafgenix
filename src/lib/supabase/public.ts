import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client with no cookie access at all.
 *
 * `server.ts` reads cookies, which makes it unusable inside a cached scope -
 * Next refuses to cache anything that touches request state. Product and Rx
 * rows are public under RLS (`is_active = true`) and identical for every
 * visitor, so they are read through this client and cached once for everyone.
 */
let cached: ReturnType<typeof createSupabaseClient> | null = null;

export function createPublicClient() {
  if (cached) return cached;

  cached = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  return cached;
}
