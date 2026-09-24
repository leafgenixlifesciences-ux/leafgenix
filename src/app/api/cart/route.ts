import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductsBySlugs } from "@/lib/queries";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  slugs: z.array(z.string().min(1).max(120)).max(20),
});

/**
 * Authoritative price, stock and naming for the slugs the browser is holding.
 *
 * The bag is kept in localStorage, so its copy of `mrp_paise` and `stock` is
 * however old the customer's last visit was. Without this the cart, the drawer
 * and the "Pay X" button would quote a price the server no longer honours -
 * the charge itself was always correct, but the number on screen was not.
 *
 * Reads only public, RLS-visible product rows. Nothing here is a secret.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`cart:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, "Too many requests.");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const slugs = [...new Set(parsed.data.slugs)];
  if (slugs.length === 0) return NextResponse.json({ products: [] });

  const products = await getProductsBySlugs(slugs);

  return NextResponse.json({
    products: products.map((p) => ({
      slug: p.slug,
      id: p.id,
      name: p.name,
      image: p.image_url,
      mrpPaise: p.mrp_paise,
      packSize: p.pack_size,
      stock: p.stock,
    })),
  });
}
