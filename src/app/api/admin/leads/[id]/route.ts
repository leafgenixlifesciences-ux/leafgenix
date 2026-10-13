import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Admin session expired." }, { status: 401 });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid lead." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const parsed = z.object({ handled: z.boolean() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead status." }, { status: 422 });
  }

  const { data, error } = await createAdminClient()
    .from("contact_messages")
    .update({ handled: parsed.data.handled })
    .eq("id", id)
    .select("id, handled")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Could not update this lead." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, lead: data });
}
