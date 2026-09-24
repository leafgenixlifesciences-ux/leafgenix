import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with ${site.name} — product questions, order support, batch certificates and wholesale enquiries.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
    <PageHero
      eyebrow="Customer care"
      title={<>Talk to a <span className="hi">person.</span></>}
      lede="Questions about a formulation, an order, or a batch certificate — this reaches the same small team either way."
      compact
    />
    <section className="shell py-14 md:py-20">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div className="space-y-8">
          {[
            {
              icon: Mail,
              title: "Email",
              lines: [site.email],
              href: `mailto:${site.email}`,
            },
            {
              icon: Phone,
              title: "Phone",
              lines: [site.supportPhone, site.supportHours],
              href: `tel:${site.supportPhone.replace(/\s/g, "")}`,
            },
            {
              icon: MessageCircle,
              title: "WhatsApp",
              lines: ["Fastest for order updates"],
              href: `https://wa.me/${site.whatsapp}`,
            },
            {
              icon: MapPin,
              title: "Registered office",
              lines: site.addressLines.slice(1),
            },
          ].map((block) => (
            <div key={block.title} className="flex gap-4">
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/20">
                <block.icon className="h-4 w-4 text-brand" strokeWidth={1.7} />
              </div>
              <div>
                <h2 className="eyebrow">{block.title}</h2>
                <div className="mt-2 space-y-0.5 text-[0.9375rem] text-body">
                  {block.href ? (
                    <a
                      href={block.href}
                      target={block.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="block text-brand underline underline-offset-4 hover:text-brand"
                    >
                      {block.lines[0]}
                    </a>
                  ) : (
                    <p>{block.lines[0]}</p>
                  )}
                  {block.lines.slice(1).map((l) => (
                    <p key={l} className="text-sm text-muted">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-line bg-surface p-5 text-sm leading-relaxed text-body">
            <strong className="font-medium text-ink">A note on health advice.</strong>{" "}
            We can tell you what is in a product and how it is made. We cannot
            tell you whether it is right for a medical condition — that
            conversation belongs with your doctor.
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
    </>
  );
}
