import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Absolute URL for a site-relative path.
 *
 * Product images live in /public today but `next.config.ts` already
 * anticipates moving them to Supabase Storage. A path that is already absolute
 * is returned untouched, so structured data and OG tags do not turn into
 * "https://leafgenix.in/https://xyz.supabase.co/..." the day that happens.
 */
export function siteUrl(path = "") {
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) return path;

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://leafgenix.in";

  return `${base}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

/** Business-day ETA used on the PDP and order confirmation. */
export function deliveryWindow(from = new Date()) {
  const add = (d: number) => {
    const out = new Date(from);
    out.setDate(out.getDate() + d);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(out);
  };
  return `${add(3)} – ${add(6)}`;
}
