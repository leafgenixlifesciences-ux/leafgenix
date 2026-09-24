import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * One `auth.getUser()` per request, shared by everything that renders.
 *
 * The layout needs it for the header, /checkout needs it to prefill the form,
 * /account needs it to gate the page. Called directly that is three round
 * trips to Supabase for a single page view. React's `cache` collapses them
 * into one for the lifetime of the request.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    // Env vars missing or Supabase unreachable - render as a signed-out
    // visitor rather than 500ing the whole page.
    return null;
  }
});
