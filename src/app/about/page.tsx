import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock,
  FlaskConical,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Marquee } from "@/components/marquee";
import { LeafGlyph } from "@/components/brand";
import { PageHero } from "@/components/page-hero";
import { getProducts, getRxProducts } from "@/lib/queries";
import { site, trustPoints } from "@/lib/site";
import { siteUrl } from "@/lib/utils";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "About us",
  description: `Who ${site.fullName} is, what we make, where it is manufactured, and the registrations we hold — the full company picture in one page.`,
  alternates: { canonical: "/about" },
};

const process = [
  {
    step: "Evidence first",
    body: "A formulation starts with the human trials, not with what is cheap to source. If the published research used 400 mg of a standardised active, that is what goes in — not 400 mg of something that happens to weigh the same.",
  },
  {
    step: "Sourcing with paperwork",
    body: "Every raw material arrives with a certificate of analysis naming its standardisation, its origin and its assay method. Materials that arrive without one go back.",
  },
  {
    step: "Manufacturing under WHO-GMP",
    body: `Production runs at WHO-GMP certified partner facilities — principally ${site.manufacturer} — and every pack names its manufacturer and licence number.`,
  },
  {
    step: "The label tells the truth",
    body: "Every quantity is printed. If you can read our label and compare it line by line against a competitor's, the formulation has done its job before you have even opened the pack.",
  },
];

const refusals = [
  {
    t: "No proprietary blends",
    b: "A blend lets a brand hide how little of the expensive ingredient is in the mix. We list every quantity, so you can price-compare us honestly.",
  },
  {
    t: "No disease claims",
    b: "Our nutraceuticals support; they do not treat. Anyone promising a cure in a supplement bottle is selling you something other than nutrition.",
  },
  {
    t: "No Rx sales online",
    b: "Our prescription medicines are published for clinicians to read, never added to a cart. Those belong with a pharmacist and a valid prescription.",
  },
];

