import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { LeafGlyph } from "@/components/brand";
import {
  IconBlood,
  IconBone,
  IconBrain,
  IconCertified,
  IconFlask,
  IconGut,
  IconImmunity,
  IconLabel,
  IconLiver,
  IconSealed,
  IconTag,
  IconVan,
  IconWomen,
} from "@/components/icons";
import { getProducts, getRxProducts } from "@/lib/queries";
import { formatPaise } from "@/lib/money";
import { COUPON } from "@/lib/offer";
import { categoryAccent } from "@/lib/category-accent";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

/** One printed-on-pack fact per product, for the pills that float around the
 *  hero fan. Only slugs listed here get a pill; nothing is invented. */
const PACK_FACTS: Record<string, { k: string; v: string }> = {
  "synvit-forte-tablets": { k: "essential multivitamins", v: "21" },
  "probion-colostrum-probiotic": { k: "Billion CFU per sachet", v: "5" },
  "edo-well-syrup": { k: "mg EPA · 300 mg DHA", v: "400" },
  "l-sharp-400-syrup": { k: "mg L-Carnosine / 5 ml", v: "400" },
  "firtilo-f": { k: "myo : D-chiro inositol", v: "40:1" },
};

/** Which photograph in a product's gallery shows the back of the pack — the
 *  printed composition — so the label section can show a real one. Order
 *  matters: the first entry is the large shot. */
const LABEL_PHOTO: [slug: string, index: number][] = [
  ["firtilo-f", 2],
  ["synvit-forte-tablets", 3],
];

/** A second angle for each spotlight — the bottle, the sachet, the side of
 *  the box — layered over the front shot. */
const ALT_PHOTO: Record<string, number> = {
  "synvit-forte-tablets": 4,
  "probion-colostrum-probiotic": 1,
  "edo-well-syrup": 2,
  "l-sharp-400-syrup": 2,
  "firtilo-f": 4,
};

const standards = [
  {
    icon: IconFlask,
    title: "Evidence first",
    body: "A dose reaches a label only when we can point to the human research behind it.",
  },
  {
    icon: IconLabel,
    title: "Every quantity printed",
    body: "No proprietary blends. Each ingredient with its exact amount, so you can compare us to anyone.",
  },
  {
    icon: IconCertified,
    title: "Made under WHO-GMP",
    body: "Certified partner facilities, with the manufacturer and licence number on every pack.",
  },
];

const areas = [
  { icon: IconImmunity, label: "Immunity & Vitality", spot: "#039c34" },
  { icon: IconGut, label: "Gut & Digestion", spot: "#00a79d" },
  { icon: IconBrain, label: "Brain & Memory", spot: "#d30f75" },
  { icon: IconWomen, label: "Women's Health", spot: "#d63384" },
  { icon: IconBone, label: "Bone & Calcium", spot: "#004799" },
  { icon: IconLiver, label: "Liver Care", spot: "#ee6b01" },
  { icon: IconBlood, label: "Blood & Iron", spot: "#f5970d" },
];

