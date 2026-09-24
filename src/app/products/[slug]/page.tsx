import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Quote,
  RotateCcw,
} from "lucide-react";

import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductCarousel } from "@/components/product-carousel";
import { Reveal } from "@/components/reveal";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { formatPaise, rupees } from "@/lib/money";
import { deliveryWindow, siteUrl } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/shipping";
import { site } from "@/lib/site";
import { categoryAccent } from "@/lib/category-accent";
import { posts } from "@/lib/blog";
import { IconCertified, IconVan } from "@/components/icons";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} — ${product.pack_size}`,
    description: product.short_description ?? product.tagline ?? undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} · ${site.name}`,
      description: product.short_description ?? undefined,
      images: product.image_url ? [product.image_url] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(slug, 3);
  const article = posts.find((p) => p.related === slug);
  const price = product.mrp_paise;
  const inStock = product.stock > 0;
  const spot = categoryAccent(product.category);
  const gallery =
    product.gallery?.length > 0
      ? product.gallery
      : product.image_url
        ? [product.image_url]
        : [];

  const productSchema = {
    "@type": "Product",
    "@id": siteUrl(`/products/${product.slug}#product`),
    name: product.name,
    description: product.short_description ?? product.tagline,
    sku: product.slug,
    category: product.category,
    brand: { "@type": "Brand", name: site.fullName },
    image: gallery.map((g) => siteUrl(g)),
    offers: {
      "@type": "Offer",
      url: siteUrl(`/products/${product.slug}`),
      priceCurrency: "INR",
      price: rupees(price).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": siteUrl("/#organization") },
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      productSchema,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
          { "@type": "ListItem", position: 2, name: "Nutraceuticals", item: siteUrl("/products") },
          { "@type": "ListItem", position: 3, name: product.name, item: siteUrl(`/products/${product.slug}`) },
        ],
      },
      ...(product.faqs.length > 0
        ? [{
        "@type": "FAQPage",
        mainEntity: product.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
          }]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="band-mint">
      <div className="shell pt-7">
        <nav aria-label="Breadcrumb">
          <Link
            href="/products"
            className="group focus-ring inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brand"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:-translate-x-1"
              strokeWidth={1.9}
            />
            All nutraceuticals
          </Link>
        </nav>
      </div>

      {/* ================= BUY BLOCK ================= */}
      <section className="shell grid gap-10 py-8 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-12 lg:pb-20">
        <div
          className="spot rise p-3 sm:p-4 lg:!sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start"
          style={{ "--spot": spot } as React.CSSProperties}
        >
          <ProductCarousel
            images={gallery}
            alt={`${product.name}, ${product.pack_size}`}
            priority
          />
        </div>

        <div className="rise" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="chip chip-spot" style={{ "--spot": spot } as React.CSSProperties}>{product.category}</span>
            {product.badge && (
              <span className="chip chip-accent">{product.badge}</span>
            )}
          </div>

          <h1 className="display-lg mt-4">{product.name}</h1>
          <p className="lede mt-3">{product.tagline}</p>

          <p className="num mt-5 text-sm text-muted">
            {product.form}
            {product.pack_size ? ` · ${product.pack_size}` : ""}
            {product.flavour ? ` · ${product.flavour} flavour` : ""}
          </p>

          <div className="mt-7 flex items-end gap-3">
            <span className="stat-num text-[2.75rem] text-brand-deep md:text-[3.25rem]">
              {formatPaise(price)}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Inclusive of all taxes ({product.gst_rate}% GST)
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-signal" : "bg-alert"}`}
            />
            <span className={inStock ? "text-signal" : "text-alert"}>
              {inStock
                ? product.stock < 25
                  ? `Only ${product.stock} left in stock`
                  : "In stock — dispatched within 24 hours"
                : "Currently sold out"}
            </span>
          </div>

          <AddToCart product={product} className="mt-7" />

          <ul className="card mt-7 grid gap-3 p-5 text-sm sm:grid-cols-3">
            {[
              {
                icon: IconVan,
                label: `Free delivery over ${formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)}`,
              },
              { icon: RotateCcw, label: "7-day returns on sealed packs" },
              { icon: IconCertified, label: "Batch certificate on request" },
            ].map((f) => (
              <li key={f.label} className="flex items-start gap-2.5 text-body">
                <f.icon
                  className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-brand"
                  strokeWidth={1.7}
                />
                {f.label}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs text-muted">
            Order today and it should reach you between{" "}
            <span className="font-semibold text-body">{deliveryWindow()}</span>.
          </p>

          {product.key_benefits.length > 0 && (
            <div className="mt-9">
              <h2 className="eyebrow-green">What it does</h2>
              <ul className="mt-4 space-y-2.5">
                {product.key_benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-[0.9375rem] text-body"
                  >
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-brand"
                      strokeWidth={2.3}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      </div>

      {/* ================= WHY WE MADE IT ================= */}
      <section className="band-night overflow-hidden">
        <div className="shell relative grid gap-12 py-20 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow-lime">Why we made it</p>
            <h2 className="display-lg display-on-dark mt-4">The thinking behind it</h2>
            <div className="mt-6 space-y-4">
              {(product.description ?? "").split("\n\n").map((para) => (
                <p key={para.slice(0, 40)} className="text-[1rem] leading-relaxed text-white/78">
                  {para}
                </p>
              ))}
            </div>

            {product.ingredients.length > 0 && (
              <>
                <h3 className="eyebrow-lime mt-10">Actives</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.ingredients.map((i) => (
                    <span key={i} className="chip chip-glass">
                      {i}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Reveal>

          {product.uses.length > 0 && (
            <Reveal delay={80}>
              <div className="card p-8">
                <p className="eyebrow">Uses</p>
                <h2 className="display-md mt-3">What it is used for</h2>
                <div className="tick mt-5" />
                <ul className="mt-6 space-y-4">
                  {product.uses.map((u, i) => (
                    <li key={u} className="flex gap-4">
                      <span className="num mt-0.5 text-xs font-bold text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.9375rem] leading-relaxed text-body">
                        {u}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ================= HOW IT DIFFERS ================= */}
      {product.differentiators.length > 0 && (
        <section className="shell py-20 md:py-24">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">The difference</p>
            <h2 className="display-lg mt-4">
              How this differs from other {product.category.toLowerCase()}{" "}
              products
            </h2>
            <p className="lede mt-4">
              Four things you can check on any competing label before you decide.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {product.differentiators.map((d, i) => (
              <Reveal key={d.title} delay={(i % 2) * 80}>
                <article className="card card-lift card-topline h-full p-7">
                  <span className="numpill">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display-md mt-3">{d.title}</h3>
                  <p className="prose-body mt-3">{d.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ================= SPECIFICATIONS ================= */}
      <section className="band-mint">
        <div className="shell py-20 md:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow">Specification</p>
              <h2 className="display-lg mt-4">Every number, stated</h2>
              <p className="prose-body mt-4">
                The full quantitative breakdown, so you can compare us against
                anything else on the shelf.
              </p>
            </div>
            {product.nutrition.length > 0 && (
              <p className="num text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                {product.nutrition.length} nutrients · per serving
              </p>
            )}
          </Reveal>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
            {/* left: the short facts */}
            <div className="space-y-6">
              <Reveal delay={60}>
                <div className="card overflow-hidden">
                  <div className="border-b border-line px-6 py-4">
                    <h3 className="display-sm">Product facts</h3>
                  </div>
                  <dl>
                    {product.specifications.map((s) => (
                      <div
                        key={s.label}
                        className="grid gap-y-1 border-b border-line px-5 py-3.5 last:border-0 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] sm:items-baseline sm:gap-x-6 sm:px-6"
                      >
                        <dt className="text-sm text-muted">{s.label}</dt>
                        <dd className="num text-sm font-semibold text-ink sm:text-right">
                          {s.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>

              {[
                { t: "Full composition", b: product.composition },
                { t: "How to take it", b: product.directions },
              ]
                .filter((x): x is { t: string; b: string } => Boolean(x.b))
                .map((x, i) => (
                  <Reveal key={x.t} delay={120 + i * 60}>
                    <div className="card p-6">
                      <h3 className="display-sm">{x.t}</h3>
                      <p className="prose-body mt-3">{x.b}</p>
                    </div>
                  </Reveal>
                ))}

              {product.safety_info && (
                <Reveal delay={240}>
                  <div className="rounded-[var(--radius-xl)] border border-accent/35 bg-accent/8 p-6">
                    <h3 className="display-sm">Safety information</h3>
                    <p className="prose-body mt-3">{product.safety_info}</p>
                  </div>
                </Reveal>
              )}
            </div>

            {/* right: the table */}
            {product.nutrition.length > 0 && (
              <Reveal delay={90}>
                <div className="card overflow-hidden">
                  <div className="border-b border-line px-6 py-4">
                    <h3 className="display-sm">Nutritional information</h3>
                    <p className="mt-1 text-xs text-muted">
                      Approximate values per serving
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface text-left">
                        <th className="px-6 py-2.5 text-[0.6875rem] font-bold tracking-[0.1em] text-muted uppercase">
                          Nutrient
                        </th>
                        <th className="px-3 py-2.5 text-right text-[0.6875rem] font-bold tracking-[0.1em] text-muted uppercase">
                          Dose
                        </th>
                        <th className="px-3 py-2.5 text-[0.6875rem] font-bold tracking-[0.1em] text-muted uppercase">
                          Unit
                        </th>
                        <th className="px-6 py-2.5 text-right text-[0.6875rem] font-bold tracking-[0.1em] text-muted uppercase">
                          % RDA
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.nutrition.map((n) => (
                        <tr
                          key={n.nutrient}
                          className="border-b border-line last:border-0"
                        >
                          <td className="px-6 py-2 text-body">{n.nutrient}</td>
                          <td className="num px-3 py-2 text-right font-semibold text-ink">
                            {n.dose}
                          </td>
                          <td className="num px-3 py-2 text-muted">{n.unit}</td>
                          <td className="num px-6 py-2 text-right text-muted">
                            {n.rda || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="border-t border-line px-6 py-3 text-[0.6875rem] text-muted">
                    ** Recommended Dietary Allowance not established.
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ================= EVIDENCE ================= */}
      {product.evidence.length > 0 && (
        <section className="shell py-20 md:py-24">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">The evidence</p>
            <h2 className="display-lg mt-4">What the research says</h2>
            <p className="lede mt-4">
              Claims we make about this product, with the source alongside each
              one.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.evidence.map((e, i) => (
              <Reveal key={e.claim.slice(0, 40)} delay={(i % 3) * 70}>
                <figure className="card flex h-full flex-col p-7">
                  <Quote
                    className="h-5 w-5 text-accent"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-body">
                    {e.claim}
                  </blockquote>
                  <figcaption className="mt-5 border-t border-line pt-4 text-xs font-semibold text-brand">
                    {e.source}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {product.faqs.length > 0 && (
        <section className="band-mint border-y border-line">
          <div className="shell grid gap-12 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 className="display-lg mt-4">Asked and answered.</h2>
            </Reveal>
            <div>
              {product.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 60}>
                  <details className="group border-t border-line last:border-b">
                    <summary className="focus-ring flex cursor-pointer list-none items-start justify-between gap-6 py-5">
                      <span className="display-sm">{f.q}</span>
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line-strong text-xs text-muted transition-transform duration-500 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="prose-body pb-6">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= JOURNAL ================= */}
      {article && (
        <section className="shell pt-16 md:pt-20">
          <Reveal>
            <Link
              href={`/blog/${article.slug}`}
              className="spot card-lift focus-ring group flex flex-wrap items-center justify-between gap-6 p-7 md:p-8"
              style={{ "--spot": article.accent } as React.CSSProperties}
            >
              <div className="relative max-w-2xl">
                <p className="eyebrow">From the journal · {article.readMinutes} min read</p>
                <p className="display-md mt-3 text-balance">{article.title}</p>
                <p className="prose-body mt-2">{article.excerpt}</p>
              </div>
              <span className="btn btn-primary">
                Read the article
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5"
                  strokeWidth={2.2}
                />
              </span>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ================= RELATED ================= */}
      {related.length > 0 && (
        <section className="shell py-20 md:py-24">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 className="display-lg">Also worth reading</h2>
            <Link
              href="/products"
              className="group focus-ring inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand"
            >
              All formulations
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5"
                strokeWidth={2}
              />
            </Link>
          </Reveal>
          <div className="grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 70} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
