import { formatPaise } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";

type Event = "paid" | "processing" | "shipped" | "delivered" | "cancelled";
type Recipient = "customer" | "admin";

type Order = {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  total_paise: number;
  status: string;
  tracking_number: string | null;
  courier_name: string | null;
  updated_at: string;
  whatsapp_consent: boolean;
};

function configured(): boolean {
  return Boolean(
    process.env.GUPSHUP_API_KEY &&
    process.env.GUPSHUP_APP_NAME &&
    process.env.GUPSHUP_SOURCE_PHONE &&
    process.env.GUPSHUP_TEMPLATE_ORDER_PAID &&
    process.env.GUPSHUP_TEMPLATE_ORDER_STATUS,
  );
}

function phoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

async function submit(
  order: Order,
  event: Event,
  recipient: Recipient,
  destination: string,
  templateId: string,
  params: string[],
): Promise<void> {
  const admin = createAdminClient();
  const eventKey = event === "paid" ? "paid" : `${event}:${order.updated_at}`;
  // Claim before sending: Razorpay's webhook and browser verification race.
  const { data: claim, error: claimError } = await admin
    .from("order_whatsapp_messages")
    .insert({ order_id: order.id, event_key: eventKey, recipient })
    .select("id")
    .single();
  if (claimError?.code === "23505") return;
  if (claimError || !claim) throw new Error(`WhatsApp claim failed: ${claimError?.message}`);

  let rejected = false;
  try {
    const form = new URLSearchParams({
      channel: "whatsapp",
      source: phoneNumber(process.env.GUPSHUP_SOURCE_PHONE!),
      destination: phoneNumber(destination),
      "src.name": process.env.GUPSHUP_APP_NAME!,
      template: JSON.stringify({ id: templateId, params }),
    });
    const response = await fetch("https://api.gupshup.io/wa/api/v1/template/msg", {
      method: "POST",
      headers: {
        apikey: process.env.GUPSHUP_API_KEY!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json()) as {
      status?: string;
      messageId?: string;
      message?: string;
    };
    if (!response.ok || result.status !== "submitted" || !result.messageId) {
      rejected = true;
      throw new Error(`Gupshup ${response.status}: ${result.message || result.status || "No message ID"}`);
    }
    const { error: updateError } = await admin
      .from("order_whatsapp_messages")
      .update({ message_id: result.messageId, submitted_at: new Date().toISOString() })
      .eq("id", claim.id);
    if (updateError) throw new Error(`WhatsApp receipt save failed: ${updateError.message}`);
  } catch (error) {
    // Retry an explicit rejection. A timeout or malformed response is
    // ambiguous: retain the claim so a webhook replay cannot send a duplicate.
    if (rejected) {
      await admin.from("order_whatsapp_messages").delete().eq("id", claim.id);
    }
    throw error;
  }
}

/** Send approved utility templates only. Never send a customer message without checkout opt-in. */
export async function sendOrderWhatsApp(orderId: string, event: Event): Promise<void> {
  if (!configured()) return;

  const { data, error } = await createAdminClient()
    .from("orders")
    .select("id, order_number, full_name, phone, total_paise, status, tracking_number, courier_name, updated_at, whatsapp_consent")
    .eq("id", orderId)
    .single();
  if (error || !data) throw new Error(`Could not load order for WhatsApp: ${error?.message ?? orderId}`);
  const order = data as Order;
  if (order.status !== event) return;

  const sends: Promise<void>[] = [];
  if (event === "paid" && process.env.GUPSHUP_ADMIN_PHONE && process.env.GUPSHUP_TEMPLATE_ADMIN_ORDER) {
    sends.push(submit(
      order,
      event,
      "admin",
      process.env.GUPSHUP_ADMIN_PHONE,
      process.env.GUPSHUP_TEMPLATE_ADMIN_ORDER!,
      [order.order_number, order.full_name, formatPaise(order.total_paise)],
    ));
  }
  if (order.whatsapp_consent) {
    const templateId = event === "paid"
      ? process.env.GUPSHUP_TEMPLATE_ORDER_PAID!
      : process.env.GUPSHUP_TEMPLATE_ORDER_STATUS!;
    const params = event === "paid"
      ? [order.full_name, order.order_number]
      : [
          order.full_name,
          order.order_number,
          event,
          {
            processing: "We are preparing it for dispatch.",
            shipped: `Courier: ${order.courier_name || "delivery partner"}; tracking: ${order.tracking_number || "available by email"}.`,
            delivered: "Your delivery has been marked complete.",
            cancelled: "This order was cancelled. Contact support if you paid.",
            paid: "Your payment has been received.",
          }[event],
        ];
    sends.push(submit(order, event, "customer", order.phone, templateId, params));
  }
  const outcomes = await Promise.allSettled(sends);
  const failed = outcomes.find((result) => result.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
}
