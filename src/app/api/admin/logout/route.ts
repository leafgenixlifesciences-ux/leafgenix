import { NextResponse } from "next/server";

import { expiredAdminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(expiredAdminCookie());
  return response;
}
