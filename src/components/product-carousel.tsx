"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Product image carousel.
 *
 * The slide strip is a real horizontally-scrollable list with CSS scroll
 * snapping, so touch swipe, trackpad scroll and keyboard all work without
 * JavaScript re-implementing them. The arrows and thumbnails simply scroll
 * that container; an IntersectionObserver reads back which slide is showing.
 * Every slide is in the server HTML, so the images are crawlable and the
 * first one paints without waiting for hydration.
 */
export function ProductCarousel({
  images,
  alt,
  priority = false,
}: {
  images: string[];
  alt: string;
  priority?: boolean;
}) {
  const slides = images.filter(Boolean);
  const trackRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const labelId = useId();

  const scrollTo = useCallback((i: number) => {
    const el = slideRefs.current[i];
    const track = trackRef.current;
    if (!el || !track) return;
    track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, []);

  // Read the visible slide back out of the scroll container.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = slideRefs.current.indexOf(entry.target as HTMLLIElement);
            if (i >= 0) setIndex(i);
          }
        }
      },
      { root: track, threshold: 0.6 },
    );

    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [slides.length]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollTo(Math.min(index + 1, slides.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollTo(Math.max(index - 1, 0));
    }
  }

  if (slides.length === 0) return null;

  return (
    <section aria-roledescription="carousel" aria-labelledby={labelId}>
      <h2 id={labelId} className="sr-only">
        {alt} — product images
      </h2>

      <div className="relative">
        <ul
          ref={trackRef}
          onKeyDown={onKeyDown}
          tabIndex={0}
          className="hide-scrollbar focus-ring flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[var(--radius-xl)]"
        >
          {slides.map((src, i) => (
            <li
              key={src}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${i + 1} of ${slides.length}`}
              className="relative aspect-4/5 w-full shrink-0 snap-center overflow-hidden border border-line bg-surface"
            >
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt} — view ${i + 1}`}
                fill
                priority={priority && i === 0}
                loading={priority && i === 0 ? undefined : "lazy"}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="scale-[1.12] object-cover"
              />
            </li>
          ))}
        </ul>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollTo(Math.max(index - 1, 0))}
              disabled={index === 0}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/92 text-brand-deep shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(Math.min(index + 1, slides.length - 1))}
              disabled={index === slides.length - 1}
              aria-label="Next image"
              className="absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/92 text-brand-deep shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>

            <p aria-live="polite" className="sr-only">
              Image {index + 1} of {slides.length}
            </p>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-lg border bg-surface transition ${
                i === index
                  ? "border-brand ring-1 ring-brand"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="90px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
