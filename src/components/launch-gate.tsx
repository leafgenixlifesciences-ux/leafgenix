"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Leaf, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LAUNCH_AT_MS } from "@/lib/launch";
import { site } from "@/lib/site";

const PUBLIC_INFORMATION_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/contact", label: "Contact" },
] as const;

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingUntilLaunch(): Remaining | null {
  const distance = LAUNCH_AT_MS - Date.now();
  if (distance <= 0) return null;

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function LaunchGate({ initiallyLaunched }: { initiallyLaunched: boolean }) {
  const pathname = usePathname();
  const [remaining, setRemaining] = useState<Remaining | null>(
    initiallyLaunched ? null : { days: 0, hours: 0, minutes: 0, seconds: 0 },
  );
  const isPublicInformationPage = PUBLIC_INFORMATION_LINKS.some(({ href }) => pathname === href);
  const visible = remaining !== null && !isPublicInformationPage;

  useEffect(() => {
    if (initiallyLaunched) return;

    const update = () => setRemaining(remainingUntilLaunch());
    update();
    const timer = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [initiallyLaunched]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const countdown = useMemo(
    () => [
      [remaining?.days ?? 0, "Days"],
      [remaining?.hours ?? 0, "Hours"],
      [remaining?.minutes ?? 0, "Minutes"],
      [remaining?.seconds ?? 0, "Seconds"],
    ] as const,
    [remaining],
  );

  if (!remaining || isPublicInformationPage) return null;

  return (
    <section className="launch-gate" aria-labelledby="launch-title">
      <div className="launch-gate__grain" aria-hidden="true" />
      <div className="launch-gate__orb launch-gate__orb--lime" aria-hidden="true" />
      <div className="launch-gate__orb launch-gate__orb--orange" aria-hidden="true" />

      <div className="launch-gate__shell">
        <header className="launch-gate__header">
          <Image
            src="/leafgenix-lockup.png"
            alt={`${site.fullName} — ${site.tagline}`}
            width={240}
            height={84}
            priority
            className="h-auto w-[11.5rem] brightness-0 invert sm:w-[13rem]"
          />
          <p className="launch-gate__date">
            <span className="launch-gate__pulse" />
            Opening 25 September 2026 · 12:00 AM IST
          </p>
        </header>

        <main className="launch-gate__body">
          <div className="launch-gate__leaf-ring" aria-hidden="true" />

          <div className="launch-gate__intro">
            <div className="launch-gate__kicker">
              <Leaf className="h-4 w-4" />
              A clearer standard for everyday wellness
            </div>
            <h1 id="launch-title">Research-led nutrition.<br />Honest labels. Better choices.</h1>
            <p className="launch-gate__lede">
              Leaf Genix Lifesciences creates thoughtfully formulated nutraceuticals with complete ingredient quantities and clear product information—so every family can choose with confidence.
            </p>
          </div>

          <div className="launch-gate__clock">
            <p className="launch-gate__clock-title">
              <span className="launch-gate__pulse" />
              Our online store launches in
            </p>
            <div className="launch-countdown" aria-label={`Launch countdown: ${countdown.map(([value, label]) => `${value} ${label}`).join(", ")}`}>
              {countdown.map(([value, label], index) => (
                <div className="launch-countdown__unit" key={label}>
                  <span className="launch-countdown__number">{String(value).padStart(2, "0")}</span>
                  <span className="launch-countdown__label">{label}</span>
                  {index < countdown.length - 1 && <span className="launch-countdown__separator" aria-hidden="true">:</span>}
                </div>
              ))}
            </div>
            <p className="launch-gate__moment">25 September 2026 · 12:00 AM IST</p>
          </div>

          <div className="launch-gate__proof">
            <span><ShieldCheck className="h-4 w-4" /> FSSAI registered</span>
            <span><ShieldCheck className="h-4 w-4" /> WHO-GMP partner facilities</span>
            <span><ShieldCheck className="h-4 w-4" /> Full label disclosure</span>
          </div>
        </main>

        <footer className="launch-gate__footer">
          <p>Serving families across India from Jaipur, Rajasthan.</p>
          <nav className="launch-gate__links" aria-label="Legal and support links">
            {PUBLIC_INFORMATION_LINKS.map(({ href, label }) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
          <div className="launch-gate__contact">
            <a href={`mailto:${site.email}`}>
              <Mail className="h-4 w-4" /> {site.email}
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp us <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
