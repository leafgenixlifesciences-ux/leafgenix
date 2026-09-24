"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CouponControl } from "@/components/coupon-control";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPaise } from "@/lib/money";
import { couponPricePaise } from "@/lib/offer";
import { amountToFreeShipping, FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/shipping";

export function CartDrawer() {
  const {
    isOpen,
    close,
    lines,
    discountPaise,
    subtotalPaise,
    shippingPaise,
    totalPaise,
    couponCode,
    couponApplied,
    setQuantity,
    remove,
  } = useCart();

  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  // A dialog you cannot leave with Escape is not a dialog. Bound to the
  // document so it works wherever focus happens to be.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Move focus into the panel on open and hand it back to whatever opened it
  // on close, so a keyboard user is not dropped at the top of the document.
  useEffect(() => {
    if (isOpen) {
      returnFocusTo.current = document.activeElement as HTMLElement | null;
      closeButtonRef.current?.focus();
      return;
    }
    returnFocusTo.current?.focus?.();
    returnFocusTo.current = null;
  }, [isOpen]);

  // Keep Tab inside the panel while it is open.
  function onKeyDownTrap(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const toFree = amountToFreeShipping(subtotalPaise);
  const progress = Math.min(
    100,
    Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 100),
  );

  return (
    <>
      {/* scrim */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[70] bg-ink/35 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* The panel stays mounted so it can animate, which means that when it is
          closed its links and buttons are still in the accessibility tree and
          still reachable with Tab - a keyboard user tabs into an invisible
          drawer. `inert` takes the whole subtree out of the tab order and out
          of the accessibility tree until it is actually open. */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        inert={!isOpen}
        onKeyDown={onKeyDownTrap}
        className={`fixed top-0 right-0 z-[71] flex h-dvh w-full max-w-[27rem] flex-col bg-white shadow-[-24px_0_60px_-30px_rgba(15,31,24,0.45)] transition-transform duration-[600ms] [transition-timing-function:var(--ease-out-expo)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
            <h2 className="text-sm font-medium tracking-[0.02em]">
              Your bag
              {lines.length > 0 && (
                <span className="ml-1.5 text-faint">({lines.length})</span>
              )}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close bag"
            className="focus-ring grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-surface"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-surface-2">
              <ShoppingBag className="h-6 w-6 text-faint" strokeWidth={1.4} />
            </div>
            <div>
              <p className="display-md">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted">
                Every formulation, every quantity printed.
              </p>
            </div>
            <Link href="/products" onClick={close} className="btn btn-primary">
              Browse the range
            </Link>
          </div>
        ) : (
          <>
            {/* free-shipping meter */}
            <div className="border-b border-line px-6 py-4">
              <p className="text-xs text-body">
                {toFree > 0 ? (
                  <>
                    <span className="font-medium text-brand">
                      {formatPaise(toFree)}
                    </span>{" "}
                    away from free delivery
                  </>
                ) : (
                  <span className="font-medium text-brand">
                    ✦ Free delivery unlocked
                  </span>
                )}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-700 [transition-timing-function:var(--ease-out-expo)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-4 py-5">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={close}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${line.slug}`}
                          onClick={close}
                          className="block truncate font-semibold text-[1.0625rem] leading-tight hover:text-brand"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">
                          {line.packSize}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(line.slug)}
                        aria-label={`Remove ${line.name}`}
                        className="mt-0.5 text-faint transition-colors hover:text-alert"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper
                        size="sm"
                        value={line.quantity}
                        max={line.stock}
                        onChange={(n) => setQuantity(line.slug, n)}
                        label={`Quantity for ${line.name}`}
                      />
                      <span className="flex items-baseline gap-1.5 text-sm font-medium tabular-nums">
                        {couponApplied && (
                          <span className="strike text-xs font-normal text-faint">
                            {formatPaise(line.mrpPaise * line.quantity)}
                          </span>
                        )}
                        {formatPaise(
                          couponPricePaise(line.mrpPaise, couponCode) * line.quantity,
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line bg-white px-6 pt-5 pb-6">
              <dl className="space-y-2 text-sm">
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
                <div className="rule my-3" />
                <div className="flex items-baseline justify-between">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-semibold text-2xl tabular-nums">
                    {formatPaise(totalPaise)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3"><CouponControl compact /></div>

              {discountPaise > 0 && (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-deep">
                  <Tag className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2} />
                  <span>
                    Coupon {couponCode} saves you{" "}
                    <span className="tabular-nums">{formatPaise(discountPaise)}</span>
                  </span>
                </p>
              )}

              <Link
                href="/checkout"
                onClick={close}
                className="btn btn-primary mt-5 w-full"
              >
                Checkout
              </Link>
              <p className="mt-3 text-center text-[0.6875rem] text-faint">
                Inclusive of all taxes · Secure payments by Razorpay
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
