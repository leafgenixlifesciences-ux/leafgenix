import Link from "next/link";
import {
  CalendarDays,
  List,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { site } from "@/lib/site";
import { PageHero } from "@/components/page-hero";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "callout"; title?: string; text: string }
  | { kind: "definitions"; items: { term: string; text: string }[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ContentsList({ sections }: { sections: LegalSection[] }) {
  return (
    <ol className="space-y-3">
      {sections.map((s) => (
        <li key={s.heading}>
          <Link
            href={`#${slugify(s.heading)}`}
            className="focus-ring group flex gap-3 text-[0.875rem] leading-snug text-body transition-colors hover:text-brand"
          >
            <span
              aria-hidden="true"
              className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full bg-accent transition-colors group-hover:bg-brand"
            />
            {s.heading}
          </Link>
        </li>
      ))}
    </ol>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="prose-body mt-4">{block.text}</p>;

    case "bullets":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((b) => (
            <li
              key={b}
              className="flex gap-3 text-[0.9375rem] leading-[1.7] text-body"
            >
              <span
                aria-hidden="true"
                className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      );

    case "numbered":
      return (
        <ol className="mt-4 space-y-2.5">
          {block.items.map((b, i) => (
            <li
              key={b}
              className="flex gap-3.5 text-[0.9375rem] leading-[1.7] text-body"
            >
              <span className="num mt-px shrink-0 font-semibold text-brand">
                {i + 1}.
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ol>
      );

    case "definitions":
      return (
        <dl className="mt-4 space-y-3.5">
          {block.items.map((d) => (
            <div key={d.term}>
              <dt className="text-[0.9375rem] font-semibold text-brand-deep">
                {d.term}
              </dt>
              <dd className="prose-body mt-1">{d.text}</dd>
            </div>
          ))}
        </dl>
      );

    case "table":
      return (
        <div className="mt-5 overflow-x-auto rounded-xl border border-line">
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
                <tr
                  key={row.join("|")}
                  className="border-t border-line align-top"
                >
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-5 py-3 ${
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

    case "callout":
      return (
        <div className="mt-5 rounded-xl border-l-[3px] border-accent bg-accent/8 px-5 py-4">
          {block.title && (
            <p className="text-[0.9375rem] font-bold text-brand-deep">
              {block.title}
            </p>
          )}
          <p
            className={`text-[0.9375rem] leading-[1.7] text-body ${block.title ? "mt-1.5" : ""}`}
          >
            {block.text}
          </p>
        </div>
      );
  }
}

export function LegalPage({
  title,
  titleAccent,
  intro,
  updated,
  effective,
  sections,
}: {
  /** First half of the heading, set in ink. */
  title: string;
  /** Second half, set in the brand accent. */
  titleAccent: string;
  intro: React.ReactNode;
  updated: string;
  effective?: string;
  sections: LegalSection[];
}) {
  return (
    <>
    <PageHero
      eyebrow="Policy"
      title={<>{title} <span className="hi">{titleAccent}</span></>}
      lede={intro}
      compact
    />
    <div className="band-mint py-8 md:py-12">
      <div className="shell grid items-start gap-6 lg:grid-cols-[17.5rem_1fr] lg:gap-7">
        {/* ---------------- contents ---------------- */}
        {/* Mobile: collapsed by default, so a 20-item list does not push the
            document off the first screen. Desktop: a sticky rail. */}
        <details className="doc-card group p-5 lg:hidden">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-[0.9375rem] font-bold tracking-[0.06em] text-brand-deep uppercase">
              <List className="h-4 w-4 text-brand" strokeWidth={2.2} />
              Contents
            </span>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line-strong text-xs text-muted transition-transform duration-400 group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-5 border-t border-line pt-5">
            <ContentsList sections={sections} />
            <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.8} />
              Last updated: {updated}
            </p>
          </div>
        </details>

        <nav
          aria-label="On this page"
          className="doc-card hidden p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:block"
        >
          <h2 className="flex items-center gap-2.5 text-[0.9375rem] font-bold tracking-[0.06em] text-brand-deep uppercase">
            <List className="h-4 w-4 text-brand" strokeWidth={2.2} />
            Contents
          </h2>
          <div className="accent-bar mt-3" />

          <div className="mt-5">
            <ContentsList sections={sections} />
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.8} />
              Last updated: {updated}
            </p>
          </div>
        </nav>

        {/* ---------------- document ---------------- */}
        <div className="doc-card min-w-0 p-7 md:p-11">
          <div className="flex flex-wrap gap-2.5">
            {effective && (
              <span className="doc-chip">
                <CalendarDays
                  className="h-3.5 w-3.5 text-brand"
                  strokeWidth={1.9}
                />
                Effective: {effective}
              </span>
            )}
            <span className="doc-chip">
              <MapPin className="h-3.5 w-3.5 text-brand" strokeWidth={1.9} />
              {site.city}, {site.state}
            </span>
            <a
              href={`tel:${site.supportPhone.replace(/\s/g, "")}`}
              className="doc-chip focus-ring transition-colors hover:border-brand hover:text-brand"
            >
              <Phone className="h-3.5 w-3.5 text-brand" strokeWidth={1.9} />
              <span className="num">{site.supportPhone}</span>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="doc-chip focus-ring transition-colors hover:border-brand hover:text-brand"
            >
              <Mail className="h-3.5 w-3.5 text-brand" strokeWidth={1.9} />
              {site.email}
            </a>
          </div>

          <div className="mt-8 border-t border-line" />

          {sections.map((section, i) => (
            <section
              key={section.heading}
              id={slugify(section.heading)}
              className="scroll-mt-[calc(var(--header-h)+1.5rem)] pt-9"
            >
              <h2 className="flex items-center gap-4 text-[1.375rem] leading-tight font-bold tracking-[-0.02em] text-brand-deep">
                <span className="doc-badge">{i + 1}</span>
                <span>{section.heading}</span>
              </h2>
              <div className="section-rule mt-3.5" />

              <div className="mt-1">
                {section.blocks.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </div>
            </section>
          ))}

          {/* contact — Razorpay expects a reachable merchant on every policy */}
          <section className="mt-11 rounded-xl border border-line bg-tint p-6 md:p-7">
            <h2 className="text-lg font-bold text-brand-deep">
              Questions about this policy?
            </h2>
            <p className="prose-body mt-1.5">
              Write to us and a person will reply — usually within one working
              day.
            </p>

            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: site.email,
                  href: `mailto:${site.email}`,
                  note: null,
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: site.supportPhone,
                  href: `tel:${site.supportPhone.replace(/\s/g, "")}`,
                  note: site.supportHours,
                },
                {
                  icon: MapPin,
                  label: "Registered office",
                  value: null,
                  href: null,
                  note: null,
                },
              ].map((c) => (
                <div key={c.label} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <c.icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase">
                      {c.label}
                    </dt>
                    <dd className="mt-1 text-sm">
                      {c.href && c.value ? (
                        <a
                          href={c.href}
                          className="focus-ring break-words text-brand underline underline-offset-4"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <span className="block leading-relaxed text-body">
                          {site.addressLines.slice(1).map((l) => (
                            <span key={l} className="block">
                              {l}
                            </span>
                          ))}
                        </span>
                      )}
                      {c.note && (
                        <span className="mt-0.5 block text-xs text-muted">
                          {c.note}
                        </span>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <nav
            aria-label="Other policies"
            className="mt-6 flex flex-wrap gap-2.5"
          >
            {[
              { href: "/terms", label: "Terms & Conditions" },
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/refund-policy", label: "Cancellation & Refund" },
              { href: "/shipping-policy", label: "Shipping & Delivery" },
              { href: "/contact", label: "Contact Us" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="focus-ring rounded-full border border-line-strong bg-white px-4 py-2 text-xs font-medium text-body transition-colors hover:border-brand hover:text-brand"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
    </>
  );
}
