"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Progressive enhancement only. The markup ships in the server HTML and is
 * visible by default (see globals.css) — this just fades it up the first time
 * it scrolls into view, and gives up gracefully if the observer never fires.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -40px 0px" },
    );

    io.observe(node);

    // Safety net: never leave content hidden, whatever the observer does.
    const timer = window.setTimeout(() => {
      setShown(true);
      io.disconnect();
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-shown={shown ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
