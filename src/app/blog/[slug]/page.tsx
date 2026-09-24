import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Lightbulb } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { getPost, otherPosts, posts, type BlogBlock } from "@/lib/blog";
import { getProductBySlug } from "@/lib/queries";
import { formatPaise } from "@/lib/money";
import { categoryAccent } from "@/lib/category-accent";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

function day(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Block({ block, accent }: { block: BlogBlock; accent: string }) {
  switch (block.kind) {
    case "h2":
      return (
        <h2 id={slugify(block.text)} className="display-md mt-12 scroll-mt-28 first:mt-0">
          {block.text}
        </h2>
      );
    case "p":
      return <p className="prose-body mt-5 text-[1.0625rem]">{block.text}</p>;
    case "bullets":
      return (
        <ul className="mt-5 space-y-3">
          {block.items.map((b) => (
            <li key={b} className="flex gap-3 text-[1.0625rem] leading-[1.7] text-body">
              <span
                aria-hidden="true"
                className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: accent }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      );
    case "numbered":
      return (
        <ol className="mt-5 space-y-3">
          {block.items.map((b, i) => (
            <li key={b} className="flex gap-3.5 text-[1.0625rem] leading-[1.7] text-body">
              <span className="num mt-px shrink-0 font-semibold text-brand">{i + 1}.</span>
              <span>{b}</span>
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <aside
          className="spot mt-8 p-6 md:p-7"
          style={{ "--spot": accent } as React.CSSProperties}
        >
          <div className="relative">
            <p className="flex items-center gap-2 text-[0.6875rem] font-extrabold tracking-[0.18em] text-brand-deep uppercase">
              <Lightbulb className="h-4 w-4" strokeWidth={2.2} style={{ color: accent }} />
              {block.title ?? "Worth knowing"}
            </p>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink">{block.text}</p>
          </div>
        </aside>
      );
    case "table":
      return (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-tint">
              <tr>
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[0.6875rem] font-bold tracking-[0.1em] text-muted uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-t border-line align-top">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-5 py-3 leading-relaxed ${
                        i === 0 ? "font-semibold text-brand-deep" : "text-body"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = post.related ? await getProductBySlug(post.related) : null;
  const more = otherPosts(post.slug, 3);
  const headings = post.blocks.filter((b) => b.kind === "h2") as { kind: "h2"; text: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: site.fullName },
    publisher: {
      "@type": "Organization",
      name: site.fullName,
      logo: { "@type": "ImageObject", url: siteUrl("/leafgenix-logo.png") },
    },
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ================= HERO ================= */}
      <section className="band-forest overflow-hidden">
        <div className="mesh" aria-hidden="true">
          <div className="mesh__blob mesh__blob--lime" />
        </div>
        <div className="shell relative z-10 pt-12 pb-16 md:pt-16 md:pb-20">
          <Link
            href="/blog"
            className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Journal
          </Link>
          <div className="rise mt-7 flex flex-wrap items-center gap-2">
            <span className="chip chip-glass">{post.category}</span>
            <span className="chip chip-glass">
              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
              {post.readMinutes} min read
            </span>
          </div>
          <h1
            className="display-lg display-on-dark rise mt-5 max-w-4xl text-balance md:text-[clamp(2.4rem,4.2vw,3.9rem)]"
            style={{ animationDelay: "80ms" }}
          >
            {post.title}
          </h1>
          <p
            className="lede lede-on-dark rise mt-6 max-w-2xl"
            style={{ animationDelay: "160ms" }}
          >
            {post.excerpt}
          </p>
          <p
            className="num rise mt-6 text-xs font-semibold tracking-[0.08em] text-white/55 uppercase"
            style={{ animationDelay: "240ms" }}
          >
            {site.fullName} · {day(post.date)}
          </p>
        </div>
      </section>

      {/* ================= BODY ================= */}
      <section className="shell py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <article className="min-w-0 max-w-[44rem]">
            {post.blocks.map((b, i) => (
              <Block key={i} block={b} accent={post.accent} />
            ))}

            <div className="mt-14 rounded-2xl border border-line bg-surface p-6 md:p-7">
              <p className="flex items-center gap-2 text-[0.6875rem] font-extrabold tracking-[0.18em] text-muted uppercase">
                <BookOpen className="h-4 w-4 text-brand" strokeWidth={2.2} />
                Sources
              </p>
              <ol className="mt-4 space-y-2.5">
                {post.sources.map((s, i) => (
                  <li key={s.label} className="flex gap-3 text-sm leading-relaxed text-body">
                    <span className="num shrink-0 font-semibold text-brand">{i + 1}.</span>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line underline-offset-4 transition-colors hover:text-brand"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span>{s.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-faint">
              General nutrition information, not medical advice. Nutraceuticals
              are not intended to diagnose, treat, cure or prevent any disease.
              Speak to your doctor before starting a supplement if you are
              pregnant, breastfeeding, on medication or managing a condition.
            </p>
          </article>

          {/* sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="card p-6">
                <p className="eyebrow">Key takeaways</p>
                <ul className="mt-4 space-y-3">
                  {post.takeaways.map((t) => (
                    <li key={t} className="flex gap-3 text-sm leading-relaxed text-body">
                      <span
                        aria-hidden="true"
                        className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full"
                        style={{ background: post.accent }}
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {headings.length > 0 && (
              <Reveal delay={60}>
                <div className="card p-6">
                  <p className="eyebrow-green">In this article</p>
                  <ol className="mt-4 space-y-2.5">
                    {headings.map((h) => (
                      <li key={h.text}>
                        <a
                          href={`#${slugify(h.text)}`}
                          className="focus-ring block text-sm leading-snug text-body transition-colors hover:text-brand"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            )}

            {related && (
              <Reveal delay={120}>
                <Link
                  href={`/products/${related.slug}`}
                  className="tile card-lift focus-ring group block overflow-hidden rounded-2xl border border-line bg-white"
                  style={{ "--spot": categoryAccent(related.category) } as React.CSSProperties}
                >
                  <div className="tile__frame relative aspect-4/3 rounded-none border-0">
                    {related.image_url && (
                      <Image
                        src={related.image_url}
                        alt={`${related.name}, ${related.pack_size}`}
                        fill
                        sizes="320px"
                        className="object-contain p-4"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="eyebrow">From the range</p>
                    <p className="display-sm mt-2">{related.name}</p>
                    <p className="mt-1 text-sm text-muted">{related.tagline}</p>
                    <p className="mt-3 flex items-baseline gap-2">
                      <span className="stat-num text-2xl text-brand-deep">
                        {formatPaise(related.mrp_paise)}
                      </span>
                      <span className="num text-xs text-faint">{related.pack_size}</span>
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand">
                      See the label
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5"
                        strokeWidth={2.2}
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}
          </aside>
        </div>
      </section>

      {/* ================= MORE ================= */}
      {more.length > 0 && (
        <section className="band-mint">
          <div className="shell py-14 md:py-16">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep reading</p>
                <h2 className="display-lg mt-3">More from the journal</h2>
              </div>
              <Link href="/blog" className="btn btn-outline">
                All articles
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80} className="h-full">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="card card-topline card-lift focus-ring group flex h-full flex-col p-6"
                  >
                    <span
                      className="chip self-start"
                      style={{
                        background: `color-mix(in srgb, ${p.accent} 12%, #fff)`,
                        color: p.accent,
                        borderColor: `color-mix(in srgb, ${p.accent} 30%, transparent)`,
                      }}
                    >
                      {p.category}
                    </span>
                    <h3 className="display-sm mt-4 text-balance">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-body">{p.excerpt}</p>
                    <span className="num mt-auto pt-5 text-xs font-semibold text-muted">
                      {p.readMinutes} min read
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
