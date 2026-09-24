import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Phone,
  RotateCcw,
  Tag,
  Truck,
} from "lucide-react";

import { getOrderById } from "@/lib/queries";
import { formatPaise } from "@/lib/money";
import { formatDate, deliveryWindow } from "@/lib/utils";
import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* --------------------------------------------------------------------------
   Copy per status. `headline` is the big line on the band; `note` sits under
   it. `tone` picks the icon and the band; `stage` is the position on the
   tracker (-1 = tracker not shown because the order never went through).
   -------------------------------------------------------------------------- */
type Tone = "good" | "wait" | "bad";

const statusCopy: Record<
  OrderStatus,
  { label: string; tone: Tone; headline: string; note: string; stage: number }
> = {
  created: {
    label: "Awaiting payment",
    tone: "wait",
    headline: "Almost there.",
    note: "We have your order but haven't received a payment yet. If you closed the payment window, nothing was charged.",
    stage: 0,
  },
  pending: {
    label: "Payment in progress",
    tone: "wait",
    headline: "Your bank is confirming.",
    note: "The payment is still being confirmed. This page updates on its own once it clears — no need to pay again.",
    stage: 0,
  },
  paid: {
    label: "Payment received",
    tone: "good",
    headline: "Thank you — we've got it.",
    note: "Your payment is in and your order is with our dispatch team. Every pack goes out sealed and tamper-evident.",
    stage: 1,
  },
  processing: {
    label: "Being packed",
    tone: "good",
    headline: "Being packed right now.",
    note: "Your order is on the packing bench. You'll get the courier name and tracking number the moment it leaves.",
    stage: 1,
  },
  shipped: {
    label: "Shipped",
    tone: "good",
    headline: "It's on its way.",
    note: "Your parcel has left our facility and is with the courier.",
    stage: 2,
  },
  delivered: {
    label: "Delivered",
    tone: "good",
    headline: "Delivered. Enjoy.",
    note: "We hope it reached you in good shape. Read the label — every quantity is printed on it.",
    stage: 3,
  },
  failed: {
    label: "Payment failed",
    tone: "bad",
    headline: "That payment didn't go through.",
    note: "No money was deducted. Your bag is still saved, so you can try again whenever you like.",
    stage: -1,
  },
  cancelled: {
    label: "Cancelled",
    tone: "bad",
    headline: "This order was cancelled.",
    note: "If a payment was taken, the refund is on its way back to the original payment method.",
    stage: -1,
  },
  refunded: {
    label: "Refunded",
    tone: "wait",
    headline: "Refund on its way.",
    note: "The amount is heading back to the original payment method. Banks usually take 5–7 working days to show it.",
    stage: -1,
  },
};

const TRACK = [
  { key: "paid", label: "Payment received", icon: CreditCard },
  { key: "packed", label: "Being packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
] as const;

const PAYMENT_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  wallet: "Wallet",
  emi: "EMI",
  paylater: "Pay later",
};

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

