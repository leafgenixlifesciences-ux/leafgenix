import { sendPushBatch, type PushSubscriptionData } from "@mmmike/web-push/send";

import { formatPaise } from "@/lib/money";
import { site } from "@/lib/site";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export function adminPushConfigured(): boolean {
  return Boolean(
    adminConfigured() &&
    process.env.ADMIN_PUSH_VAPID_PUBLIC_KEY &&
    process.env.ADMIN_PUSH_VAPID_PRIVATE_KEY,
  );
}

export async function sendNewOrderPush(orderId: string): Promise<void> {
  if (!adminPushConfigured()) return;

  const admin = createAdminClient();
  const [{ data: order, error: orderError }, { data: devices, error: devicesError }] =
    await Promise.all([
      admin.from("orders").select("order_number, total_paise, status").eq("id", orderId).single(),
      admin.from("admin_push_subscriptions").select("endpoint, p256dh, auth").limit(8),
    ]);

  if (orderError || devicesError) {
    throw new Error("Could not load admin push recipients or paid order");
  }
  if (order?.status !== "paid" || !devices?.length) return;

  const subscriptions: PushSubscriptionData[] = devices.map((device) => ({
    endpoint: device.endpoint,
    keys: { p256dh: device.p256dh, auth: device.auth },
  }));

  const result = await sendPushBatch(
    subscriptions,
    {
      title: "New LeafGenix order",
      body: `${order.order_number} · ${formatPaise(order.total_paise)} paid. Tap to open the order desk.`,
      url: "/admin",
      tag: `order-${orderId}`,
    },
    {
      publicKey: process.env.ADMIN_PUSH_VAPID_PUBLIC_KEY!,
      privateKey: process.env.ADMIN_PUSH_VAPID_PRIVATE_KEY!,
      subject: `mailto:${site.email}`,
    },
    { concurrency: 2, timeoutMs: 5000, ttl: 86400, urgency: "high" },
  );

  if (result.gone.length) {
    const { error } = await admin.from("admin_push_subscriptions").delete().in("endpoint", result.gone);
    if (error) console.error("[admin/push] stale-device cleanup failed");
  }
  if (result.failed.length) {
    console.error("[admin/push] delivery failed", { failed: result.failed.length });
  }
}
