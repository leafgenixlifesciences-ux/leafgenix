import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { PageHero } from "@/components/page-hero";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHero eyebrow="Step 1 of 2" title="Your bag" compact />
      <section className="shell py-12 md:py-16">
        <CartView />
      </section>
    </>
  );
}
