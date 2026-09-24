import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Marquee } from "@/components/marquee";
import { PageHero } from "@/components/page-hero";
import { getProducts } from "@/lib/queries";
import { trustPoints, site } from "@/lib/site";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nutraceuticals",
  description:
    "Every Leaf Genix nutraceutical — Synvit-Forte, Probion, Edo Well, L-Sharp 400, Firtilo-f, MD3 Nano Shot, Perfect Liv, Haemerange and Calcin-K27. Full quantities disclosed on every label.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      <PageHero
        eyebrow="Nutraceuticals"
        title={<>{products.length} formulations. Every quantity <span className="hi">printed.</span></>}
        lede="Research-led doses, every quantity printed, no prescription needed."
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="chip chip-glass">
              {c}
            </span>
          ))}
        </div>
      </PageHero>

      <Marquee items={trustPoints} className="border-b border-brand/10 bg-lime-bright/25" />

      <section className="shell py-16 md:py-24">
        <div className="grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 3) * 70} className="h-full">
              <ProductCard product={product} priority={i < 3} />
            </Reveal>
          ))}
        </div>

        {products.length === 0 && (
          <div className="card px-8 py-20 text-center">
            <p className="display-md">Nothing to show yet</p>
            <p className="prose-body mx-auto mt-3 max-w-md">
              The catalogue is empty. If you are running this locally, check
              that your Supabase environment variables are set in{" "}
              <code className="num rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                .env.local
              </code>
              .
            </p>
          </div>
        )}
      </section>

      <section className="shell pb-20">
        <Reveal>
          <div className="card flex flex-wrap items-center justify-between gap-6 p-8">
            <div>
              <h2 className="display-md">
                Looking for a prescription medicine?
              </h2>
              <p className="prose-body mt-2 max-w-xl">
                {site.fullName} also makes 21 Rx products across anti-infectives,
                neurology, psychiatry, cardiology and hepatology. They are listed
                for information — not sold online.
              </p>
            </div>
            <Link href="/prescription-range" className="btn btn-outline">
              View the Rx range
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
