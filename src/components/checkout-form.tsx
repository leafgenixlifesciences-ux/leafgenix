"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, Loader2, Lock, ShieldCheck, Tag } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { CouponControl } from "@/components/coupon-control";
import { formatPaise } from "@/lib/money";
import { couponPricePaise } from "@/lib/offer";
import { amountToFreeShipping } from "@/lib/shipping";
import { INDIAN_STATES } from "@/lib/validation";
import type { RazorpayFailure, RazorpaySuccess } from "@/types/razorpay";

type Defaults = {
  fullName?: string;
  email?: string;
  phone?: string;
};

type Stage = "idle" | "creating" | "paying" | "verifying" | "done";

export function CheckoutForm({
  defaults,
  paymentsEnabled,
  signedIn,
}: {
  defaults: Defaults;
  paymentsEnabled: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const {
    lines,
    discountPaise,
    subtotalPaise,
    shippingPaise,
    totalPaise,
    couponCode,
    couponApplied,
    ready,
    clear,
  } = useCart();

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = stage !== "idle" && stage !== "done";
  const empty = ready && lines.length === 0;
  const toFree = amountToFreeShipping(subtotalPaise);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!paymentsEnabled) {
      setError(
        "Payments are not switched on yet. Add your Razorpay keys to .env.local and restart the server.",
      );
      return;
    }
    if (typeof window === "undefined" || !window.Razorpay) {
      setError(
        "The payment window could not load. Check your connection or disable any ad-blocker, then try again.",
      );
      return;
    }

    const fd = new FormData(event.currentTarget);
    const body = {
      fullName: String(fd.get("fullName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: {
        line1: String(fd.get("line1") ?? ""),
        line2: String(fd.get("line2") ?? ""),
        city: String(fd.get("city") ?? ""),
        state: String(fd.get("state") ?? ""),
        pincode: String(fd.get("pincode") ?? ""),
        country: "India",
      },
      notes: String(fd.get("notes") ?? ""),
      couponCode: couponCode ?? "",
      items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
    };

    setStage("creating");

    let created: {
      orderId: string;
      orderNumber: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      keyId: string;
      name: string;
      description: string;
      prefill: { name: string; email: string; contact: string };
    };

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start the order");
      created = json;
    } catch (err) {
      setStage("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return;
    }

    setStage("paying");

    const rzp = new window.Razorpay({
      key: created.keyId,
      amount: created.amount,
      currency: created.currency,
      name: created.name,
      description: created.description,
      order_id: created.razorpayOrderId,
      prefill: created.prefill,
      notes: { order_number: created.orderNumber },
      theme: { color: "#005c2d", backdrop_color: "rgba(15,29,22,0.72)" },
      retry: { enabled: false },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          setStage("idle");
          setError(
            "Payment window closed. Your order is saved — you can pay again whenever you're ready.",
          );
        },
      },
      handler: async (response: RazorpaySuccess) => {
        setStage("verifying");
        try {
          const res = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: created.orderId, ...response }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Verification failed");

          setStage("done");
          clear();
          router.push(`/order/${created.orderId}`);
        } catch (err) {
          setStage("idle");
          setError(
            err instanceof Error
              ? `${err.message} Your payment reference is ${response.razorpay_payment_id}.`
              : "We could not confirm the payment.",
          );
        }
      },
    });

    rzp.on("payment.failed", (response: RazorpayFailure) => {
      setStage("idle");
      setError(
        response.error?.description ??
          "The payment did not go through. No money has been deducted.",
      );
    });

    rzp.open();
  }

  if (empty) {
    return (
      <div className="card px-8 py-24 text-center">
        <h2 className="display-md">Nothing to check out</h2>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] text-muted">
          Add a formulation to your bag and come back.
        </p>
        <Link href="/products" className="btn btn-primary mt-8">
          Browse the range
        </Link>
      </div>
    );
  }

  const stageLabel =
    stage === "creating"
      ? "Preparing your order…"
      : stage === "paying"
        ? "Waiting for payment…"
        : stage === "verifying"
          ? "Confirming payment…"
          : stage === "done"
            ? "Done — redirecting…"
            : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14"
    >
      <div className="space-y-10">
        {!paymentsEnabled && (
          <div className="flex gap-3 rounded-xl border border-alert/35 bg-alert/8 p-4 text-sm text-body">
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-alert"
              strokeWidth={1.8}
            />
            <p>
              <span className="font-medium">Payments are in setup mode.</span>{" "}
              Add <code className="num text-xs">RAZORPAY_KEY_ID</code> and{" "}
              <code className="num text-xs">RAZORPAY_KEY_SECRET</code> to{" "}
              <code className="num text-xs">.env.local</code>, then restart the
              server. Everything else on this page works already.
            </p>
          </div>
        )}

        {/* ---- contact ---- */}
        <fieldset disabled={busy} className="disabled:opacity-60">
          <legend className="sr-only">Contact details</legend>
          <div className="flex items-baseline justify-between">
            <h2 className="display-md">Contact</h2>
            {!signedIn && (
              <Link
                href="/login?next=/checkout"
                className="text-sm text-brand underline underline-offset-4 hover:text-brand"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                defaultValue={defaults.fullName}
                placeholder="Your name as on the delivery address"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={defaults.email}
                placeholder="you@example.com"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Mobile number
              </label>
              <div className="flex">
                <span className="grid shrink-0 place-items-center rounded-l-xl border border-r-0 border-line-strong bg-surface-2 px-3 text-sm text-muted">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  required
                  autoComplete="tel-national"
                  maxLength={10}
                  defaultValue={defaults.phone}
                  placeholder="98765 43210"
                  className="field rounded-l-none"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* ---- address ---- */}
        <fieldset disabled={busy} className="disabled:opacity-60">
          <legend className="sr-only">Delivery address</legend>
          <h2 className="display-md">Delivery address</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="line1">
                House / flat, building, street
              </label>
              <input
                id="line1"
                name="line1"
                required
                autoComplete="address-line1"
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="line2">
                Area, landmark{" "}
                <span className="font-normal text-faint">(optional)</span>
              </label>
              <input
                id="line2"
                name="line2"
                autoComplete="address-line2"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="city">
                City
              </label>
              <input
                id="city"
                name="city"
                required
                autoComplete="address-level2"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="state">
                State
              </label>
              <select
                id="state"
                name="state"
                required
                autoComplete="address-level1"
                defaultValue=""
                className="field appearance-none"
              >
                <option value="" disabled>
                  Select a state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pincode">
                PIN code
              </label>
              <input
                id="pincode"
                name="pincode"
                inputMode="numeric"
                maxLength={6}
                required
                autoComplete="postal-code"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="country">
                Country
              </label>
              <input
                id="country"
                value="India"
                readOnly
                className="field cursor-not-allowed bg-surface-2 text-muted"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Delivery notes{" "}
                <span className="font-normal text-faint">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={500}
                placeholder="Gate code, preferred time, anything our courier should know."
                className="field resize-none"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-faint">
            We ship across India. Deliveries outside India are not available at
            the moment.
          </p>
        </fieldset>
      </div>

      {/* ---- summary ---- */}
      <aside className="card sticky top-[calc(var(--header-h)+1.5rem)] p-7">
        <h2 className="display-md">Order summary</h2>

        <ul className="mt-6 space-y-4">
          {lines.map((line) => (
            <li key={line.slug} className="flex gap-3.5">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                {line.image && (
                  <Image
                    src={line.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
                <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-[0.625rem] font-semibold text-white tabular-nums">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.name}</p>
                <p className="text-xs text-muted">{line.packSize}</p>
              </div>
              <span className="text-right text-sm tabular-nums">
                {formatPaise(couponPricePaise(line.mrpPaise, couponCode) * line.quantity)}
                {couponApplied && (
                  <span className="strike block text-[0.6875rem] text-faint">
                    {formatPaise(line.mrpPaise * line.quantity)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="rule my-6" />

        <dl className="space-y-3 text-sm">
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
            <dt className="font-medium">Total payable</dt>
            <dd className="font-semibold text-3xl tabular-nums">
              {formatPaise(totalPaise)}
            </dd>
          </div>
        </dl>

        <CouponControl />

        {discountPaise > 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2.5 text-[0.8125rem] font-semibold text-brand-deep">
            <Tag className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
            <span>
              Coupon {couponCode} saves you{" "}
              <span className="tabular-nums">{formatPaise(discountPaise)}</span>
            </span>
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 flex gap-2.5 rounded-xl border border-alert/35 bg-alert/8 p-3.5 text-sm text-body"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-alert"
              strokeWidth={1.8}
            />
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              {stageLabel}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" strokeWidth={1.8} />
              Pay {formatPaise(totalPaise)}
            </>
          )}
        </button>

        <p className="mt-4 flex items-start gap-2 text-[0.6875rem] leading-relaxed text-muted">
          <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
          Payments are processed by Razorpay over an encrypted connection. We
          never see or store your card details. UPI, cards, net banking and
          wallets accepted.
        </p>

        <Link
          href="/cart"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          Edit bag
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
        </Link>
      </aside>
    </form>
  );
}
