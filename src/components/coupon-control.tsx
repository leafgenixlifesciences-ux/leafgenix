"use client";

import { Check, Tag, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart-provider";
import { COUPON } from "@/lib/offer";

export function CouponControl({ compact = false }: { compact?: boolean }) {
  const { couponApplied, couponCode, applyCoupon, removeCoupon } = useCart();
  const [error, setError] = useState(false);
  const [code, setCode] = useState("");

  function submit() {
    const accepted = applyCoupon(code);
    setError(!accepted);
  }

  if (couponApplied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/8 px-3.5 py-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-semibold text-brand-deep">
          <Check className="h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
          <span className="truncate">{couponCode} applied · {COUPON.label}</span>
        </span>
        <button type="button" onClick={removeCoupon} className="focus-ring rounded-full p-1 text-muted hover:text-ink" aria-label="Remove coupon">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <label htmlFor={compact ? "drawer-coupon" : "order-coupon"} className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-body">
        <Tag className="h-3.5 w-3.5 text-brand" /> Have a coupon?
      </label>
      <div className="flex gap-2">
        <input id={compact ? "drawer-coupon" : "order-coupon"} name="coupon" autoComplete="off" className="field min-w-0 py-2.5 font-mono uppercase" placeholder="Enter code" value={code} onChange={(event) => { setCode(event.target.value); setError(false); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submit(); } }} />
        <button type="button" onClick={submit} className="btn btn-outline shrink-0 px-4">Apply</button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-alert">That coupon code isn&rsquo;t valid.</p>}
    </div>
  );
}
