import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Runs before every matched route. Its only job is to keep the Supabase auth
 * cookie fresh so Server Components see an accurate session on the first byte.
 *
 * (In Next.js 16 this file convention is `proxy`; it was called `middleware`
 * in earlier versions.)
 */
export function proxy(request: NextRequest) {
  // Anonymous catalogue traffic is the overwhelming majority of requests.
  // Avoid a remote Supabase auth call when there is no auth cookie to refresh;
  // this also lets public ISR pages stay cacheable at Netlify's edge.
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

  if (!hasAuthCookie) {
    return NextResponse.next({ request });
  }

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
