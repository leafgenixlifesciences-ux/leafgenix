import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Runs before every matched route. Its only job is to keep the Supabase auth
 * cookie fresh so Server Components see an accurate session on the first byte.
 *
 * (In Next.js 16 this file convention is `proxy`; it was called `middleware`
 * in earlier versions.)
 */
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and the Razorpay webhook — the webhook
     * is machine-to-machine and must not have cookies touched.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/razorpay/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
