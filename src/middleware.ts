import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Keep the Supabase auth cookie fresh so Server Components receive the
 * current session. Cloudflare's Next.js adapter currently requires the Edge
 * middleware entry point; Next.js 16's `proxy.ts` is Node-only.
 */
export function middleware(request: NextRequest) {
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

  if (!hasAuthCookie) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

// Next.js 16.3 still uses this compatibility label for legacy middleware.
export const runtime = "experimental-edge";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/razorpay/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
