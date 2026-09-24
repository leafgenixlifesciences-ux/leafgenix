"use client";

import { couponIsValid, normalizeCouponCode } from "@/lib/offer";

const STORAGE_KEY = "leafgenix.coupon.v1";
let current: string | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return couponIsValid(value) ? normalizeCouponCode(value) : null;
  } catch {
    return null;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  current = read();
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeCoupon(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = read();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCouponSnapshot(): string | null {
  hydrate();
  return current;
}

export function getCouponServerSnapshot(): null {
  return null;
}

export function storeCoupon(code: string): boolean {
  const normalized = normalizeCouponCode(code);
  if (!couponIsValid(normalized)) return false;
  current = normalized;
  try {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  } catch {}
  emit();
  return true;
}

export function clearCoupon() {
  current = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
  emit();
}
