import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/admin-auth";
import type { AdminLead, AdminOrder, AdminProductHealth } from "@/lib/admin-types";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const paidStatuses = ["paid", "processing", "shipped", "delivered"];
const normalizedEmail = (value: string | null) => value?.trim().toLowerCase() ?? "";
const normalizedPhone = (value: string | null) => value?.replace(/\D/g, "").slice(-10) ?? "";

function countLeadOrders(
  leads: AdminLead[],
  paidOrders: { email: string | null; phone: string | null }[],
): Record<string, number> {
  const byEmail = new Map<string, number>();
  const byPhone = new Map<string, number>();
  for (const order of paidOrders) {
    const email = normalizedEmail(order.email);
    const phone = normalizedPhone(order.phone);
    if (email) byEmail.set(email, (byEmail.get(email) ?? 0) + 1);
    if (phone.length === 10) byPhone.set(phone, (byPhone.get(phone) ?? 0) + 1);
  }
  return Object.fromEntries(leads.map((lead) => {
    const emailCount = byEmail.get(normalizedEmail(lead.email)) ?? 0;
    const phone = normalizedPhone(lead.phone);
    return [lead.id, emailCount || (phone.length === 10 ? byPhone.get(phone) ?? 0 : 0)];
  }));
}

export default async function AdminPortalPage() {
  // Layouts and pages can render in parallel, so the layout redirect alone
  // must not be trusted to protect these service-role queries or their payload.
  if (!(await getAdminSession())) redirect("/admin/login");

  let orders: AdminOrder[] = [];
  let leads: AdminLead[] = [];
  let products: AdminProductHealth[] = [];
  let leadOrderCounts: Record<string, number> | null = null;
  let dataError: string | null = null;

  if (!adminConfigured()) {
    dataError = "Supabase service role is not configured for this deployment.";
  } else {
    const admin = createAdminClient();
    const [orderResult, leadResult, productResult, paidOrderResult] = await Promise.all([
      admin
        .from("orders")
        .select("id, order_number, full_name, email, phone, shipping_address, total_paise, discount_paise, shipping_paise, status, payment_method, razorpay_payment_id, courier_name, tracking_number, notes, created_at, updated_at, order_items(id, product_name, product_slug, product_image, unit_price_paise, quantity, total_paise)")
        .order("created_at", { ascending: false })
        .limit(250),
      admin
        .from("contact_messages")
        .select("id, name, email, phone, subject, message, handled, created_at")
        .order("created_at", { ascending: false })
        .limit(250),
      admin
        .from("products")
        .select("id, name, stock, is_active")
        .eq("is_active", true)
        .order("stock", { ascending: true }),
      admin
        .from("orders")
        .select("email, phone")
        .in("status", paidStatuses)
        .order("created_at", { ascending: false })
        .range(0, 999),
    ]);

    if (orderResult.error || leadResult.error || productResult.error || paidOrderResult.error) {
      console.error("[admin/dashboard]", {
        orders: orderResult.error?.message,
        leads: leadResult.error?.message,
        products: productResult.error?.message,
        leadOrderCounts: paidOrderResult.error?.message,
      });
      const unavailable = [
        orderResult.error ? "orders" : null,
        leadResult.error ? "leads" : null,
        productResult.error ? "stock" : null,
        paidOrderResult.error ? "lead order counts" : null,
      ].filter(Boolean);
      dataError = `${unavailable.join(", ")} could not sync. Update the Supabase credentials, then refresh.`;
    }
    orders = (orderResult.data ?? []) as unknown as AdminOrder[];
    leads = (leadResult.data ?? []) as AdminLead[];
    products = (productResult.data ?? []) as AdminProductHealth[];

    if (!paidOrderResult.error) {
      const paidOrders = [...(paidOrderResult.data ?? [])];
      let countQueryFailed = false;
      // Supabase caps each response. Continue until the entire paid-order history is counted.
      for (let from = 1000; paidOrders.length === from; from += 1000) {
        const page = await admin
          .from("orders")
          .select("email, phone")
          .in("status", paidStatuses)
          .order("created_at", { ascending: false })
          .range(from, from + 999);
        if (page.error) {
          console.error("[admin/dashboard] lead order counts", page.error.message);
          dataError = "Lead order counts could not fully sync. Refresh to try again.";
          countQueryFailed = true;
          break;
        }
        paidOrders.push(...(page.data ?? []));
        if ((page.data?.length ?? 0) < 1000) break;
      }
      if (!countQueryFailed) leadOrderCounts = countLeadOrders(leads, paidOrders);
    }
  }

  const syncedAt = new Date().toISOString();

  return (
    <AdminDashboard
      key={syncedAt}
      initialOrders={orders}
      initialLeads={leads}
      leadOrderCounts={leadOrderCounts}
      products={products}
      dataError={dataError}
      syncedAt={syncedAt}
    />
  );
}
