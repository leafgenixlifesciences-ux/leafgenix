"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { CartLine } from "@/lib/types";
import { shippingFor } from "@/lib/shipping";
import { couponIsValid, priceLines } from "@/lib/offer";
import {
  clearCoupon,
  getCouponServerSnapshot,
  getCouponSnapshot,
  storeCoupon,
  subscribeCoupon,
} from "@/lib/coupon-store";
import {
  addLine,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeLine,
  setLineQuantity,
  subscribe,
  syncFromServer,
  type ServerLine,
} from "@/lib/cart-store";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  /** Sum of the line totals at M.R.P., before any coupon. */
  listTotalPaise: number;
  /** What the active coupon takes off. */
  discountPaise: number;
  /** Sum after an optional coupon. */
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  couponCode: string | null;
  couponApplied: boolean;
  /** False only during SSR/hydration — used to defer cart-dependent UI. */
  ready: boolean;
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const noopSubscribe = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Canonical hydration flag: false for the server render, true from the
  // first client render onward. No effects involved.
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const [isOpen, setIsOpen] = useState(false);
  const couponCode = useSyncExternalStore(
    subscribeCoupon,
    getCouponSnapshot,
    getCouponServerSnapshot,
  );

  // Re-price the bag against the database once per mount.
  //
  // localStorage can be days old, so without this the cart, the drawer and the
  // "Pay X" button quote a price the server may no longer honour. The charge
  // was always correct - create-order re-prices from Postgres regardless - but
  // the customer was shown a number that did not match it.
  useEffect(() => {
    const slugs = getSnapshot().map((l) => l.slug);
    if (slugs.length === 0) return;

    const controller = new AbortController();

    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { products?: ServerLine[] } | null) => {
        if (json?.products) syncFromServer(json.products);
      })
      .catch(() => {
        // Offline or blocked: keep showing the stored prices. The server still
        // re-prices at checkout, so this can only ever be cosmetic.
      });

    return () => controller.abort();
    // Runs once on mount; the bag re-reads itself through the store.
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const value = useMemo<CartContextValue>(() => {
    const { subtotalPaise, discountPaise, listTotalPaise } = priceLines(
      lines,
      couponCode,
    );
    const shippingPaise = shippingFor(subtotalPaise);

    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      listTotalPaise,
      discountPaise,
      subtotalPaise,
      shippingPaise,
      totalPaise: subtotalPaise + shippingPaise,
      couponCode,
      couponApplied: couponIsValid(couponCode),
      ready,
      isOpen,
      add: (line, quantity) => {
        addLine(line, quantity);
        setIsOpen(true);
      },
      setQuantity: setLineQuantity,
      remove: removeLine,
      clear: clearCart,
      applyCoupon: storeCoupon,
      removeCoupon: clearCoupon,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [lines, ready, isOpen, couponCode]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
