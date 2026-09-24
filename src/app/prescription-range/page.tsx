import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { getRxProducts } from "@/lib/queries";
import { site } from "@/lib/site";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Prescription range",
  description: `The ${site.fullName} prescription portfolio — anti-infectives, neurology and pain, psychiatry, cardiology, hepatology and haematology. Listed for information; not sold online.`,
  alternates: { canonical: "/prescription-range" },
};

export default async function PrescriptionRangePage() {
  const rx = await getRxProducts();

  const byArea = rx.reduce<Record<string, typeof rx>>((acc, p) => {
    (acc[p.therapy_area] ||= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="For healthcare professionals"
        title={<>Prescription <span className="hi">range</span></>}
        lede={`${rx.length} prescription medicines across ${Object.keys(byArea).length} therapy areas, manufactured under WHO-GMP certification. Published so clinicians, pharmacists and distributors can see exactly what ${site.fullName} makes.`}
      >
        <div className="card-glass flex max-w-3xl gap-3.5 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
          <p className="text-sm leading-relaxed text-white/85">
            <span className="font-bold text-white">
              These products are not sold through this website.
            </span>{" "}
            They are prescription-only medicines and must be dispensed by a
            licensed pharmacist against a valid prescription. For availability,
            distribution or medical information, please{" "}
            <Link href="/contact" className="font-bold text-lime-bright underline underline-offset-4">
              contact us
            </Link>
            .
          </p>
        </div>
      </PageHero>

      <section className="shell py-14 md:py-20">
        <div className="space-y-16">
          {Object.entries(byArea).map(([area, items], groupIndex) => (
            <Reveal key={area} delay={groupIndex * 60}>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
                  <h2 className="display-md">{area}</h2>
                  <span className="num text-sm text-muted">
                    {String(items.length).padStart(2, "0")}{" "}
                    {items.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <ul className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <li key={p.id} className="card card-topline flex h-full flex-col overflow-hidden">
                      <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: p.accent_hex ?? "#005C2D" }}
                        />
                        <div>
                          <h3 className="display-sm">{p.name}</h3>
                          <p className="mt-1 text-xs text-muted">
                            {[p.form, p.pack_size].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>

                      <p className="num mt-4 text-[0.8125rem] leading-relaxed text-body">
                        {p.composition}
                      </p>

                      {p.indications.length > 0 && (
                        <div className="mt-auto pt-5">
                          <h4 className="text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase">
                            Indicated in
                          </h4>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {p.indications.map((ind) => (
                              <span
                                key={ind}
                                className="rounded-full bg-surface-2 px-2.5 py-1 text-[0.6875rem] font-medium text-body"
                              >
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {p.schedule && (
                        <p className="mt-5 rounded-lg bg-alert/8 px-3 py-2 text-[0.6875rem] font-semibold text-alert">
                          {p.schedule} — not to be sold without a prescription
                        </p>
                      )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {rx.length === 0 && (
          <div className="card px-8 py-20 text-center">
            <p className="display-md">Nothing to show yet</p>
            <p className="prose-body mx-auto mt-3 max-w-md">
              The prescription range has not been loaded. Check your Supabase
              connection.
            </p>
          </div>
        )}
      </section>

      <section className="shell pb-20">
        <Reveal>
          <div className="card flex flex-wrap items-center justify-between gap-6 p-8">
            <div>
              <h2 className="display-md">Looking for something you can buy?</h2>
              <p className="prose-body mt-2 max-w-xl">
                Our nutraceuticals need no prescription and ship across India
                — immunity, gut, brain, bone, liver, blood and women&apos;s health.
              </p>
            </div>
            <Link href="/products" className="btn btn-primary">
              Shop nutraceuticals
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
