import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Pill,
  Truck,
} from "lucide-react";
import { LeafMark } from "@/components/brand";
import { site } from "@/lib/site";
import { formatPaise } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/shipping";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Nutraceuticals" },
  { href: "/prescription-range", label: "Rx Range" },
  { href: "/blog", label: "Journal" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
];

const productLinks = [
  { href: "/products/synvit-forte-tablets", label: "Synvit-Forte" },
  { href: "/products/probion-colostrum-probiotic", label: "Probion" },
  { href: "/products/edo-well-syrup", label: "Edo Well" },
  { href: "/products/l-sharp-400-syrup", label: "L-Sharp 400" },
  { href: "/products/firtilo-f", label: "Firtilo-f" },
  { href: "/products", label: "All nutraceuticals" },
];

const policyLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Cancellation & Refund" },
  { href: "/shipping-policy", label: "Shipping & Delivery" },
];

/** Column heading with the short accent bar underneath. */
function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h3 className="text-[1.0625rem] font-bold tracking-[-0.01em] text-white">
        {children}
      </h3>
      <div className="accent-bar mt-2.5" />
    </>
  );
}

export function SiteFooter() {
  const tel = site.supportPhone.replace(/\s/g, "");
  const mapQuery = encodeURIComponent(site.addressLines.slice(1).join(", "));

  return (
    <footer className="band-night text-white">
      <div className="shell pt-16 pb-12 md:pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.35fr] lg:gap-10">
          {/* ---------------- brand ---------------- */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white p-2">
                <LeafMark className="h-full w-auto" />
              </span>
              <span className="leading-tight">
                <span className="block text-[1.375rem] font-extrabold tracking-[-0.02em] text-accent">
                  Leaf Genix
                </span>
                <span className="block text-[0.6875rem] font-semibold tracking-[0.22em] text-white/60 uppercase">
                  Lifesciences
                </span>
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Three decades of {site.consumerLine}. Research-led nutraceuticals
              with the full composition printed on every pack, made at WHO-GMP
              certified partner facilities.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-xl bg-accent px-4 py-3.5 text-[#40270a]">
              <Truck className="h-5 w-5 shrink-0" strokeWidth={2} />
              <p className="text-sm font-bold">
                Free delivery on orders over{" "}
                {formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)}
              </p>
            </div>

            <div className="mt-6 flex gap-2.5">
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="foot-icon focus-ring"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.9} />
              </a>
              <a
                href={`mailto:${site.email}`}
                aria-label="Email us"
                className="foot-icon focus-ring"
              >
                <Mail className="h-4 w-4" strokeWidth={1.9} />
              </a>
              <a
                href={`tel:${tel}`}
                aria-label="Call us"
                className="foot-icon focus-ring"
              >
                <Phone className="h-4 w-4" strokeWidth={1.9} />
              </a>
              <a
                href={`https://maps.google.com/?q=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Find us on the map"
                className="foot-icon focus-ring"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.9} />
              </a>
            </div>
          </div>

          {/* ---------------- quick links ---------------- */}
          <nav aria-label="Quick links">
            <ColHead>Quick Links</ColHead>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="focus-ring group flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-accent"
                  >
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-0.5"
                      strokeWidth={2.4}
                    />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------------- products ---------------- */}
          <nav aria-label="Our products">
            <ColHead>Our Products</ColHead>
            <ul className="mt-5 space-y-3">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="focus-ring group flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-accent"
                  >
                    <Pill
                      className="h-3.5 w-3.5 shrink-0 text-accent"
                      strokeWidth={2}
                    />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------------- contact ---------------- */}
          <div>
            <ColHead>Contact Us</ColHead>
            <dl className="mt-5 space-y-4">
              <div className="flex gap-3">
                <span className="foot-icon">
                  <MapPin className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div>
                  <dt className="text-sm font-bold text-white">Address</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-white/65">
                    {site.addressLines.slice(1).map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="foot-icon">
                  <Phone className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div>
                  <dt className="text-sm font-bold text-white">Phone</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`tel:${tel}`}
                      className="num focus-ring text-sm text-white/65 transition-colors hover:text-accent"
                    >
                      {site.supportPhone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="foot-icon">
                  <Mail className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <dt className="text-sm font-bold text-white">Email</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`mailto:${site.email}`}
                      className="focus-ring text-sm break-words text-white/65 transition-colors hover:text-accent"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="foot-icon">
                  <Clock className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div>
                  <dt className="text-sm font-bold text-white">Working Hours</dt>
                  <dd className="mt-0.5 text-sm text-white/65">
                    {site.supportHours}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* ---------------- policies + disclaimer ---------------- */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <nav
            aria-label="Policies"
            className="flex flex-wrap gap-x-6 gap-y-2.5"
          >
            {policyLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="focus-ring text-sm text-white/65 transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="mt-6 max-w-4xl text-[0.6875rem] leading-relaxed text-white/40">
            Products sold on this website are nutraceuticals and dietary
            supplements. They are not intended to diagnose, treat, cure or
            prevent any disease, and are not a substitute for advice from a
            qualified medical practitioner. Always read the label before use.
            Prescription medicines shown under our Rx Range are listed for
            information only and are not sold through this website. Manufactured
            at WHO-GMP certified partner facilities — principally{" "}
            {site.manufacturer}, Mfg. Lic. No. {site.manufacturerLicence}; each
            pack names its own manufacturer and licence.
          </p>
        </div>
      </div>

      {/* ---------------- base bar ---------------- */}
      <div className="border-t border-white/10 bg-night-2">
        <div className="shell flex flex-col items-start justify-between gap-3 py-5 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {(
              [
                [`FSSAI ${site.fssaiType}`, site.fssai],
                ["GSTIN", site.gstin],
                ["CIN", site.cin],
              ] as const
            )
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <span key={label}>
                  {label}: <span className="num text-white/75">{value}</span>
                </span>
              ))}
            <span aria-hidden="true" className="text-white/25">
              |
            </span>
            <Link
              href="/privacy-policy"
              className="focus-ring transition-colors hover:text-accent"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
