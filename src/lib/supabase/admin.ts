import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses Row Level Security.
 *
 * ONLY import this from route handlers and server-side code that needs to
 * write orders or read a guest order by id. Never import it into anything
 * that ships to the browser: the key it uses can read and write every table.
 */
/** True once the service-role key is present. Lets route handlers return a
 *  clean, actionable error instead of throwing an unhandled 500 while the
 *  project is still being configured. */
export function adminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY " +
        "in .env.local (Supabase dashboard → Project Settings → API Keys → service_role).",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
