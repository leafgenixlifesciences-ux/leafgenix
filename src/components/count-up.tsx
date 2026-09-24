"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a number up from zero the first time it scrolls into view.
 *
 * Renders the final value on the server so the HTML is correct without
 * JavaScript and for crawlers; the animation only replaces it on the client.
 * Non-numeric parts of the string ("100%", "WHO") are kept as they are.
 */
export function CountUp({
  value,
  duration = 1400,
  className = "",
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/^(\D*)(\d+)(.*)$/);
    const node = ref.current;
    if (!match || !node) return;

    const [, prefix, digits, suffix] = match;
    const target = Number(digits);
    const pad = digits.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target === 0) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(target * eased);
          setDisplay(`${prefix}${String(n).padStart(pad, "0")}${suffix}`);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setDisplay(`${prefix}${"0".padStart(pad, "0")}${suffix}`);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
