"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CouponControl } from "@/components/coupon-control";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPaise } from "@/lib/money";
import { amountToFreeShipping } from "@/lib/shipping";
import { couponPricePaise } from "@/lib/offer";

export function CartView() {
  const {
    lines,
    ready,
    discountPaise,
    subtotalPaise,
    shippingPaise,
    totalPaise,
    couponCode,
    couponApplied,
    setQuantity,
    remove,
  } = useCart();

  if (!ready) {
    return (
      <div className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-[var(--radius-card)] bg-surface-2"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card px-8 py-24 text-center">
        <h2 className="display-md">Your bag is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] text-muted">
          Every formulation dosed with reference to published research.
          Start wherever you like.
        </p>
        <Link href="/products" className="btn btn-primary mt-8">
          Browse the range
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  const toFree = amountToFreeShipping(subtotalPaise);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => (
          <li key={line.slug} className="flex gap-5 py-7">
            <Link
              href={`/products/${line.slug}`}
              className="relative h-32 w-26 shrink-0 overflow-hidden rounded-xl border border-line bg-surface sm:h-36 sm:w-30"
              style={{ width: "6.5rem" }}
            >
              {line.image && (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="110px"
                  className="object-cover"
                />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-xl leading-tight">
                    <Link
                      href={`/products/${line.slug}`}
                      className="transition-colors hover:text-brand"
                    >
                      {line.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-muted">{line.packSize}</p>
                  <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm tabular-nums">
                    <span className="font-medium text-body">
                      {formatPaise(couponPricePaise(line.mrpPaise, couponCode))} each
                    </span>
                    {couponApplied && (
                      <span className="strike text-xs text-faint">
                        {formatPaise(line.mrpPaise)}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => remove(line.slug)}
                  aria-label={`Remove ${line.name}`}
                  className="text-faint transition-colors hover:text-alert"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4">
                <QuantityStepper
                  value={line.quantity}
                  max={line.stock}
                  onChange={(n) => setQuantity(line.slug, n)}
                  label={`Quantity for ${line.name}`}
                />
                <span className="font-semibold text-lg tabular-nums">
                  {formatPaise(couponPricePaise(line.mrpPaise, couponCode) * line.quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card sticky top-[calc(var(--header-h)+1.5rem)] p-7">
        <h2 className="display-md">Summary</h2>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatPaise(subtotalPaise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="tabular-nums">
              {shippingPaise === 0 ? (
                <span className="text-brand">Free</span>
              ) : (
                formatPaise(shippingPaise)
              )}
            </dd>
          </div>
          {toFree > 0 && (
            <p className="rounded-lg bg-accent/15 px-3 py-2.5 text-xs text-brand">
              Add {formatPaise(toFree)} more for free delivery.
            </p>
          )}
          <div className="rule my-4" />
          <div className="flex items-baseline justify-between">
            <dt className="font-medium">Total</dt>
            <dd className="font-semibold text-3xl tabular-nums">
              {formatPaise(totalPaise)}
            </dd>
          </div>
        </dl>

        <p className="mt-1 text-xs text-faint">Inclusive of all taxes</p>

        <CouponControl />

        {discountPaise > 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2.5 text-[0.8125rem] font-semibold text-brand-deep">
            <Tag className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
            <span>
              You save{" "}
              <span className="tabular-nums">{formatPaise(discountPaise)}</span> on this
              order with coupon {couponCode}.
            </span>
          </p>
        )}

        <Link href="/checkout" className="btn btn-primary mt-6 w-full">
          Proceed to checkout
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>

        <Link
          href="/products"
          className="mt-4 block text-center text-sm text-muted transition-colors hover:text-ink"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