function paymentLabel(method: string | null) {
  if (!method) return null;
  return PAYMENT_LABEL[method.toLowerCase()] ?? method;
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const order = await getOrderById(id);
  if (!order) notFound();

  const status = statusCopy[order.status];
  const paid = status.stage >= 1;
  const inTransit = order.status === "paid" || order.status === "processing" || order.status === "shipped";
  const showTracker = status.stage >= 0;
  const itemCount = order.order_items.reduce((n, i) => n + i.quantity, 0);
  const method = paymentLabel(order.payment_method);
  const eta = deliveryWindow(new Date(order.created_at));

  const HeroIcon =
    status.tone === "good" ? Check : status.tone === "wait" ? Clock : AlertCircle;

  const iconClass =
    status.tone === "good"
      ? "bg-lime-bright text-brand-deep"
      : status.tone === "wait"
        ? "bg-accent text-[#2b1a05]"
        : "bg-alert text-white";

  const stageIndex = Math.max(status.stage, 0);

  return (
    <>
      {/* ================= HERO ================= */}
      <section
        className={`${status.tone === "bad" ? "band-night" : "band-forest"} overflow-hidden`}
      >
        {status.tone !== "bad" && (
          <div className="mesh" aria-hidden="true">
            <div className="mesh__blob mesh__blob--lime" />
            <div className="mesh__blob mesh__blob--orange" />
          </div>
        )}

        <div className="shell relative z-10 grid items-center gap-12 pt-14 pb-24 md:pt-20 md:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="eyebrow-lime rise">
              Order {order.order_number} · {formatDay(order.created_at)}
            </p>
            <h1
              className="display-xl display-on-dark rise mt-5 max-w-2xl text-balance"
              style={{ animationDelay: "80ms" }}
            >
              {status.headline}
            </h1>
            <p
              className="lede lede-on-dark rise mt-6 max-w-xl"
              style={{ animationDelay: "160ms" }}
            >
              {status.note}
            </p>

            <div
              className="rise mt-8 flex flex-wrap gap-2.5"
              style={{ animationDelay: "240ms" }}
            >
              <span className="chip chip-glass">
                <Package className="h-3.5 w-3.5" strokeWidth={2} />
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              {method && paid && (
                <span className="chip chip-glass">
                  <CreditCard className="h-3.5 w-3.5" strokeWidth={2} />
                  Paid via {method}
                </span>
              )}
              <span className="chip chip-glass">
                <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                {order.shipping_paise === 0 ? "Free delivery" : `Delivery ${formatPaise(order.shipping_paise)}`}
              </span>
              {inTransit && (
                <span className="chip chip-lime">
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                  Expected {eta}
                </span>
              )}
            </div>

            <div
              className="rise mt-9 flex flex-wrap gap-3"
              style={{ animationDelay: "320ms" }}
            >
              {order.status === "failed" ? (
                <Link href="/cart" className="btn btn-accent">
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  Try the payment again
                </Link>
              ) : (
                <Link href="/products" className="btn btn-accent">
                  Continue shopping
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              )}
              <Link href="/account" className="btn btn-ghost-light">
                View all orders
              </Link>
            </div>
          </div>

          {/* the ticket */}
          <div
            className="rise relative mx-auto w-full max-w-md lg:max-w-none"
            style={{ animationDelay: "200ms" }}
          >
            {status.tone === "good" && <div className="glow-lime" aria-hidden="true" />}
            <div className="card-glass relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-extrabold tracking-[0.2em] text-white/55 uppercase">
                    Order number
                  </p>
                  <p className="num mt-2 truncate text-2xl font-semibold text-white">
                    {order.order_number}
                  </p>
                  <p className="mt-1.5 text-xs text-white/55">
                    Placed {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconClass}`}
                  aria-label={status.label}
                >
                  <HeroIcon className="h-6 w-6" strokeWidth={2.4} />
                </span>
              </div>

              {showTracker ? (
                <ol className="track mt-8">
                  {TRACK.map((step, i) => {
                    const Icon = step.icon;
                    const done = i < stageIndex || (i === stageIndex && order.status === "delivered");
                    const now = i === stageIndex && order.status !== "delivered";
                    const state = done ? "track__step--done" : now ? "track__step--now" : "";
                    const waiting = now && status.tone === "wait";
                    return (
                      <li key={step.key} className={`track__step ${state}`}>
                        <span className="track__dot">
                          {done ? (
                            <Check className="h-4 w-4" strokeWidth={3} />
                          ) : waiting ? (
                            <Clock className="h-4 w-4" strokeWidth={2.4} />
                          ) : (
                            <Icon className="h-4 w-4" strokeWidth={2.2} />
                          )}
                        </span>
                        <div className="min-w-0 pt-1">
                          <p
                            className={`text-sm font-bold ${
                              done || now ? "text-white" : "text-white/45"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.key === "paid" && now && waiting && (
                            <p className="mt-0.5 text-xs text-white/60">{status.label}</p>
                          )}
                          {step.key === "paid" && done && method && (
                            <p className="mt-0.5 text-xs text-white/60">via {method}</p>
                          )}
                          {step.key === "packed" && now && (
                            <p className="mt-0.5 text-xs text-white/60">
                              Sealed, tamper-evident packs · dispatched within 24 hours
                            </p>
                          )}
                          {step.key === "shipped" && (order.courier_name || order.tracking_number) && (
                            <p className="num mt-0.5 text-xs text-white/70">
                              {order.courier_name}
                              {order.courier_name && order.tracking_number ? " · " : ""}
                              {order.tracking_number}
                            </p>
                          )}
                          {step.key === "delivered" && !done && inTransit && (
                            <p className="mt-0.5 text-xs text-white/60">Expected {eta}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="mt-8 rounded-2xl border border-white/12 bg-white/6 p-5">
                  <p className="text-sm font-bold text-white">{status.label}</p>
                  {order.failure_reason && (
                    <p className="mt-1.5 text-sm text-white/65">{order.failure_reason}</p>
                  )}
                  {order.status === "failed" && (
                    <p className="mt-1.5 text-sm text-white/65">
                      Nothing was charged. Your bag is saved — try again from the cart.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/12 pt-6">
                <div>
                  <p className="text-[0.6875rem] font-extrabold tracking-[0.2em] text-white/55 uppercase">
                    {paid ? "Total paid" : "Order total"}
                  </p>
                  <p className="stat-num mt-2 text-3xl text-white">
                    {formatPaise(order.total_paise)}
                  </p>
                </div>
                {order.discount_paise > 0 && (
                  <div className="text-right">
                    <p className="text-[0.6875rem] font-extrabold tracking-[0.2em] text-white/55 uppercase">
                      You saved
                    </p>
                    <p className="num mt-2 text-lg font-semibold text-lime-bright">
                      {formatPaise(order.discount_paise)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="wave"
          aria-hidden="true"
          style={{ "--wave-color": "#f3f8f1" } as React.CSSProperties}
        />
      </section>

      {/* ================= DETAILS ================= */}
      <section className="band-mint">
        <div className="shell grid gap-8 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* items */}
          <Reveal>
            <div className="card card-topline overflow-hidden">
              <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-7 sm:px-8">
                <div>
                  <p className="eyebrow">In the box</p>
                  <h2 className="display-md mt-3">
                    {order.order_items.length}{" "}
                    {order.order_items.length === 1 ? "formulation" : "formulations"}
                  </h2>
                </div>
                <span className="chip chip-lime">
                  {itemCount} {itemCount === 1 ? "pack" : "packs"}
                </span>
              </div>

              <ul className="mt-6 divide-y divide-line px-6 sm:px-8">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-5 sm:gap-5">
                    <Link
                      href={`/products/${item.product_slug}`}
                      className="tile__frame relative h-24 w-20 shrink-0 focus-ring sm:h-28 sm:w-[5.75rem]"
                      aria-label={item.product_name}
                    >
                      {item.product_image && (
                        <Image
                          src={item.product_image}
                          alt=""
                          fill
                          sizes="92px"
                          className="object-contain p-2"
                        />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.product_slug}`}
                        className="display-sm block truncate transition-colors hover:text-brand"
                      >
                        {item.product_name}
                      </Link>
                      <p className="num mt-1.5 text-sm text-muted">
                        {item.quantity} × {formatPaise(item.unit_price_paise)}
                      </p>
                    </div>
                    <span className="num text-base font-semibold text-ink">
                      {formatPaise(item.total_paise)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-2 space-y-3 border-t border-line bg-surface px-6 py-6 text-sm sm:px-8">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="num">{formatPaise(order.subtotal_paise)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="num">
                    {order.shipping_paise === 0 ? (
                      <span className="font-semibold text-signal">Free</span>
                    ) : (
                      formatPaise(order.shipping_paise)
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-4">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="stat-num text-3xl text-brand-deep">
                    {formatPaise(order.total_paise)}
                  </dd>
                </div>
                <p className="text-xs text-faint">Inclusive of all taxes.</p>
              </dl>

              {order.discount_paise > 0 && (
                <div className="flex items-center gap-3 border-t border-line bg-accent/12 px-6 py-4 text-sm text-brand-deep sm:px-8">
                  <Tag className="h-4 w-4 shrink-0 text-accent-deep" strokeWidth={2.2} />
                  <p>
                    <strong>A coupon discount</strong> was applied —
                    you saved{" "}
                    <span className="num font-semibold">{formatPaise(order.discount_paise)}</span>{" "}
                    on this order.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          {/* address · payment · support */}
          <div className="grid gap-6">
            <Reveal delay={80}>
              <div className="card p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="numpill">
                    <MapPin className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <p className="eyebrow-green">Delivering to</p>
                </div>
                <address className="mt-5 text-[0.9375rem] leading-relaxed text-body not-italic">
                  <span className="block font-bold text-ink">{order.full_name}</span>
                  {order.shipping_address.line1}
                  <br />
                  {order.shipping_address.line2 && (
                    <>
                      {order.shipping_address.line2}
                      <br />
                    </>
                  )}
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  <span className="num">{order.shipping_address.pincode}</span>
                  <br />
                  {order.shipping_address.country}
                </address>
                <p className="num mt-4 border-t border-line pt-4 text-sm text-muted">
                  +91 {order.phone}
                  <br />
                  {order.email}
                </p>
              </div>
            </Reveal>

            {(order.razorpay_payment_id || method) && (
              <Reveal delay={160}>
                <div className="card p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="numpill">
                      <CreditCard className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <p className="eyebrow-green">Payment</p>
                  </div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Status</dt>
                      <dd
                        className={`font-semibold ${
                          status.tone === "good"
                            ? "text-signal"
                            : status.tone === "bad"
                              ? "text-alert"
                              : "text-body"
                        }`}
                      >
                        {status.label}
                      </dd>
                    </div>
                    {method && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Method</dt>
                        <dd className="font-semibold text-ink">{method}</dd>
                      </div>
                    )}
                    {order.razorpay_payment_id && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Payment ID</dt>
                        <dd className="num truncate text-ink">{order.razorpay_payment_id}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </Reveal>
            )}

            <Reveal delay={240}>
              <div className="card p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="numpill">
                    <MessageCircle className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <p className="eyebrow-green">Need a hand?</p>
                </div>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-body">
                  Quote order <strong className="num text-ink">{order.order_number}</strong>{" "}
                  and we&apos;ll pick it up from there.
                </p>
                <div className="mt-5 grid gap-2">
                  <a
                    href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, about my order ${order.order_number}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary justify-start"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2} />
                    WhatsApp us
                  </a>
                  <a
                    href={`mailto:${site.email}?subject=Order%20${order.order_number}`}
                    className="btn btn-outline justify-start"
                  >
                    <Mail className="h-4 w-4" strokeWidth={2} />
                    {site.email}
                  </a>
                  <a
                    href={`tel:${site.supportPhone.replace(/\s/g, "")}`}
                    className="btn btn-outline justify-start"
                  >
                    <Phone className="h-4 w-4" strokeWidth={2} />
                    {site.supportPhone}
                  </a>
                </div>
                <p className="mt-4 text-xs text-muted">{site.supportHours}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= WHAT HAPPENS NEXT ================= */}
      {inTransit && (
        <section className="shell py-16 md:py-20">
          <Reveal>
            <p className="eyebrow">What happens next</p>
            <h2 className="display-lg mt-4 max-w-2xl">
              Three steps between here and your door.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: PackageCheck,
                title: "Packed within 24 hours",
                body: "Picked from a WHO-GMP batch, sealed in tamper-evident packaging, and handed to the courier on the next working day at the latest.",
              },
              {
                n: "02",
                icon: Truck,
                title: "Tracking by email and SMS",
                body: `The courier name and tracking number land on ${order.email} and +91 ${order.phone} the moment it ships — and appear on this page too.`,
              },
              {
                n: "03",
                icon: Home,
                title: `At your door ${eta}`,
                body: "Up to three delivery attempts. If a pack arrives damaged, tell us within 7 days and we replace it.",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.n} delay={i * 90}>
                  <div className="card card-lift h-full p-7">
                    <div className="flex items-center justify-between">
                      <span className="numpill">{s.n}</span>
                      <Icon className="h-5 w-5 text-brand" strokeWidth={1.8} />
                    </div>
                    <h3 className="display-sm mt-6">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-body">{s.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <section className="shell pb-16 md:pb-20">
        <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-faint">
          Bookmark this page — the link is the permanent record of your order.
          Create an account with {order.email} and it will show up under your
          orders automatically.
        </p>
      </section>
    </>
  );
}
