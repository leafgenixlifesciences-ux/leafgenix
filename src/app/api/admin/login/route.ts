import { NextResponse } from "next/server";
import { z } from "zod";

import {
  adminAuthConfigured,
  adminCookie,
  createAdminToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const limit = rateLimit(`admin-login:${clientIp(request)}`, 5, 15 * 60_000);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      "Too many login attempts. Try again after 15 minutes.",
    );
  }

  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (
    !parsed.success ||
    !verifyAdminCredentials(parsed.data.username, parsed.data.password)
  ) {
    return NextResponse.json(
      { error: "The admin ID or password is incorrect." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    adminCookie(createAdminToken(parsed.data.username.trim())),
  );
  return response;
}
