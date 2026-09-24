import type { Metadata } from "next";

import clinicalOutreach from "../../../public/gallery/clinical-outreach-display.webp";
import healthcareConversation from "../../../public/gallery/healthcare-conversation.webp";
import healthcareGroup from "../../../public/gallery/healthcare-professionals-group.webp";
import representative from "../../../public/gallery/leaf-genix-event-representative.webp";
import productDisplay from "../../../public/gallery/nutraceutical-product-display.webp";
import academyPanel from "../../../public/gallery/pediatric-academy-panel.webp";
import sessionVenue from "../../../public/gallery/scientific-session-venue.webp";
import welcomeVenue from "../../../public/gallery/welcome-delegates-venue.webp";

import { EventGallery, type GalleryImage } from "@/components/event-gallery";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Leaf Genix Lifesciences at scientific sessions and healthcare-professional engagements across North India.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: `Gallery · ${site.fullName}`,
    description:
      "A visual record of scientific exchange, product education and conversations with healthcare professionals.",
    images: [{ url: siteUrl("/gallery/healthcare-professionals-group.webp") }],
  },
};

const images: GalleryImage[] = [
  {
    src: healthcareGroup,
    alt: "Healthcare professionals and delegates together after a Leaf Genix scientific session",
    title: "A room built for exchange",
    caption: "Healthcare professionals and delegates following a scientific session.",
    size: "wide",
  },
  {
    src: academyPanel,
    alt: "Panel discussion at the Jalandhar Academy of Pediatrics with Leaf Genix displays",
    title: "Ideas at the table",
    caption: "A knowledge-sharing session with the Jalandhar Academy of Pediatrics.",
    size: "standard",
  },
  {
    src: productDisplay,
    alt: "Leaf Genix nutraceutical products and scientific literature arranged for delegates",
    title: "The formulation, up close",
    caption: "Product packs and educational material prepared for delegates.",
    size: "portrait",
  },
  {
    src: sessionVenue,
    alt: "Scientific session venue prepared with Leaf Genix product information displays",
    title: "Before the conversation begins",
    caption: "The venue prepared for an evening of clinical discussion.",
    size: "wide",
  },
  {
    src: healthcareConversation,
    alt: "Healthcare professionals in conversation beside a Leaf Genix product display",
    title: "Conversation, not a sales pitch",
    caption: "One-to-one engagement around formulations and patient needs.",
    size: "wide",
  },
  {
    src: welcomeVenue,
    alt: "Welcome delegates display inside a Leaf Genix scientific session venue",
    title: "Welcome, delegates",
    caption: "A considered setting for an open, useful exchange.",
    size: "portrait",
  },
  {
    src: representative,
    alt: "Leaf Genix representative at a healthcare professional event",
    title: "Representing the work",
    caption: "On the ground at a healthcare-professional engagement.",
    size: "portrait",
  },
  {
    src: clinicalOutreach,
    alt: "Leaf Genix and Apollo Clinic City Hospital displays with product packs in Chandigarh",
    title: "Clinical outreach in Chandigarh",
    caption: "Leaf Genix product education alongside Apollo Clinic and City Hospital.",
    size: "wide",
  },
];

export default function GalleryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${site.fullName} event gallery`,
    description:
      "Scientific sessions and healthcare-professional engagements by Leaf Genix Lifesciences.",
    image: images.map((image) => ({
      "@type": "ImageObject",
      contentUrl: siteUrl(image.src.src),
      caption: image.caption,
      name: image.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <PageHero
        title={<>Science, shared<br />in person.</>}
        lede="A visual record of the rooms, people and conversations behind our work with healthcare professionals."
      />

      <main id="main" className="shell py-14 md:py-20">
        <div className="mb-10 grid gap-6 border-b border-line pb-10 md:grid-cols-[1fr_1.25fr] md:items-end md:gap-14">
          <h2 className="display-lg max-w-lg text-balance">Where research meets conversation.</h2>
          <p className="max-w-xl text-[0.95rem] leading-7 text-muted md:justify-self-end">
            Clear labels begin with clear dialogue. These moments capture our team sharing product information, listening to clinicians and supporting thoughtful discussions around women and child health.
          </p>
        </div>

        <EventGallery images={images} />
      </main>
    </>
  );
}