export default async function AboutPage() {
  const [products, rx] = await Promise.all([getProducts(), getRxProducts()]);

  const therapyAreas = [...new Set(rx.map((p) => p.therapy_area))].sort();
  const categories = [...new Set(products.map((p) => p.category))];

  /* Every row is dropped when its value is blank, so this table can never
     print a registration number the company does not actually hold. */
  const identity = (
    [
      ["Legal name", site.legalName],
      ["Constitution", site.entityType],
      ["Registered office", site.addressLines.slice(1).join(", ")],
      [
        `FSSAI ${site.fssaiType}`,
        site.fssai && `${site.fssai} — valid up to ${site.fssaiValidUpto}`,
      ],
      ["Kind of business", site.fssaiKindOfBusiness],
      ["GSTIN", site.gstin],
      ["CIN", site.cin],
      ["Website", site.domain],
    ] as const
  ).filter(([, value]) => Boolean(value)) as [string, string][];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    url: siteUrl("/"),
    description: site.description,
    email: site.email,
    telephone: site.supportPhone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressLines.slice(1, 3).join(", "),
      addressLocality: site.city,
      addressRegion: site.state,
      postalCode: site.postalCode,
      addressCountry: "IN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="About us"
        title={<>Anyone can print a <span className="hi">botanical name.</span></>}
        lede={<>Walk into any pharmacy in India and you will find twenty bottles claiming the same ingredient. What you will rarely find is the number that matters: how much of the active is actually in there. {site.fullName} exists because that number should not be a secret.</>}
      >
        <dl className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Years in Indian healthcare", v: site.yearsStat },
            { k: "Nutraceutical formulations", v: String(products.length).padStart(2, "0") },
            { k: "Prescription medicines", v: String(rx.length).padStart(2, "0") },
            { k: "Quantities disclosed", v: "100%" },
          ].map((s) => (
            <div key={s.k} className="card-glass px-4 py-4">
              <dd className="stat-num text-3xl text-lime-bright">{s.v}</dd>
              <dt className="mt-2 text-[0.6563rem] leading-snug font-bold tracking-[0.08em] text-white/70 uppercase">
                {s.k}
              </dt>
            </div>
          ))}
        </dl>
      </PageHero>

      <Marquee items={trustPoints} className="border-b border-brand/10 bg-lime-bright/25" />

      {/* ---------------- who we are ---------------- */}
      <section className="shell py-20 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Who we are</p>
            <h2 className="display-lg mt-4">The company, on paper.</h2>
            <p className="prose-body mt-5 max-w-sm">
              Everything below is transcribed from the certificates and invoices
              the business actually holds. Nothing here is decorative — if we
              cannot produce the document, the row is not on the page.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/contact" className="btn btn-outline">
                Contact us
              </Link>
              <Link href="/terms" className="btn btn-ghost">
                Read our Terms
              </Link>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div className="card overflow-hidden">
              <dl className="divide-y divide-line">
                {identity.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 px-6 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-7"
                  >
                    <dt className="text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase sm:pt-0.5">
                      {label}
                    </dt>
                    <dd className="num text-[0.9375rem] leading-relaxed text-brand-deep">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Our FSSAI {site.fssaiType.toLowerCase()} is held under the Food
              Safety and Standards Act, 2006. Our nutraceuticals are food
              supplements, not medicines, and are not intended to diagnose,
              treat, cure or prevent any disease.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- vision ---------------- */}
      <section className="border-y border-line bg-surface">
        <div className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">What we are for</p>
            <h2 className="display-lg mt-4">Perfect vision</h2>
          </Reveal>
          <Reveal delay={70}>
            <div className="space-y-6">
              <blockquote className="border-l-2 border-accent pl-6 text-[1.0625rem] leading-relaxed text-body">
                {site.vision}.
              </blockquote>
              <p className="prose-body">
                {site.positioning}, focusing on identifying cutting-edge
                solutions dedicated to Women &amp; Child Health.
              </p>
              <p className="display-md">&ldquo;{site.awardLine}&rdquo;</p>
              <p className="prose-body">
                Our consumer range carries a simpler line —{" "}
                <span className="font-semibold text-brand">
                  {site.consumerLine}
                </span>{" "}
                — because a supplement only works if somebody actually takes it,
                and people take what they trust and can tolerate.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- what we make ---------------- */}
      <section className="shell py-20 md:py-24">
        <Reveal>
          <p className="eyebrow">What we make</p>
          <h2 className="display-lg mt-4 max-w-3xl">
            Two ranges, sold two different ways.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card flex h-full flex-col p-7 md:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 text-brand">
                <FlaskConical className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="display-md mt-5">
                {products.length} nutraceuticals — sold here
              </h3>
              <p className="prose-body mt-3">
                Food supplements you can buy directly on this website, delivered
                across India. Every pack prints its full composition.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line pt-6">
                {products.map((p) => (
                  <li key={p.slug} className="flex gap-3">
                    <BadgeCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      strokeWidth={2}
                    />
                    <span className="text-sm leading-relaxed text-body">
                      <Link
                        href={`/products/${p.slug}`}
                        className="focus-ring font-semibold text-brand-deep transition-colors hover:text-brand"
                      >
                        {p.name}
                      </Link>
                      {p.tagline ? ` — ${p.tagline}` : ""}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/products"
                className="focus-ring mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-brand"
              >
                Browse the range
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card flex h-full flex-col p-7 md:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 text-brand">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="display-md mt-5">
                {rx.length} prescription medicines — not sold here
              </h3>
              <p className="prose-body mt-3">
                Published so that doctors, pharmacists and distributors can see
                the portfolio. They are dispensed by a licensed pharmacist
                against a valid prescription, never added to a cart on this site.
              </p>

              <div className="mt-6 border-t border-line pt-6">
                <p className="text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
                  Therapy areas covered
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {therapyAreas.map((area) => (
                    <li key={area} className="chip">
                      {area}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
                  Nutraceutical categories
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li key={c} className="chip">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/prescription-range"
                className="focus-ring mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-brand"
              >
                See the Rx range
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- process ---------------- */}
      <section className="border-y border-line bg-surface">
        <div className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">How a product gets made</p>
            <h2 className="display-lg mt-4">Four gates.</h2>
            <p className="prose-body mt-5 max-w-sm">
              A formulation has to clear all four before it gets a label. Most of
              the ideas we have had did not.
            </p>
          </Reveal>

          <ol>
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 70}>
                <li className="grid gap-4 border-t border-line py-8 sm:grid-cols-[4rem_1fr] sm:gap-8 last:border-b">
                  <span className="num text-2xl font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="display-md">{p.step}</h3>
                    <p className="prose-body mt-3 max-w-xl">{p.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- refusals ---------------- */}
      <section className="shell py-20 md:py-24">
        <Reveal>
          <p className="eyebrow">What we will not do</p>
          <h2 className="display-lg mt-4 max-w-3xl">
            The short list is more useful than the long one.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {refusals.map((c, i) => (
            <Reveal key={c.t} delay={i * 80}>
              <div className="card h-full p-7">
                <h3 className="display-md">{c.t}</h3>
                <p className="prose-body mt-4">{c.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- manufacturing ---------------- */}
      <section className="border-y border-line bg-surface">
        <div className="shell py-20">
          <Reveal>
            <p className="eyebrow">Where it is made</p>
            <h2 className="display-lg mt-4 max-w-2xl">
              Manufactured under WHO-GMP certification.
            </h2>
            <p className="prose-body mt-5 max-w-2xl">
              We do not own a factory, and we say so. Our formulations are made
              to our specification by WHO-GMP certified contract manufacturers,
              which is how most of the Indian nutraceutical industry works — the
              difference is whether a brand tells you whose plant it is. Samson
              Laboratories is our principal partner; where a product is made
              elsewhere, that manufacturer and its licence number are printed on
              the pack and listed on the product page.
            </p>
          </Reveal>
          <Reveal delay={70}>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  k: "Principal manufacturing partner",
                  v: "Samson Laboratories Pvt. Ltd.",
                },
                { k: "Certification", v: "WHO-GMP certified" },
                { k: "Facility", v: "Barotiwala, Distt. Solan, H.P." },
                { k: "Mfg. licence", v: site.manufacturerLicence },
              ].map((x) => (
                <div key={x.k} className="card p-6">
                  <dt className="text-[0.6875rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {x.k}
                  </dt>
                  <dd className="mt-2.5 text-[0.9375rem] font-semibold text-brand-deep">
                    {x.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={140}>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  t: "Batch certificates on request",
                  b: "Quote the batch number printed on your pack and we will send you its certificate of analysis.",
                },
                {
                  t: "Shelf life you can check",
                  b: "Batch number and expiry are printed on every pack and repeated on your invoice, so the two can be matched on delivery.",
                },
                {
                  t: "Complaints are investigated",
                  b: "A quality concern is recorded and traced back to its batch regardless of where the pack was bought.",
                },
              ].map((x) => (
                <li key={x.t} className="border-t border-line pt-5">
                  <h3 className="text-[0.9375rem] font-bold text-brand-deep">
                    {x.t}
                  </h3>
                  <p className="prose-body mt-2">{x.b}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------------- reach us ---------------- */}
      <section className="shell py-20 md:py-24">
        <Reveal>
          <p className="eyebrow">Reach us</p>
          <h2 className="display-lg mt-4 max-w-2xl">
            A person answers, during working hours.
          </h2>
        </Reveal>

        <Reveal delay={70}>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Building2,
                k: "Registered office",
                lines: site.addressLines.slice(1),
              },
              {
                icon: Phone,
                k: "Phone",
                lines: [site.supportPhone],
                href: `tel:${site.supportPhone.replace(/\s/g, "")}`,
              },
              {
                icon: Mail,
                k: "Email",
                lines: [site.email],
                href: `mailto:${site.email}`,
              },
              { icon: Clock, k: "Working hours", lines: [site.supportHours] },
            ].map((c) => (
              <div key={c.k} className="card p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                  <c.icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <dt className="mt-4 text-[0.6875rem] font-bold tracking-[0.14em] text-muted uppercase">
                  {c.k}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-body">
                  {c.href ? (
                    <a
                      href={c.href}
                      className="focus-ring break-words text-brand underline underline-offset-4"
                    >
                      {c.lines[0]}
                    </a>
                  ) : (
                    c.lines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={140}>
          <p className="mt-8 flex flex-wrap items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.9} />
            Distribution and stockist enquiries are welcome — write to us with
            your firm&apos;s name, city and drug licence number and we will come
            back to you.
          </p>
        </Reveal>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="shell pb-20 md:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-brand px-8 py-16 text-white md:px-16">
            <LeafGlyph className="pointer-events-none absolute -right-14 -bottom-16 h-72 w-72 text-white/10" />
            <h2 className="display-lg max-w-2xl !text-white">
              {products.length} formulations. Every number on the label.
            </h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-accent">
                See the range
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link href="/contact" className="btn btn-ghost-light">
                Ask us anything
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