function Spotlight({ product, flip }: { product: Product; flip: boolean }) {
  const price = product.mrp_paise;
  const spot = categoryAccent(product.category);
  const benefits = product.key_benefits.slice(0, 3);
  // A second angle — bottle, sachet or box side — layered over the main shot.
  const altIndex = ALT_PHOTO[product.slug];
  const second =
    altIndex !== undefined && product.gallery?.[altIndex] && product.gallery[altIndex] !== product.image_url
      ? product.gallery[altIndex]
      : null;

  return (
    <article
      className="spot grid items-center gap-8 p-6 md:grid-cols-2 md:gap-12 md:p-10"
      style={{ "--spot": spot } as React.CSSProperties}
    >
      <div className={`relative mx-auto w-full max-w-[22rem] ${flip ? "md:order-2" : ""}`}>
        <div className="orbit orbit--light" aria-hidden="true" />
        <Link
          href={`/products/${product.slug}`}
          className="focus-ring relative block aspect-4/5 w-full"
        >
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={`${product.name}, ${product.pack_size}`}
              fill
              sizes="(max-width: 768px) 80vw, 34vw"
              className="spot__img object-contain"
            />
          )}
        </Link>
        {second && (
          <Link
            href={`/products/${product.slug}`}
            aria-hidden="true"
            tabIndex={-1}
            className="absolute right-0 bottom-0 w-[36%] rotate-6 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] hover:rotate-3 md:-right-6 md:-bottom-4 md:w-[38%]"
          >
            <span className="relative block aspect-4/5">
              <Image
                src={second}
                alt=""
                fill
                sizes="140px"
                className="object-cover"
              />
            </span>
          </Link>
        )}
      </div>

      <div className="relative">
        <span className="chip chip-spot">{product.category}</span>
        <h3 className="display-lg mt-4">{product.name}</h3>
        <p className="lede mt-3 max-w-md">{product.tagline}</p>

        {benefits.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[0.9375rem] text-body">
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: spot }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="stat-num text-[2.25rem] text-brand-deep">
                {formatPaise(price)}
              </span>
            </div>
            <p className="num mt-0.5 text-xs font-semibold text-muted">
              {product.pack_size} · incl. all taxes
            </p>
          </div>
          <Link href={`/products/${product.slug}`} className="btn btn-primary">
            View {product.name}
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [products, rx] = await Promise.all([getProducts(), getRxProducts()]);
  const featured = products.filter((p) => p.is_featured);
  const grid = (featured.length ? featured : products).slice(0, 4);
  const fan = (featured.length >= 3 ? featured : products).slice(0, 3);
  const spotlights = fan;
  const cheapest = products.length
    ? Math.min(...products.map((p) => p.mrp_paise))
    : 0;
  const rxAreas = Object.entries(
    rx.reduce<Record<string, number>>((acc, r) => {
      acc[r.therapy_area] = (acc[r.therapy_area] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  // Real back-of-pack photographs for the label section.
  const labelShots = LABEL_PHOTO.flatMap(([slug, index]) => {
    const p = products.find((x) => x.slug === slug);
    const src = p?.gallery?.[index];
    return p && src ? [{ name: p.name, src, spot: categoryAccent(p.category) }] : [];
  });

  const pillars = [
    { k: "Years in Indian healthcare", v: site.yearsStat },
    { k: "Nutraceutical formulations", v: String(products.length).padStart(2, "0") },
    { k: "Prescription medicines", v: String(rx.length).padStart(2, "0") },
    { k: "Quantities disclosed", v: "100%" },
  ];

  const pills = fan
    .map((p, i) => ({ ...PACK_FACTS[p.slug], i }))
    .filter((f): f is { k: string; v: string; i: number } => Boolean(f.k));

  const marqueeItems = [
    site.fullName,
    ...products.map((p) => p.name),
    site.tagline,
  ];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="band-forest overflow-hidden">
        <div className="mesh" aria-hidden="true">
          <div className="mesh__blob mesh__blob--lime" />
          <div className="mesh__blob mesh__blob--orange" />
          <div className="mesh__blob mesh__blob--teal" />
        </div>

        <div className="shell relative z-10 grid items-center gap-14 pt-14 pb-28 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-24 lg:pb-32">
          <div>
            <p className="eyebrow-lime rise">
              WHO-GMP manufacturing · FSSAI registered · Made in India
            </p>

            <h1
              className="display-xl display-on-dark rise mt-6 max-w-[12ch] text-balance"
              style={{ animationDelay: "90ms" }}
            >
              What&apos;s on the label is what&apos;s <span className="hi">in the pack.</span>
            </h1>

            <p
              className="lede lede-on-dark rise mt-7 max-w-md"
              style={{ animationDelay: "180ms" }}
            >
              {products.length} research-led nutraceuticals. Every quantity
              printed, nothing hidden in a blend.
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "270ms" }}
            >
              <Link href="/products" className="btn btn-accent btn-lg">
                Shop the range
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Link>
              <Link href="/about" className="btn btn-ghost-light btn-lg">
                How we formulate
              </Link>
            </div>

            <dl
              className="rise mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
              style={{ animationDelay: "360ms" }}
            >
              {pillars.map((s) => (
                <div key={s.k} className="card-glass px-4 py-4">
                  <dd className="stat-num text-3xl text-lime-bright md:text-[2.25rem]">
                    <CountUp value={s.v} />
                  </dd>
                  <dt className="mt-2 text-[0.6563rem] leading-snug font-bold tracking-[0.08em] text-white/70 uppercase">
                    {s.k}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* hero visual: three packs fanned, facts floating */}
          {fan.length > 0 && (
            <div
              className="rise relative mx-auto w-full max-w-[30rem] lg:max-w-none"
              style={{ animationDelay: "160ms" }}
            >
              <div className="fan">
                <div className="glow-lime" />
                <div className="orbit orbit--soft" />
                <div className="orbit" />

                {fan.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className={`fan__card focus-ring ${
                      i === 0 ? "fan__card--l" : i === 1 ? "fan__card--c" : "fan__card--r"
                    }`}
                    aria-label={p.name}
                  >
                    {p.image_url && (
                      <Image
                        src={p.image_url}
                        alt={`${p.name} — ${p.pack_size}`}
                        fill
                        priority={i === 1}
                        sizes="(max-width: 1024px) 44vw, 22vw"
                        className="object-cover"
                      />
                    )}
                  </Link>
                ))}

                {pills.map((f) => (
                  <span key={f.k} className={`factpill factpill--${f.i + 1}`}>
                    <b>{f.v}</b> {f.k}
                  </span>
                ))}

              </div>
            </div>
          )}
        </div>

        <div
          className="wave"
          aria-hidden="true"
          style={{ "--wave-color": "#eef6d9" } as React.CSSProperties}
        />
      </section>

      <Marquee items={marqueeItems} className="border-b border-brand/10 bg-[#eef6d9]" />

      {/* ================= PRODUCTS ================= */}
      <section id="range" className="band-mint">
        <div className="shell py-24 md:py-32">
          <Reveal className="relative mb-14 flex flex-wrap items-end justify-between gap-6">
            <span className="ghost" aria-hidden="true">Range</span>
            <div className="relative">
              <p className="eyebrow">The range</p>
              <h2 className="display-lg mt-4">
                {products.length === 9 ? "Nine" : products.length} formulations.
              </h2>
              <p className="lede mt-4 max-w-md">
                Immunity, gut, brain, bone, liver, blood and women&apos;s health.
              </p>
            </div>
            <Link href="/products" className="btn btn-outline relative">
              See all {products.length}
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </Reveal>

          <div className="grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {grid.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 80} className="h-full">
                <ProductCard product={product} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SPOTLIGHTS ================= */}
      {spotlights.length > 0 && (
        <section className="shell py-24 md:py-32">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow">Up close</p>
            <h2 className="display-lg mt-4">
              Three packs, <span className="hi">read the label</span> with us.
            </h2>
          </Reveal>
          <div className="space-y-10">
            {spotlights.map((p, i) => (
              <Reveal key={p.id} delay={60}>
                <Spotlight product={p} flip={i % 2 === 1} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ================= THERAPY AREAS ================= */}
      <section className="band-mint">
        <div className="shell py-24 md:py-28">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow">Where we work</p>
              <h2 className="display-lg mt-4">
                Built around <span className="hi">women &amp; child health.</span>
              </h2>
            </div>
            <Link href="/products" className="btn btn-outline">
              Browse by area
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {areas.map((a, i) => (
              <Reveal key={a.label} delay={i * 50}>
                <Link
                  href="/products"
                  className="spot card-lift focus-ring flex h-full flex-col justify-between gap-8 !rounded-2xl p-5"
                  style={{ "--spot": a.spot } as React.CSSProperties}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                    style={{ color: a.spot }}
                  >
                    <a.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-[1rem] leading-tight font-bold text-brand-deep">
                    {a.label}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE LABEL ================= */}
      <section className="shell py-24 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Read our label</p>
            <h2 className="display-lg mt-4">
              Every quantity, <span className="hi">printed.</span>
            </h2>
            <ol className="mt-10 space-y-6">
              {[
                { n: "01", t: "An exact amount beside every ingredient" },
                { n: "02", t: "% RDA against ICMR-NIN 2020" },
                { n: "03", t: "Batch, manufacturer and licence on every pack" },
              ].map((s) => (
                <li key={s.n} className="flex items-center gap-4">
                  <span className="numpill">{s.n}</span>
                  <span className="display-sm text-[1.125rem]">{s.t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-primary">
                How we formulate
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Ask for a batch certificate
              </Link>
            </div>
          </Reveal>

          <Reveal delay={90} className="relative">
            <div className="relative mx-auto w-full max-w-[34rem] pb-24 sm:pr-6">
              <LeafGlyph className="pointer-events-none absolute -top-10 right-6 h-56 w-56 rotate-12 text-brand/[0.07] lg:-right-6" />
              {labelShots[0] && (
                <div
                  className="spot relative w-[64%] overflow-hidden !rounded-[1.75rem] p-4 shadow-[0_40px_80px_-40px_rgba(0,60,35,0.5)]"
                  style={{ "--spot": labelShots[0].spot } as React.CSSProperties}
                >
                  <span className="relative block aspect-4/5">
                    <Image
                      src={labelShots[0].src}
                      alt={`${labelShots[0].name} — printed composition on the pack`}
                      fill
                      sizes="(max-width: 1024px) 60vw, 22vw"
                      className="spot__img scale-[1.3] object-contain"
                    />
                  </span>
                  <span className="chip chip-spot absolute top-6 left-6">{labelShots[0].name}</span>
                </div>
              )}
              {labelShots[1] && (
                <div
                  className="spot !absolute right-0 bottom-0 w-[54%] rotate-3 overflow-hidden !rounded-[1.75rem] p-4 shadow-[0_40px_80px_-40px_rgba(0,60,35,0.55)]"
                  style={{ "--spot": labelShots[1].spot } as React.CSSProperties}
                >
                  <span className="relative block aspect-4/5">
                    <Image
                      src={labelShots[1].src}
                      alt={`${labelShots[1].name} — printed composition on the pack`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 18vw"
                      className="spot__img scale-[1.3] object-contain"
                    />
                  </span>
                  <span className="chip chip-spot absolute top-6 left-6">{labelShots[1].name}</span>
                </div>
              )}
              <span className="factpill" style={{ left: "auto", right: "0", top: "4%", animationDelay: "-2s" }}>
                <b>100%</b> quantities disclosed
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= STANDARD ================= */}
      <section className="band-night overflow-hidden">
        <LeafGlyph className="pointer-events-none absolute -right-24 -bottom-32 h-[34rem] w-[34rem] rotate-12 text-lime-bright/[0.06]" />
        <div className="shell relative py-24 md:py-32">
          <Reveal className="relative max-w-2xl">
            <span className="ghost ghost--dark" aria-hidden="true">Standard</span>
            <p className="eyebrow-lime relative">Our standard</p>
            <h2 className="display-lg display-on-dark relative mt-4">
              Three rules we refuse to bend.
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {standards.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="h-full">
                <li className="card-glass card-lift flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="numpill">{String(i + 1).padStart(2, "0")}</span>
                    <s.icon className="h-7 w-7 text-lime-bright" />
                  </div>
                  <h3 className="display-md display-on-dark mt-8">{s.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/72">
                    {s.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-10">
            <Link
              href="/about"
              className="group focus-ring inline-flex items-center gap-2 text-[0.9375rem] font-bold text-lime-bright"
            >
              Read the full standard
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5"
                strokeWidth={2.2}
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= RX RANGE ================= */}
      <section className="band-mint">
        <div className="shell py-24 md:py-28">
          <Reveal>
            <div className="card grid items-center gap-8 overflow-hidden p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
              <div>
                <p className="eyebrow">For healthcare professionals</p>
                <h2 className="display-lg mt-4">
                  {rx.length} prescription medicines, alongside the {products.length}.
                </h2>
                <p className="lede mt-5 max-w-md">
                  Prescription-only, published for clinicians and pharmacists.
                  Not sold on this website.
                </p>
                <Link href="/prescription-range" className="btn btn-primary mt-8">
                  Browse the Rx range
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              </div>

              <div className="band-night overflow-hidden rounded-2xl p-6 md:p-7">
                <p className="eyebrow-lime">By therapy area</p>
                <ul className="mt-5 divide-y divide-white/10">
                  {rxAreas.map(([area, n]) => (
                    <li key={area} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="font-semibold text-white">{area}</span>
                      <span className="num text-white/60">
                        {String(n).padStart(2, "0")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="shell py-24 md:py-32">
        <Reveal>
          <div className="band-forest relative overflow-hidden rounded-[2rem]">
            <div className="mesh" aria-hidden="true">
              <div className="mesh__blob mesh__blob--lime" style={{ opacity: 0.4 }} />
              <div className="mesh__blob mesh__blob--orange" style={{ opacity: 0.25 }} />
            </div>

            <div className="relative z-10 grid items-center gap-10 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-14">
              <div>
                <p className="eyebrow-lime">{site.tagline}</p>
                <h2 className="display-lg display-on-dark mt-5 max-w-xl">
                  Every formulation, priced at M.R.P.
                </h2>
                <p className="lede lede-on-dark mt-5 max-w-lg">
                  Order today, dispatched within 24 hours.
                  {cheapest > 0 && ` From ${formatPaise(cheapest)}.`}
                </p>

                <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: IconTag, t: COUPON.label, s: "with welcome coupon" },
                    { icon: IconVan, t: "Free delivery", s: "on orders over ₹999" },
                    { icon: IconSealed, t: "24-hour dispatch", s: "sealed, tamper-evident" },
                  ].map((f) => (
                    <li key={f.t} className="card-glass p-4">
                      <f.icon className="h-6 w-6 text-accent" />
                      <p className="font-display mt-3 text-lg leading-tight font-bold text-white">
                        {f.t}
                      </p>
                      <p className="mt-1 text-xs text-white/65">{f.s}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/products" className="btn btn-accent btn-lg">
                    Shop all formulations
                    <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                  </Link>
                  <Link href="/contact" className="btn btn-ghost-light btn-lg">
                    Talk to us
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto grid w-full max-w-sm grid-cols-3 gap-3 md:max-w-none">
                {fan.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className={`focus-ring relative aspect-4/5 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/20 transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] hover:-translate-y-2 ${
                      i === 1 ? "-translate-y-4" : "translate-y-4"
                    }`}
                  >
                    {p.image_url && (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 28vw, 14vw"
                        className="object-cover"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
