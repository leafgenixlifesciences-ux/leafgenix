import Image from "next/image";
import { site } from "@/lib/site";

/** Horizontal lockup — leaf mark plus stacked wordmark. Used in the header. */
export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/leafgenix-lockup.png"
      alt={`${site.fullName} — ${site.tagline}`}
      width={1025}
      height={260}
      priority={priority}
      className={className}
    />
  );
}

/** Mark only — the three leaves inside the orange arc. */
export function LeafMark({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/leafgenix-mark.png"
      alt=""
      width={297}
      height={260}
      priority={priority}
      aria-hidden="true"
      className={className}
    />
  );
}

/** Stacked lockup — mark above the wordmark. Used in the footer. */
export function LogoStacked({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/leafgenix-logo.png"
      alt={site.fullName}
      width={850}
      height={725}
      className={className}
    />
  );
}

/** A flat outline of the mark, for decorative watermarks where a PNG would be
 *  heavy or would not take a colour. */
export function LeafGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M33.5 5.5S12.8 3.8 7.4 14.2c-5.4 10.4 1.3 19.5 1.3 19.5S26 34.9 31.4 24.5c4.6-8.8 2.1-19 2.1-19Z"
        strokeLinejoin="round"
      />
      <path d="M33.5 5.5 5 35" strokeLinecap="round" />
      <path
        d="M26.6 12.4c-4.2-1.5-8.1.4-9.4 4.3-1.3 3.9 1.3 7.6 5.3 8.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
