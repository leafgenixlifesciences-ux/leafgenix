"use client";

import Image, { type StaticImageData } from "next/image";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./event-gallery.module.css";

export type GalleryImage = {
  src: StaticImageData;
  alt: string;
  title: string;
  caption: string;
  size: "wide" | "standard" | "portrait";
};

export function EventGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setActive(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const move = useCallback(
    (direction: -1 | 1) => {
      setActive((current) => {
        if (current === null) return null;
        return (current + direction + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close, move]);

  const current = active === null ? null : images[active];

  return (
    <>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <button
            type="button"
            className={styles.card}
            data-size={image.size}
            key={image.title}
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setActive(index);
            }}
            aria-label={`Open ${image.title}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              placeholder="blur"
              sizes={
                image.size === "wide"
                  ? "(max-width: 760px) 100vw, 66vw"
                  : "(max-width: 760px) 100vw, 42vw"
              }
              className={styles.image}
            />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.copy}>
              <span className={styles.title}>{image.title}</span>
              <span className={styles.caption}>{image.caption}</span>
            </span>
            <span className={styles.expand} aria-hidden="true">
              <Maximize2 />
            </span>
          </button>
        ))}
      </div>

      {current && active !== null && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button type="button" className={styles.close} onClick={close} aria-label="Close image">
            <X />
          </button>

          <button
            type="button"
            className={`${styles.arrow} ${styles.previous}`}
            onClick={() => move(-1)}
            aria-label="Previous image"
          >
            <ArrowLeft />
          </button>

          <figure className={styles.figure}>
            <div className={styles.stage}>
              <Image
                src={current.src}
                alt={current.alt}
                fill
                priority
                sizes="96vw"
                className={styles.lightboxImage}
              />
            </div>
            <figcaption className={styles.lightboxCaption}>
              <span>{current.title}</span>
              <span>{current.caption}</span>
              <span className={styles.counter}>{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            </figcaption>
          </figure>

          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            onClick={() => move(1)}
            aria-label="Next image"
          >
            <ArrowRight />
          </button>
        </div>
      )}
    </>
  );
}
