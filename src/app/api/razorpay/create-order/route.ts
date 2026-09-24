import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { razorpay, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { checkoutSchema } from "@/lib/validation";
import { shippingFor } from "@/lib/shipping";
import { couponIsValid, couponPricePaise, normalizeCouponCode } from "@/lib/offer";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // This route writes a row of customer PII and creates a live Razorpay order
  // on every call, and it is unauthenticated by design (guest checkout). Cap it
  // before anything else runs.
  const limit = rateLimit(`create-order:${clientIp(request)}`, 8, 60_000);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      "Too many checkout attempts. Please wait a moment and try again.",
    );
  }

  if (!razorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Add your Razorpay API keys to .env.local.",
      },
      { status: 503 },
    );
  }

  if (!adminConfigured()) {
    console.error("[create-order] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json(
      {
        error:
          "Orders are not configured yet. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Please check the form", field: first?.path?.join(".") },
      { status: 422 },
    );
  }

  const input = parsed.data;
  if (input.couponCode && !couponIsValid(input.couponCode)) {
    return NextResponse.json({ error: "That coupon code is not valid." }, { status: 422 });
  }
  const couponCode = couponIsValid(input.couponCode)
    ? normalizeCouponCode(input.couponCode)
    : null;
  const admin = createAdminClient();

  // ---------------------------------------------------------------
  // Re-price server-side. The browser only ever sends slugs and
  // quantities — prices come from the database, every time.
  // ---------------------------------------------------------------
  const slugs = [...new Set(input.items.map((i) => i.slug))];
  const { data: rows, error: productError } = await admin
    .from("products")
    .select("*")
    .in("slug", slugs)
    .eq("is_active", true);

  if (productError) {
    console.error("[create-order] product lookup:", productError.message);
    return NextResponse.json(
      { error: "We couldn't load your items. Please try again." },
      { status: 500 },
    );
  }

  const products = (rows ?? []) as Product[];
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines: {
    product: Product;
    quantity: number;
    /** Unit price actually charged after an optional verified coupon. */
    unitPaise: number;
    totalPaise: number;
    /** Same line at M.R.P., kept so the saving can be recorded. */
    listTotalPaise: number;
  }[] = [];

  for (const item of input.items) {
    const product = bySlug.get(item.slug);
    if (!product) {
      return NextResponse.json(
        { error: `"${item.slug}" is no longer available. Please refresh your bag.` },
        { status: 409 },
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        {
          error:
            product.stock === 0
              ? `${product.name} has just sold out.`
              : `Only ${product.stock} of ${product.name} left. Please reduce the quantity.`,
        },
        { status: 409 },
      );
    }
    // Selling price is computed here, on the server, from the database M.R.P.
    // The browser sends only a slug and a quantity, so it has no say in it.
    const unitPaise = couponPricePaise(product.mrp_paise, couponCode);
    lines.push({
      product,
      quantity: item.quantity,
      unitPaise,
      totalPaise: unitPaise * item.quantity,
      listTotalPaise: product.mrp_paise * item.quantity,
    });
  }

  const subtotalPaise = lines.reduce((sum, l) => sum + l.totalPaise, 0);
  const listTotalPaise = lines.reduce((sum, l) => sum + l.listTotalPaise, 0);
  const discountPaise = listTotalPaise - subtotalPaise;
  // Assessed on the post-coupon subtotal, as the Shipping Policy says.
  const shippingPaise = shippingFor(subtotalPaise);
  const totalPaise = subtotalPaise + shippingPaise;

  if (totalPaise < 100) {
    return NextResponse.json({ error: "Order total is too low." }, { status: 422 });
  }

  // Attach the order to a signed-in user when there is one. Shared with the
  // rest of the request, so this is not an extra round trip to Supabase.
  const user = await getSessionUser();
  const userId = user?.id ?? null;

  // ---------------------------------------------------------------
  // Persist the order first, so a payment can never exist without a
  // record on our side to reconcile it against.
  // ---------------------------------------------------------------
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      email: input.email,
      phone: input.phone,
      full_name: input.fullName,
      shipping_address: { ...input.address, country: input.address.country || "India" },
      subtotal_paise: subtotalPaise,
      shipping_paise: shippingPaise,
      discount_paise: discountPaise,
      total_paise: totalPaise,
      status: "created",
      notes: [input.notes, couponCode ? `Coupon: ${couponCode}` : ""]
        .filter(Boolean)
        .join("\n") || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("[create-order] insert order:", orderError?.message);
    return NextResponse.json(
      { error: "We couldn't start your order. Please try again." },
      { status: 500 },
    );
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name,
      product_slug: l.product.slug,
      product_image: l.product.image_url,
      unit_price_paise: l.unitPaise,
      quantity: l.quantity,
      total_paise: l.totalPaise,
    })),
  );

  if (itemsError) {
    console.error("[create-order] insert items:", itemsError.message);
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "We couldn't start your order. Please try again." },
      { status: 500 },
    );
  }

  // ---------------------------------------------------------------
  // Razorpay order
  // ---------------------------------------------------------------
  try {
    const rzpOrder = await razorpay().orders.create({
      amount: totalPaise, // paise
      currency: "INR",
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        order_number: order.order_number,
        customer: input.fullName,
        phone: input.phone,
      },
    });

    await admin
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id, status: "pending" })
      .eq("id", order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: rzpOrder.id,
      amount: totalPaise,
      currency: "INR",
      keyId: razorpayKeyId(),
      name: site.name,
      description: `${lines.length} item${lines.length > 1 ? "s" : ""} · ${order.order_number}`,
      prefill: {
        name: input.fullName,
        email: input.email,
        contact: `+91${input.phone}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-order] razorpay:", message);

    await admin
      .from("orders")
      .update({ status: "failed", failure_reason: `Razorpay order failed: ${message}` })
      .eq("id", order.id);

    return NextResponse.json(
      { error: "Payment gateway is unavailable right now. Please try again shortly." },
      { status: 502 },
    );
  }
}
