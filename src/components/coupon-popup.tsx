"use client";

import { BadgeCheck, Check, Copy, Gift, Leaf, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart-provider";
import { COUPON } from "@/lib/offer";
import { LAUNCH_AT_MS, launchHasPassed } from "@/lib/launch";

const DISMISSED_KEY = "leafgenix.coupon.dismissed.v2";

export function CouponPopup() {
  const { applyCoupon, couponApplied } = useCart();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (couponApplied) return;
    try {
      if (window.sessionStorage.getItem(DISMISSED_KEY)) return;
    } catch {}

    const delay = launchHasPassed()
      ? 3500
      : Math.max(3500, LAUNCH_AT_MS - Date.now() + 3500);
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [couponApplied]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dismissRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          consent: form.get("consent") === "on",
        }),
      });
      const json = (await response.json()) as { error?: string; couponCode?: string };
      if (!response.ok || !json.couponCode) {
        throw new Error(json.error ?? "Could not issue your coupon");
      }

      applyCoupon(json.couponCode);
      setClaimedCode(json.couponCode);
      try {
        window.sessionStorage.setItem(DISMISSED_KEY, "1");
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    if (!claimedCode) return;
    await navigator.clipboard.writeText(claimedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (!open) return null;

  return (
    <div
      role="presentation"
      className="coupon-modal-in fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-[#06170f]/80 p-2 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-title"
        className="coupon-card-in relative w-full max-w-[61rem] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_42px_120px_-28px_rgba(0,0,0,.82)] sm:rounded-[2.25rem]"
      >
        <div className="grid md:min-h-[38rem] md:grid-cols-[0.94fr_1.06fr]">
          <div className="relative hidden overflow-hidden bg-brand-deep p-9 text-white md:flex md:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(184,217,59,.34),transparent_34%),radial-gradient(circle_at_100%_86%,rgba(237,148,13,.25),transparent_38%)]" />
            <div className="absolute inset-0 opacity-50 [background-image:var(--leafline)]" />

            <div className="relative flex items-center gap-2.5 text-sm font-bold text-white/85">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-lime-bright text-brand-deep">
                <Leaf className="h-5 w-5" strokeWidth={1.8} />
              </span>
              A LeafGenix welcome
            </div>

            <div className="relative mt-9">
              <h2 className="max-w-[12ch] font-display text-[2.65rem] leading-[0.98] font-extrabold tracking-[-0.045em] text-white">
                More care in your bag. Less on the bill.
              </h2>
              <p className="mt-4 max-w-[26rem] text-sm leading-relaxed text-white/70">
                Your welcome code works across our complete nutraceutical range.
              </p>
            </div>

            <div className="relative mt-7 w-[13.5rem] rotate-[-2deg] rounded-[1.35rem] border-2 border-dashed border-brand-deep/25 bg-lime-bright px-5 py-4 text-brand-deep shadow-[0_18px_40px_-18px_rgba(0,0,0,.7)]">
              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-brand-deep" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-brand-deep" />
              <p className="text-xs font-bold">Your first-order saving</p>
              <p className="font-display text-5xl leading-none font-extrabold tracking-[-0.055em]">
                10% <span className="text-xl tracking-normal">off</span>
              </p>
            </div>

            <div className="relative mt-auto h-40" aria-hidden="true">
              {[
                { src: "/products/synvit-forte-tablets-studio.png", alt: "", cls: "left-1 bottom-[-4.5rem] -rotate-6" },
                { src: "/products/probion-colostrum-probiotic-studio.png", alt: "", cls: "left-[31%] bottom-[-3.25rem] z-10" },
                { src: "/products/firtilo-f-studio.png", alt: "", cls: "right-1 bottom-[-4.5rem] rotate-6" },
              ].map((pack) => (
                <div key={pack.src} className={`absolute h-56 w-36 overflow-hidden rounded-xl bg-white shadow-[0_26px_50px_-24px_rgba(0,0,0,.9)] ring-1 ring-white/25 ${pack.cls}`}>
                  <Image src={pack.src} alt={pack.alt} fill sizes="144px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col justify-center bg-[#fbfcf8] p-4 py-5 sm:p-9 lg:p-11">
            {claimedCode ? (
              <div className="relative text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime-bright text-brand-deep shadow-[0_16px_34px_-18px_rgba(0,92,45,.75)]">
                  <Check className="h-7 w-7" strokeWidth={2.7} />
                </div>
                <p className="mt-6 text-sm font-bold text-brand">Welcome to LeafGenix</p>
                <h2 id="coupon-title" className="display-md mt-2">
                  Your 10% saving is ready.
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  It&rsquo;s already applied to this browser. We&rsquo;ve also sent the code to your email.
                </p>
                <button
                  type="button"
                  onClick={copyCode}
                  className="mt-7 flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-brand/30 bg-white px-5 py-4 text-left transition hover:border-brand"
                >
                  <span>
                    <span className="block text-xs font-bold text-muted">Your coupon code</span>
                    <span className="font-mono text-2xl font-semibold tracking-[0.12em] text-brand-deep">
                      {claimedCode}
                    </span>
                  </span>
                  {copied ? <Check className="h-5 w-5 text-brand" /> : <Copy className="h-5 w-5 text-muted" />}
                </button>
                <button type="button" onClick={dismiss} className="btn btn-primary mt-5 w-full">
                  Start shopping with 10% off
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="relative">
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-lime/25 bg-lime-bright/15 p-2.5 sm:mb-5 sm:p-3 md:hidden">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-bright font-display text-lg font-extrabold text-brand-deep">10%</span>
                  <div>
                    <p className="text-sm font-extrabold text-brand-deep">Your first-order gift</p>
                    <p className="text-xs text-muted">Valid across every nutraceutical.</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-bold text-[#7a4b06]">
                  <Sparkles className="h-3.5 w-3.5" /> A welcome worth opening
                </div>
                <h2 id="coupon-title" className="mt-4 max-w-md font-display text-[2rem] leading-[1.03] font-extrabold tracking-[-0.035em] text-brand-deep sm:text-[2.35rem]">
                  Get 10% off your first LeafGenix order.
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted sm:mt-3">
                  Share your details and we&rsquo;ll send your personal code instantly—then apply it to this browser for you.
                </p>

                <ul className="mt-5 hidden flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-body sm:flex">
                  {["Instant code", "Every nutraceutical", "No hidden conditions"].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <BadgeCheck className="h-4 w-4 text-brand" strokeWidth={2.2} /> {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-3.5">
                  <div>
                    <label className="label" htmlFor="coupon-name">Your name</label>
                    <input id="coupon-name" name="name" required autoComplete="name" className="field !bg-white" placeholder="How should we address you?" />
                  </div>
                  <div className="grid min-w-0 gap-2.5 sm:grid-cols-2 sm:gap-3.5">
                    <div className="min-w-0">
                      <label className="label" htmlFor="coupon-email">Email address</label>
                      <input id="coupon-email" name="email" type="email" required autoComplete="email" className="field !bg-white" placeholder="you@example.com" />
                    </div>
                    <div className="min-w-0">
                      <label className="label" htmlFor="coupon-phone">Mobile number</label>
                      <div className="flex w-full min-w-0">
                        <span className="grid shrink-0 place-items-center rounded-l-[0.875rem] border-[1.5px] border-r-0 border-line-strong bg-white px-3 text-sm font-semibold text-muted">+91</span>
                        <input id="coupon-phone" name="phone" required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} autoComplete="tel-national" className="field min-w-0 flex-1 rounded-l-none !bg-white" placeholder="10-digit number" />
                      </div>
                    </div>
                  </div>
                </div>

                <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[0.68rem] leading-relaxed text-muted sm:mt-4 sm:text-[0.72rem]">
                  <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
                  <span>Send me this coupon and occasional LeafGenix offers by email or phone. I can opt out anytime.</span>
                </label>

                {error && <p role="alert" className="mt-4 rounded-xl bg-alert/8 px-3 py-2 text-sm font-medium text-alert">{error}</p>}

                <div className="mt-4 grid grid-cols-[0.72fr_1.55fr] gap-2.5 sm:mt-5 sm:grid-cols-[0.8fr_1.5fr] sm:gap-3">
                  <button
                    ref={dismissRef}
                    type="button"
                    onClick={dismiss}
                    disabled={submitting}
                    className="focus-ring flex min-h-13 items-center justify-center rounded-2xl border-[1.5px] border-brand/30 bg-white px-3 py-3 text-sm font-extrabold text-brand-deep transition hover:border-brand hover:bg-brand-soft disabled:cursor-wait disabled:opacity-50 sm:min-h-14 sm:px-5 sm:text-base"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="group relative flex min-h-13 min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-brand-deep px-3 py-3 text-sm font-extrabold text-white shadow-[0_18px_36px_-20px_rgba(0,60,35,.85)] transition hover:-translate-y-0.5 hover:bg-brand disabled:cursor-wait disabled:opacity-65 sm:min-h-14 sm:gap-2 sm:px-5 sm:py-4 sm:text-base">
                    {submitting ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : <Gift className="h-5 w-5 shrink-0 text-lime-bright" />}
                    <span className="sm:hidden">{submitting ? "Preparing…" : `Get ${COUPON.label}`}</span>
                    <span className="hidden sm:inline">{submitting ? "Preparing your code…" : `Send my ${COUPON.label} code`}</span>
                  </button>
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.68rem] text-faint">
                  <ShieldCheck className="h-3.5 w-3.5" /> Your details stay private. One coupon per customer.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
