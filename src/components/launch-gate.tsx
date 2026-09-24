"use client";

import Image from "next/image";
import { ArrowUpRight, Leaf, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LAUNCH_AT_MS } from "@/lib/launch";
import { site } from "@/lib/site";

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
  const [remaining, setRemaining] = useState<Remaining | null>(
    initiallyLaunched ? null : { days: 0, hours: 0, minutes: 0, seconds: 0 },
  );
  const visible = remaining !== null;

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

  if (!remaining) return null;

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

        <div className="launch-gate__body">
          <div className="launch-gate__copy">
            <div className="launch-gate__kicker">
              <Leaf className="h-4 w-4" />
              Something healthier is taking root
            </div>
            <h1 id="launch-title">
              Better labels.<br />
              Better choices.<br />
              <span>Almost here.</span>
            </h1>
            <p className="launch-gate__lede">
              Leaf Genix Lifesciences is launching its online nutraceutical store with research-led formulations, complete ingredient quantities and clear product information.
            </p>

            <div className="launch-countdown" aria-label={`Launch countdown: ${countdown.map(([value, label]) => `${value} ${label}`).join(", ")}`}>
              {countdown.map(([value, label], index) => (
                <div className="launch-countdown__unit" key={label}>
                  <span className="launch-countdown__number">{String(value).padStart(2, "0")}</span>
                  <span className="launch-countdown__label">{label}</span>
                  {index < countdown.length - 1 && <span className="launch-countdown__dot" aria-hidden="true" />}
                </div>
              ))}
            </div>

            <div className="launch-gate__proof">
              <span><ShieldCheck className="h-4 w-4" /> FSSAI registered</span>
              <span><ShieldCheck className="h-4 w-4" /> WHO-GMP partner facilities</span>
              <span><ShieldCheck className="h-4 w-4" /> Full label disclosure</span>
            </div>
          </div>

          <div className="launch-gate__visual" aria-hidden="true">
            <div className="launch-gate__leaf-ring" />
            <div className="launch-gate__badge">
              <span>Online store</span>
              <strong>opens at midnight</strong>
            </div>
            {[
              ["/products/synvit-forte-tablets-studio.png", "launch-pack--one"],
              ["/products/probion-colostrum-probiotic-studio.png", "launch-pack--two"],
              ["/products/firtilo-f-studio.png", "launch-pack--three"],
            ].map(([src, className]) => (
              <div className={`launch-pack ${className}`} key={src}>
                <Image src={src} alt="" fill sizes="220px" className="object-cover" priority />
              </div>
            ))}
          </div>
        </div>

        <footer className="launch-gate__footer">
          <p>Serving families across India from Jaipur, Rajasthan.</p>
          <div>
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
