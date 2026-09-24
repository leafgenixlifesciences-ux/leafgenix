"use client";

import type { CartLine } from "@/lib/types";
import { MAX_QTY_PER_LINE } from "@/lib/shipping";

/**
 * Cart state as a small external store, consumed via useSyncExternalStore.
 *
 * Why not useState + useEffect? The cart's source of truth is localStorage -
 * an external system. useSyncExternalStore is React's intended primitive for
 * that: the server snapshot renders an empty cart (matching SSR HTML), the
 * client snapshot hydrates from storage on first client render, and the
 * subscribe channel doubles as cross-tab sync. No effects, no cascading
 * renders, no hydration mismatch.
 *
 * Storage holds only what the UI needs to draw a line. It is never trusted for
 * money: `syncFromServer` refreshes price and stock from the database on every
 * mount, and the order route re-prices from Postgres regardless.
 */

const STORAGE_KEY = "leafgenix.cart.v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

/* ------------------------------------------------------------------ */

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    // M.R.P. is what the offer prices against, so a line without a usable one
    // is dropped rather than silently priced as NaN.
    typeof v.mrpPaise === "number" &&
    Number.isFinite(v.mrpPaise) &&
    v.mrpPaise > 0 &&
    typeof v.quantity === "number" &&
    Number.isFinite(v.quantity) &&
    v.quantity > 0
  );
}

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isCartLine);
    return valid.length > 0 ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* private mode or quota exceeded - cart simply won't survive reloads */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function setLines(next: CartLine[]) {
  lines = next;
  persist();
  emit();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  lines = readStorage();
}

/* ------------------------------------------------------------------ */

export function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);

  // Cross-tab sync: another tab writing the cart updates this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      lines = readStorage();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartLine[] {
  ensureHydrated();
  return lines;
}

export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

/* ------------------------- actions ------------------------------- */

function ceilingFor(stock: number): number {
  return Math.min(MAX_QTY_PER_LINE, stock > 0 ? stock : MAX_QTY_PER_LINE);
}

export function addLine(line: Omit<CartLine, "quantity">, quantity = 1) {
  ensureHydrated();
  const ceiling = ceilingFor(line.stock);
  const existing = lines.find((l) => l.slug === line.slug);

  setLines(
    existing
      ? lines.map((l) =>
          l.slug === line.slug
            ? { ...l, ...line, quantity: Math.min(ceiling, l.quantity + quantity) }
            : l,
        )
      : [...lines, { ...line, quantity: Math.min(ceiling, quantity) }],
  );
}

export function setLineQuantity(slug: string, quantity: number) {
  ensureHydrated();
  setLines(
    quantity <= 0
      ? lines.filter((l) => l.slug !== slug)
      : lines.map((l) =>
          l.slug === slug
            ? { ...l, quantity: Math.min(quantity, ceilingFor(l.stock)) }
            : l,
        ),
  );
}

export function removeLine(slug: string) {
  ensureHydrated();
  setLines(lines.filter((l) => l.slug !== slug));
}

export function clearCart() {
  ensureHydrated();
  setLines(EMPTY);
}

/** What /api/cart hands back for each slug still on sale. */
export type ServerLine = Omit<CartLine, "quantity">;

/**
 * Replace the stored copy of every line with what the database says right now.
 *
 * A slug the server did not return is no longer on sale, so it leaves the bag
 * rather than sitting there priced from memory and failing at checkout. A
 * quantity above current stock is clamped down.
 */
export function syncFromServer(fresh: ServerLine[]) {
  ensureHydrated();
  if (lines.length === 0) return;

  const bySlug = new Map(fresh.map((p) => [p.slug, p]));
  const next: CartLine[] = [];
  let changed = false;

  for (const line of lines) {
    const server = bySlug.get(line.slug);
    if (!server) {
      changed = true; // delisted or sold through - drop it
      continue;
    }

    const quantity = Math.min(line.quantity, ceilingFor(server.stock));
    const merged: CartLine = { ...line, ...server, quantity };

    if (
      merged.mrpPaise !== line.mrpPaise ||
      merged.stock !== line.stock ||
      merged.name !== line.name ||
      merged.image !== line.image ||
      merged.packSize !== line.packSize ||
      merged.quantity !== line.quantity
    ) {
      changed = true;
    }
    next.push(merged);
  }

  if (changed) setLines(next);
}
