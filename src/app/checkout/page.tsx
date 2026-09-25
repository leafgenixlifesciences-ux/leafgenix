import type { Metadata } from "next";
import Script from "next/script";
import { CheckoutForm } from "@/components/checkout-form";
import { PageHero } from "@/components/page-hero";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  let defaults: { fullName?: string; email?: string; phone?: string } = {};
  let signedIn = false;

  try {
    const user = await getSessionUser();

    if (user) {
      const supabase = await createClient();
      signedIn = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      defaults = {
        email: user.email ?? undefined,
        fullName: profile?.full_name || undefined,
        phone: profile?.phone || undefined,
      };
    }
  } catch {
    /* checkout works fine for guests — carry on */
  }

  return (
    <>
      <PageHero eyebrow="Step 2 of 2" title="Checkout" compact />
      <section className="shell py-12 md:py-16">
        <CheckoutForm
          defaults={defaults}
          signedIn={signedIn}
          paymentsEnabled={razorpayConfigured()}
        />
      </section>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </>
  );
}
