import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/admin-auth";
import type { AdminCampaign, AdminCoupon, AdminLead, AdminOrder, AdminProductHealth } from "@/lib/admin-types";
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
  let coupons: AdminCoupon[] = [];
  let subscriberCount = 0;
  let latestCampaign: AdminCampaign | null = null;
  let leadOrderCounts: Record<string, number> | null = null;
  let dataError: string | null = null;

  if (!adminConfigured()) {
    dataError = "Supabase service role is not configured for this deployment.";
  } else {
    const admin = createAdminClient();
    const [orderResult, leadResult, productResult, paidOrderResult, couponResult, subscriberResult, campaignResult] = await Promise.all([
      admin
        .from("orders")
        .select("id, order_number, full_name, email, phone, shipping_address, total_paise, discount_paise, shipping_paise, status, payment_method, razorpay_payment_id, courier_name, tracking_number, notes, created_at, updated_at, order_items(id, product_name, product_slug, product_image, unit_price_paise, quantity, total_paise)")
        .order("created_at", { ascending: false })
        .range(0, 999),
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
        .select("email, phone, coupon_code, discount_paise, total_paise")
        .in("status", paidStatuses)
        .order("created_at", { ascending: false })
        .range(0, 999),
      admin.from("coupons").select("code, discount_percent, active, expires_at, created_at")
        .order("created_at", { ascending: false }).limit(250),
      admin.from("marketing_subscribers").select("email", { count: "exact", head: true })
        .is("unsubscribed_at", null),
      admin.from("marketing_campaigns").select("id, subject, body, created_at")
        .order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (orderResult.error || leadResult.error || productResult.error || paidOrderResult.error || couponResult.error || subscriberResult.error || campaignResult.error) {
      console.error("[admin/dashboard]", {
        orders: orderResult.error?.message,
        leads: leadResult.error?.message,
        products: productResult.error?.message,
        leadOrderCounts: paidOrderResult.error?.message,
        coupons: couponResult.error?.message,
        marketingSubscribers: subscriberResult.error?.message,
        campaign: campaignResult.error?.message,
      });
      const unavailable = [
        orderResult.error ? "orders" : null,
        leadResult.error ? "leads" : null,
        productResult.error ? "stock" : null,
        paidOrderResult.error ? "lead order counts" : null,
        couponResult.error ? "coupons" : null,
        subscriberResult.error || campaignResult.error ? "marketing" : null,
      ].filter(Boolean);
      dataError = `${unavailable.join(", ")} could not sync. Refresh to try again.`;
    }
    orders = (orderResult.data ?? []) as unknown as AdminOrder[];
    leads = (leadResult.data ?? []) as AdminLead[];
    products = (productResult.data ?? []) as AdminProductHealth[];
    subscriberCount = subscriberResult.count ?? 0;
    for (let from = 1000; leads.length === from; from += 1000) {
      const page = await admin.from("contact_messages")
        .select("id, name, email, phone, subject, message, handled, created_at")
        .order("created_at", { ascending: false }).range(from, from + 999);
      if (page.error) { dataError = "Lead history could not fully sync. Refresh to try again."; break; }
      leads.push(...(page.data ?? []) as AdminLead[]);
      if ((page.data?.length ?? 0) < 1000) break;
    }

    if (!paidOrderResult.error) {
      const paidOrders = [...(paidOrderResult.data ?? [])];
      let countQueryFailed = false;
      // Supabase caps each response. Continue until the entire paid-order history is counted.
      for (let from = 1000; paidOrders.length === from; from += 1000) {
        const page = await admin
          .from("orders")
          .select("email, phone, coupon_code, discount_paise, total_paise")
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
      if (!countQueryFailed) {
        leadOrderCounts = countLeadOrders(leads, paidOrders);
        const couponTotals = new Map<string, { redemptions: number; discount_paise: number; revenue_paise: number; emails: Set<string> }>();
        for (const order of paidOrders) {
          if (!order.coupon_code) continue;
          const totals = couponTotals.get(order.coupon_code) ?? { redemptions: 0, discount_paise: 0, revenue_paise: 0, emails: new Set<string>() };
          totals.redemptions += 1;
          totals.emails.add(normalizedEmail(order.email));
          totals.discount_paise += order.discount_paise;
          totals.revenue_paise += order.total_paise;
          couponTotals.set(order.coupon_code, totals);
        }
        coupons = (couponResult.data ?? []).map((coupon) => {
          const totals = couponTotals.get(coupon.code);
          return { ...coupon, redemptions: totals?.redemptions ?? 0, customers: totals?.emails.size ?? 0, discount_paise: totals?.discount_paise ?? 0, revenue_paise: totals?.revenue_paise ?? 0 };
        });
      }
    }
    if (campaignResult.data) {
      const statuses = ["pending", "sent", "failed", "skipped"] as const;
      const results = await Promise.all(statuses.map((status) => admin.from("marketing_deliveries")
        .select("id", { count: "exact", head: true }).eq("campaign_id", campaignResult.data!.id).eq("status", status)));
      if (results.some((result) => result.error)) dataError = "Campaign status could not sync. Refresh to try again.";
      latestCampaign = { ...campaignResult.data, pending: results[0].count ?? 0, sent: results[1].count ?? 0, failed: results[2].count ?? 0, skipped: results[3].count ?? 0 };
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
      coupons={coupons}
      subscriberCount={subscriberCount}
      latestCampaign={latestCampaign}
      dataError={dataError}
      syncedAt={syncedAt}
    />
  );
}
