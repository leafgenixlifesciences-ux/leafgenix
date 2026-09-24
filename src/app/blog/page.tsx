import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { postsByDate } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Journal",
  description: `Plain-English notes on reading labels, vitamins, omega-3 and probiotics from ${site.fullName}. Sourced, specific, and free of miracle claims.`,
  alternates: { canonical: "/blog" },
};

function day(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export default function BlogIndexPage() {
  const [lead, ...rest] = postsByDate;

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title={<>Read the label. <span className="hi">Then read this.</span></>}
        lede="Short, sourced explainers on the things a pack cannot fit — what the numbers mean, how much is enough, and how to tell a good product from a loud one."
        compact
      />

      <section className="band-mint">
        <div className="shell py-14 md:py-20">
          {lead && (
            <Reveal>
              <Link
                href={`/blog/${lead.slug}`}
                className="spot card-lift focus-ring group grid gap-8 p-7 md:grid-cols-[1.1fr_0.9fr] md:p-10"
                style={{ "--spot": lead.accent } as React.CSSProperties}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip chip-spot">{lead.category}</span>
                    <span className="chip">Latest</span>
                  </div>
                  <h2 className="display-lg mt-5 text-balance">{lead.title}</h2>
                  <p className="lede mt-4 max-w-xl">{lead.excerpt}</p>
                  <p className="num mt-6 flex items-center gap-3 text-xs font-semibold text-muted">
                    <span>{day(lead.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      {lead.readMinutes} min read
                    </span>
                  </p>
                </div>
                <div className="flex flex-col justify-between rounded-2xl bg-white/70 p-6 backdrop-blur">
                  <div>
                    <p className="eyebrow-green">In this piece</p>
                    <ul className="mt-4 space-y-3">
                      {lead.takeaways.slice(0, 3).map((t) => (
                        <li key={t} className="flex gap-3 text-sm leading-relaxed text-body">
                          <span
                            aria-hidden="true"
                            className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full"
                            style={{ background: lead.accent }}
                          />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand">
                    Read the article
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5"
                      strokeWidth={2.2}
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80} className="h-full">
                <Link
                  href={`/blog/${p.slug}`}
                  className="card card-topline card-lift focus-ring group flex h-full flex-col p-7"
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
                  <h2 className="display-md mt-5 text-balance">{p.title}</h2>
                  <p className="prose-body mt-3 text-[0.9375rem]">{p.excerpt}</p>
                  <p className="num mt-auto flex items-center gap-3 pt-6 text-xs font-semibold text-muted">
                    <span>{day(p.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      {p.readMinutes} min
                    </span>
                    <ArrowRight
                      className="ml-auto h-4 w-4 text-brand transition-transform duration-500 group-hover:translate-x-1.5"
                      strokeWidth={2.2}
                    />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-faint">
              Everything in the journal is general nutrition information, not
              medical advice. Nutraceuticals support a diet; they do not diagnose,
              treat or cure anything. Talk to your doctor about anything that
              concerns you.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
