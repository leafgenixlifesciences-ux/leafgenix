/**
 * The Leaf Genix icon set — a small family of thin-line medical and pharmacy
 * glyphs drawn on the same 24-unit grid, 1.6 stroke, round joins, so they sit
 * beside the Bricolage display face without shouting. They take currentColor
 * and a className; nothing else. UI chrome (arrows, bag, menu) stays lucide.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number };

function Base({ children, strokeWidth = 1.6, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Shield with a leaf — immunity & vitality. */
export function IconImmunity(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3 5 5.8V11c0 4.9 3 8.3 7 10 4-1.7 7-5.1 7-10V5.8L12 3Z" />
      <path d="M12.2 16.2c-.2-3 1.2-5.3 4-6.4-.3 3.1-1.7 5.3-4 6.4Z" />
      <path d="M12.2 16.2 15 11.5" />
    </Base>
  );
}

/** A coiled intestine — gut & digestion. */
export function IconGut(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5 6h9.5a3.5 3.5 0 0 1 0 7H9.5a3.5 3.5 0 0 0 0 7H19" />
      <path d="M5 6H4M19 20h1" />
      <circle cx="17.5" cy="9.5" r=".6" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Two hemispheres — brain & memory. */
export function IconBrain(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M11 4.5a2.8 2.8 0 0 0-4.6 2.1A2.8 2.8 0 0 0 4.6 11c-.3 1 0 2 .8 2.7A2.8 2.8 0 0 0 7.2 18 2.8 2.8 0 0 0 11 19.5V4.5Z" />
      <path d="M13 4.5a2.8 2.8 0 0 1 4.6 2.1 2.8 2.8 0 0 1 1.8 4.4c.3 1 0 2-.8 2.7a2.8 2.8 0 0 1-1.8 4.3A2.8 2.8 0 0 1 13 19.5V4.5Z" />
      <path d="M11 9h-2M13 12h2.5M11 15H8.5" />
    </Base>
  );
}

/** Venus symbol with a leaf tip — women's health. */
export function IconWomen(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M12 12.5V21M9 18h6" />
      <path d="M12 8c0-1.7 1-2.7 2.6-3-.1 1.7-1 2.7-2.6 3Z" />
    </Base>
  );
}

/** Long bone — bone & calcium. */
export function IconBone(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5.2 8.7a2.4 2.4 0 1 1 3.5-3.5l6.1 6.1a2.4 2.4 0 1 1 3.5 3.5 2.4 2.4 0 1 1-3.5 3.5L8.7 12.2a2.4 2.4 0 1 1-3.5-3.5Z" />
    </Base>
  );
}

/** Liver outline — liver care. */
export function IconLiver(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 10.5C4 7.5 6.3 5 9.8 5H16c2.9 0 5 1.9 5 4.4 0 2.8-2.3 4.5-5 5.4l-6 2.4c-3 1.1-6-1-6-4v-2.7Z" />
      <path d="M10 5.5v4" />
    </Base>
  );
}

/** A single drop — blood & iron. */
export function IconBlood(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3s-6 6.9-6 11a6 6 0 0 0 12 0c0-4.1-6-11-6-11Z" />
      <path d="M9.2 14.5a2.8 2.8 0 0 0 2.3 2.7" />
    </Base>
  );
}

/** Conical flask with two bubbles — research, evidence. */
export function IconFlask(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9.5 3h5M10.5 3v6l-5.3 8.7A2 2 0 0 0 6.9 21h10.2a2 2 0 0 0 1.7-3.3L13.5 9V3" />
      <path d="M8 15.5h8" />
      <circle cx="11" cy="18" r=".6" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="17" r=".5" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Label with quantity lines — the printed composition. */
export function IconLabel(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8.5 8h7M8.5 11.5h4M8.5 15h7" />
      <path d="M14.5 11.5h1" />
    </Base>
  );
}

/** Rosette with a tick — WHO-GMP, certification. */
export function IconCertified(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="m9.6 9.6 1.7 1.7 3.2-3.4" />
      <path d="M9 14.4 8 21l4-1.9 4 1.9-1-6.6" />
    </Base>
  );
}

/** Scored tablet. */
export function IconTablet(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4.5 12h15" />
    </Base>
  );
}

/** Syrup bottle. */
export function IconBottle(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9.5 3h5v3h-5z" />
      <path d="M9 6h6l1.2 3.2V19a2 2 0 0 1-2 2H9.8a2 2 0 0 1-2-2V9.2L9 6Z" />
      <path d="M8 13.5h8" />
    </Base>
  );
}

/** Sachet with a tear strip. */
export function IconSachet(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6.5 5h11l-1 15h-9l-1-15Z" />
      <path d="m6.5 5 1.2 1.3L9 5l1.4 1.3L11.8 5l1.4 1.3L14.5 5l1.4 1.3L17.5 5" />
      <path d="M9.5 12h5" />
    </Base>
  );
}

/** Softgel capsule. */
export function IconCapsule(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m7.2 16.8 9.6-9.6a3.4 3.4 0 0 1 4.8 4.8l-9.6 9.6a3.4 3.4 0 0 1-4.8-4.8Z" transform="translate(-2 -2)" />
      <path d="m10 9 5 5" />
    </Base>
  );
}

/** Sealed box — tamper-evident dispatch. */
export function IconSealed(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
      <path d="M4 8.5 12 13l8-4.5M12 13v7" />
      <path d="m8 6.3 8 4.5" />
    </Base>
  );
}

/** Stethoscope — clinicians, the Rx range. */
export function IconStethoscope(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6 3.5v5a4 4 0 0 0 8 0v-5" />
      <path d="M10 12.5V15a4.5 4.5 0 0 0 9 0v-1" />
      <circle cx="19" cy="11.5" r="2" />
      <path d="M5 3.5h2M13 3.5h2" />
    </Base>
  );
}

/** Rupee tag — offer. */
export function IconTag(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h6.4l8 8-8 8-8-8V5.5Z" />
      <circle cx="8.5" cy="8.5" r=".8" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Delivery van. */
export function IconVan(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 6.5h10v9H3zM13 9.5h4.2L20 12.8v2.7h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </Base>
  );
}
