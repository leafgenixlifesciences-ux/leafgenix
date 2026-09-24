"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Truck, User, X } from "lucide-react";
import { Logo } from "@/components/brand";
import { useCart } from "@/components/cart-provider";
import { navLinks, site } from "@/lib/site";

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const { count, open, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () =>
      setScrolled((prev) => {
        const next = window.scrollY > 8;
        return prev === next ? prev : next;
      });
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* announcement strip */}
      <div className="band-forest text-white">
        <div className="shell flex h-10 items-center justify-center gap-3 text-center text-[0.75rem] font-semibold tracking-[0.01em]">
          <span className="inline-flex items-center gap-1.5 text-white/85">
            <Truck className="h-3.5 w-3.5 text-lime-bright" strokeWidth={2.2} />
            Free delivery over ₹999
          </span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/92 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled
            ? "shadow-[0_1px_0_var(--color-line),0_14px_34px_-24px_rgba(0,60,35,0.4)]"
            : "border-b border-line"
        }`}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link
            href="/"
            className="focus-ring flex shrink-0 items-center"
            aria-label={`${site.fullName} — home`}
          >
            <Logo priority className="h-10 w-auto sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring rounded-full px-4 py-2 text-[0.9375rem] font-bold transition-colors ${
                    active
                      ? "bg-brand text-white shadow-[0_10px_22px_-14px_rgba(0,92,45,0.9)]"
                      : "text-brand-deep hover:bg-surface-2 hover:text-brand"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href={signedIn ? "/account" : "/login"}
              aria-label={signedIn ? "Your account" : "Sign in"}
              className="focus-ring hidden h-11 w-11 place-items-center rounded-full border border-line text-brand-deep transition-colors hover:border-brand hover:bg-surface-2 hover:text-brand sm:grid"
            >
              <User className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.9} />
            </Link>

            <button
              onClick={open}
              aria-label={`Open bag${count ? `, ${count} items` : ""}`}
              className="focus-ring relative grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-[0_12px_24px_-14px_rgba(0,92,45,0.9)] transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.9} />
              {ready && count > 0 && (
                <span className="num absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.6875rem] font-extrabold text-[#2b1a05] ring-2 ring-white">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-line text-brand-deep transition-colors hover:bg-surface-2 lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile sheet. It collapses with max-height rather than unmounting so
            it can animate, which leaves its links tabbable while it looks
            closed - `inert` removes them from the tab order until it opens. */}
        <div
          inert={!menuOpen}
          className={`overflow-hidden border-t border-line bg-white transition-[max-height] duration-500 [transition-timing-function:var(--ease-out-expo)] lg:hidden ${
            menuOpen ? "max-h-96" : "max-h-0 border-t-transparent"
          }`}
        >
          <nav className="shell flex flex-col py-3" aria-label="Mobile">
            {[
              ...navLinks,
              {
                href: signedIn ? "/account" : "/login",
                label: signedIn ? "Your orders" : "Sign in",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line py-3.5 font-display text-[1.125rem] font-bold text-brand-deep last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
