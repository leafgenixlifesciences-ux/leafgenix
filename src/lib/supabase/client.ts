import { createBrowserClient } from "@supabase/ssr";

/** Browser-side client. Only used by the login form and sign-out button. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
