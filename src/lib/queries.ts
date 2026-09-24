import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import type { Product, OrderWithItems, RxProduct } from "@/lib/types";
import localProductsJson from "../../data/products.json";

/* ------------------------------------------------------------------ *
 * Catalogue
 *
 * Product and Rx rows are public under RLS (`is_active = true`) and are
 * byte-identical for every visitor, so they are read with a cookie-free
 * anon client and cached process-wide. Without this every page view -
 * including the four static policy pages, which render the footer -
 * cost a Supabase round trip.
 *
 * CATALOGUE_TTL is deliberately short: `stock` lives on these rows, and
 * checkout re-reads stock live from the database anyway, so a stale
 * "in stock" badge is the worst this can produce. Call
 * `revalidateTag("catalogue")` after editing products to clear it at once.
 * ------------------------------------------------------------------ */

const CATALOGUE_TTL = 120; // seconds
const CATALOGUE_TAG = "catalogue";

/**
 * Keep the public catalogue usable in local development and during a brief
 * Supabase outage. The JSON file is the checked-in catalogue source used by
 * the project, including its local /public product images.
 */
const localProducts = (localProductsJson as unknown as Product[])
  .filter((product) => product.is_active)
  .sort((a, b) => a.sort_order - b.sort_order);

function localProductBySlug(slug: string) {
  return localProducts.find((product) => product.slug === slug) ?? null;
}

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[queries] getProducts:", error.message);
      return localProducts;
    }
    return (data ?? []) as Product[];
  },
  ["products:all:local-fallback-v1"],
  { revalidate: CATALOGUE_TTL, tags: [CATALOGUE_TAG] },
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 4): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[queries] getFeaturedProducts:", error.message);
      return localProducts.filter((product) => product.is_featured).slice(0, limit);
    }
    return (data ?? []) as Product[];
  },
  ["products:featured:local-fallback-v1"],
  { revalidate: CATALOGUE_TTL, tags: [CATALOGUE_TAG] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[queries] getProductBySlug:", error.message);
      return localProductBySlug(slug);
    }
    return data ? (data as unknown as Product) : null;
  },
  ["products:by-slug:local-fallback-v1"],
  { revalidate: CATALOGUE_TTL, tags: [CATALOGUE_TAG] },
);

export const getRelatedProducts = unstable_cache(
  async (slug: string, limit = 3): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .neq("slug", slug)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[queries] getRelatedProducts:", error.message);
      return localProducts.filter((product) => product.slug !== slug).slice(0, limit);
    }
    return (data ?? []) as Product[];
  },
  ["products:related:local-fallback-v1"],
  { revalidate: CATALOGUE_TTL, tags: [CATALOGUE_TAG] },
);

/**
 * Authoritative price and stock for a set of slugs.
 *
 * The bag lives in localStorage and can be days old, so the cart hydrates
 * itself against this before showing a total. Deliberately uncached: a stale
 * price here is a price the customer is quoted.
 */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("slug", slugs)
    .eq("is_active", true);

  if (error) {
    console.error("[queries] getProductsBySlugs:", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}

/** The prescription range. Listed for information only - these are never
 *  sold through the site, so they live in their own table with no price. */
export const getRxProducts = unstable_cache(
  async (): Promise<RxProduct[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("rx_products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[queries] getRxProducts:", error.message);
      return [];
    }
    return (data ?? []) as RxProduct[];
  },
  ["rx-products:all"],
  { revalidate: CATALOGUE_TTL, tags: [CATALOGUE_TAG] },
);

/* ------------------------------------------------------------------ *
 * Orders
 * ------------------------------------------------------------------ */

/**
 * One order, for the confirmation page.
 *
 * Guest orders have no `user_id`, so RLS cannot express "the person holding
 * the link"; the row is read with the service role and the v4 UUID in the URL
 * is what keeps it unguessable.
 *
 * An order that DOES belong to an account is a different matter - it should
 * not stay readable to anyone who ever saw the link (a shared machine, a
 * pasted URL, a browser-history export). So once `user_id` is set, the caller
 * has to be that user.
 */
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  if (!adminConfigured()) {
    console.error("[queries] getOrderById: SUPABASE_SERVICE_ROLE_KEY is not set");
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[queries] getOrderById:", error.message);
    return null;
  }

  const order = (data as OrderWithItems) ?? null;
  if (!order) return null;

  if (order.user_id) {
    const user = await getSessionUser();
    if (user?.id !== order.user_id) return null;
  }

  return order;
}

/** Order history for the /account page. Scoped to the signed-in user by RLS. */
export async function getMyOrders(): Promise<OrderWithItems[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[queries] getMyOrders:", error.message);
    return [];
  }
  return (data ?? []) as OrderWithItems[];
}
