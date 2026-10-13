import { AdminDashboard } from "@/components/admin-dashboard";
import type { AdminLead, AdminOrder, AdminProductHealth } from "@/lib/admin-types";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  let orders: AdminOrder[] = [];
  let leads: AdminLead[] = [];
  let products: AdminProductHealth[] = [];
  let dataError: string | null = null;

  if (!adminConfigured()) {
    dataError = "Supabase service role is not configured for this deployment.";
  } else {
    const admin = createAdminClient();
    const [orderResult, leadResult, productResult] = await Promise.all([
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
    ]);

    if (orderResult.error || leadResult.error || productResult.error) {
      console.error("[admin/dashboard]", {
        orders: orderResult.error?.message,
        leads: leadResult.error?.message,
        products: productResult.error?.message,
      });
      const unavailable = [
        orderResult.error ? "orders" : null,
        leadResult.error ? "leads" : null,
        productResult.error ? "stock" : null,
      ].filter(Boolean);
      dataError = `${unavailable.join(", ")} could not sync. Update the Supabase credentials, then refresh.`;
    }
    orders = (orderResult.data ?? []) as unknown as AdminOrder[];
    leads = (leadResult.data ?? []) as AdminLead[];
    products = (productResult.data ?? []) as AdminProductHealth[];
  }

  const syncedAt = new Date().toISOString();

  return (
    <AdminDashboard
      key={syncedAt}
      initialOrders={orders}
      initialLeads={leads}
      products={products}
      dataError={dataError}
      syncedAt={syncedAt}
    />
  );
}
