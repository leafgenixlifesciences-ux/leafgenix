import { formatPaise } from "@/lib/money";
import { COUPON } from "@/lib/offer";
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
    (
      process.env.GUPSHUP_TEMPLATE_ORDER_PAID ||
      process.env.GUPSHUP_TEMPLATE_ORDER_STATUS ||
      process.env.GUPSHUP_TEMPLATE_ORDER_PROCESSING ||
      process.env.GUPSHUP_TEMPLATE_ORDER_SHIPPED ||
      process.env.GUPSHUP_TEMPLATE_ORDER_DELIVERED ||
      process.env.GUPSHUP_TEMPLATE_ORDER_CANCELLED ||
      process.env.GUPSHUP_TEMPLATE_ADMIN_ORDER
    ),
  );
}

function phoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

class GupshupRejection extends Error {}

/** Submit one approved template. Throws GupshupRejection when Gupshup refuses it. */
async function postTemplate(destination: string, templateId: string, params: string[]): Promise<string> {
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
    throw new GupshupRejection(`Gupshup ${response.status}: ${result.message || result.status || "No message ID"}`);
  }
  return result.messageId;
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
    let messageId: string;
    try {
      messageId = await postTemplate(destination, templateId, params);
    } catch (error) {
      rejected = error instanceof GupshupRejection;
      throw error;
    }
    const { error: updateError } = await admin
      .from("order_whatsapp_messages")
      .update({ message_id: messageId, submitted_at: new Date().toISOString() })
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

function getOrderStatusTemplateId(event: Event): string | undefined {
  if (event === "paid") {
    // The paid template takes two params; the status template takes four.
    return process.env.GUPSHUP_TEMPLATE_ORDER_PAID || undefined;
  }

  const map: Record<Exclude<Event, "paid">, string | undefined> = {
    processing: process.env.GUPSHUP_TEMPLATE_ORDER_PROCESSING || process.env.GUPSHUP_TEMPLATE_ORDER_STATUS,
    shipped: process.env.GUPSHUP_TEMPLATE_ORDER_SHIPPED || process.env.GUPSHUP_TEMPLATE_ORDER_STATUS,
    delivered: process.env.GUPSHUP_TEMPLATE_ORDER_DELIVERED || process.env.GUPSHUP_TEMPLATE_ORDER_STATUS,
    cancelled: process.env.GUPSHUP_TEMPLATE_ORDER_CANCELLED || process.env.GUPSHUP_TEMPLATE_ORDER_STATUS,
  };

  return map[event];
}

function getCustomerStatusText(order: Order, event: Exclude<Event, "paid">): string {
  const statusText: Record<Exclude<Event, "paid">, string> = {
    processing: "We are preparing your order for dispatch.",
    shipped: `Courier: ${order.courier_name || "delivery partner"}; tracking: ${order.tracking_number || "available by email"}.`,
    delivered: "Your delivery has been marked complete.",
    cancelled: "This order was cancelled. Contact support if you paid.",
  };

  return statusText[event];
}

function getCustomerTemplateParams(order: Order, event: Event): string[] {
  if (event === "paid") {
    return [order.full_name, order.order_number];
  }

  return [
    order.full_name,
    order.order_number,
    event,
    getCustomerStatusText(order, event),
  ];
}

/** Send approved utility templates only, and only to orders flagged for WhatsApp updates. */
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
    const templateId = getOrderStatusTemplateId(event);
    if (templateId) {
      const params = getCustomerTemplateParams(order, event);
      sends.push(submit(order, event, "customer", order.phone, templateId, params));
    }
  }
  const outcomes = await Promise.allSettled(sends);
  const failed = outcomes.find((result) => result.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
}

/**
 * Welcome-coupon message for the popup lead form, whose consent line covers
 * contact by phone. Sent only when its own template is configured.
 */
export async function sendCouponWhatsApp(lead: { name: string; phone: string }): Promise<void> {
  const templateId = process.env.GUPSHUP_TEMPLATE_COUPON;
  if (
    !templateId ||
    !process.env.GUPSHUP_API_KEY ||
    !process.env.GUPSHUP_APP_NAME ||
    !process.env.GUPSHUP_SOURCE_PHONE
  ) {
    return;
  }
  await postTemplate(lead.phone, templateId, [lead.name, COUPON.code]);
}
