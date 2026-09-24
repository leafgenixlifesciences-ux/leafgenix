import type { ReactNode } from "react";
import { LeafGlyph } from "@/components/brand";

/**
 * The forest band that opens every inner page.
 *
 * One component so the whole site opens the same way: a lime eyebrow, a big
 * white display headline, an optional lede, and whatever the page wants to
 * hang beneath (chips, a notice, a step indicator). The leaf glyph sits in
 * the corner at low opacity, the same way it does on the printed material.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  compact = false,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  align?: "left" | "center";
}) {
  const centred = align === "center";
  return (
    <section className="band-forest overflow-hidden">
      <LeafGlyph className="pointer-events-none absolute -top-16 -right-20 h-[22rem] w-[22rem] rotate-12 text-white/[0.05]" />
      <div
        className={`shell relative ${compact ? "pt-10 pb-12 md:pt-14 md:pb-16" : "pt-14 pb-16 md:pt-20 md:pb-24"} ${
          centred ? "text-center" : ""
        }`}
      >
        {eyebrow && (
          <p className={`eyebrow-lime rise ${centred ? "justify-center" : ""}`}>
            {eyebrow}
          </p>
        )}
        <h1
          className={`display-xl display-on-dark rise mt-5 text-balance ${
            centred ? "mx-auto max-w-3xl" : "max-w-3xl"
          }`}
          style={{ animationDelay: "80ms" }}
        >
          {title}
        </h1>
        {lede && (
          <p
            className={`lede lede-on-dark rise mt-6 max-w-2xl ${centred ? "mx-auto" : ""}`}
            style={{ animationDelay: "160ms" }}
          >
            {lede}
          </p>
        )}
        {children && (
          <div className="rise mt-8" style={{ animationDelay: "240ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
