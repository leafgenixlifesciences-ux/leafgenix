import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fulfilmentSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
  courierName: z.string().trim().max(100).optional().or(z.literal("")),
  trackingNumber: z.string().trim().max(120).optional().or(z.literal("")),
});

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
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = fulfilmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the fulfilment details." },
      { status: 422 },
    );
  }

  if (
    ["shipped", "delivered"].includes(parsed.data.status) &&
    (!parsed.data.courierName || !parsed.data.trackingNumber)
  ) {
    return NextResponse.json(
      { error: "Courier and tracking number are required after dispatch." },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const { data: current, error: readError } = await admin
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();

  if (readError || !current) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!["paid", "processing", "shipped", "delivered", "cancelled"].includes(current.status)) {
    return NextResponse.json(
      { error: "Delivery can only be updated after payment is confirmed." },
      { status: 409 },
    );
  }

  const update = {
    status: parsed.data.status,
    courier_name: parsed.data.courierName || null,
    tracking_number: parsed.data.trackingNumber || null,
  };
  const { data, error } = await admin
    .from("orders")
    .update(update)
    .eq("id", id)
    .select("id, status, courier_name, tracking_number, updated_at")
    .single();

  if (error || !data) {
    console.error("[admin/order]", error?.message);
    return NextResponse.json(
      { error: "Could not update this order." },
      { status: 500 },
    );
  }

  let emailWarning: string | undefined;
  if (current.status !== parsed.data.status) {
    try {
      await sendOrderStatusEmail(id, parsed.data.status);
    } catch (error) {
      console.error("[admin/order-status-email]", error);
      emailWarning = "Status saved, but the customer email could not be sent.";
    }
  }

  return NextResponse.json({ ok: true, order: data, warning: emailWarning });
}
