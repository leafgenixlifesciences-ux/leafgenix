import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";
import { formatPaise } from "@/lib/money";
import {
  FREE_SHIPPING_THRESHOLD_PAISE,
  FLAT_SHIPPING_PAISE,
} from "@/lib/shipping";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description: `Where ${site.legalName} delivers, how long it takes, what it costs, and what happens if a parcel is delayed, damaged or undelivered.`,
  alternates: { canonical: "/shipping-policy" },
};

const sections: LegalSection[] = [
  {
    heading: "Summary",
    blocks: [
      {
        kind: "table",
        head: ["Question", "Answer"],
        rows: [
          ["Where do you ship?", "All serviceable PIN codes across India"],
          ["Do you ship internationally?", "Not at present"],
          [
            "What does delivery cost?",
            `Free on orders of ${formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)} and above; a flat ${formatPaise(FLAT_SHIPPING_PAISE)} below that`,
          ],
          ["When is my order dispatched?", "Same working day if ordered before 2:00 PM IST"],
          ["How long does delivery take?", "2–4 working days to metros, 4–7 elsewhere"],
          ["How do I track it?", "Tracking number sent by email and SMS on dispatch"],
          ["Is Cash on Delivery available?", "No — all orders are prepaid"],
        ],
      },
    ],
  },
  {
    heading: "Where we deliver",
    blocks: [
      {
        kind: "p",
        text: "We ship to all serviceable PIN codes across India through our courier partners.",
      },
      {
        kind: "bullets",
        items: [
          "We do not currently ship outside India.",
          "A small number of remote, restricted or non-serviceable PIN codes cannot be reached by our courier partners.",
          "If your PIN code turns out to be non-serviceable after you have ordered, we will contact you within one working day and refund the order in full.",
          "We do not deliver to PO Box addresses, as our couriers require a physical address and a contactable recipient.",
        ],
      },
    ],
  },
  {
    heading: "Dispatch timelines",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Orders placed before 2:00 PM IST on a working day are dispatched the same day.",
          "Orders placed after 2:00 PM IST, on Sundays, or on public holidays are dispatched the next working day.",
          "Working days are Monday to Saturday, excluding public holidays.",
          "During festival periods, sale events or unusual demand, dispatch may take an additional 1–2 working days. We will say so on the Website when that is the case.",
        ],
      },
      {
        kind: "p",
        text: "You will receive an email and SMS with your tracking number as soon as the parcel leaves our warehouse.",
      },
    ],
  },
  {
    heading: "Delivery timelines",
    blocks: [
      {
        kind: "table",
        head: ["Destination", "Typical delivery time after dispatch"],
        rows: [
          ["Metro cities", "2–4 working days"],
          ["Tier-2 cities and state capitals", "3–5 working days"],
          ["Other locations", "4–7 working days"],
          ["Remote and hill areas, North-East, islands", "7–10 working days"],
        ],
      },
      {
        kind: "callout",
        title: "These are estimates, not guarantees",
        text: "Delivery times are provided by our courier partners and are not commitments. Delays caused by weather, natural events, strikes, regional restrictions, public holidays, courier network congestion or incorrect address details are outside our control — though we will always help you chase a parcel.",
      },
    ],
  },
  {
    heading: "Delivery charges",
    blocks: [
      {
        kind: "table",
        head: ["Order value", "Delivery charge"],
        rows: [
          [
            `${formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)} and above`,
            "Free",
          ],
          [
            `Below ${formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)}`,
            `${formatPaise(FLAT_SHIPPING_PAISE)} flat`,
          ],
        ],
      },
      {
        kind: "bullets",
        items: [
          "The delivery charge, if any, is shown in your cart and again at checkout before you pay.",
          "The free-delivery threshold is assessed on the order subtotal after any discount and before delivery charge.",
          "No charge of any kind is added after payment. There are no handling fees, no COD fees and no hidden surcharges.",
        ],
      },
    ],
  },
  {
    heading: "Address accuracy and delivery attempts",
    blocks: [
      {
        kind: "p",
        text: "Please double-check your address, PIN code and mobile number at checkout. Our couriers call before delivery, so an unreachable number is the most common cause of a failed delivery.",
      },
      {
        kind: "bullets",
        items: [
          "We cannot change a delivery address once the parcel has been handed to the courier.",
          "Couriers make up to three delivery attempts. Please keep your phone reachable.",
          "If all three attempts fail, or the address is found to be incomplete or incorrect, the parcel is returned to us.",
          "On a return-to-origin, we refund the order value minus the actual two-way shipping cost incurred.",
          "If you would like the parcel re-dispatched instead, we can do that once you confirm a corrected address; fresh delivery charges apply.",
        ],
      },
    ],
  },
  {
    heading: "Receiving your parcel",
    blocks: [
      {
        kind: "numbered",
        items: [
          "Check the outer packaging before accepting the parcel. If it is visibly damaged, open or tampered with, please refuse delivery or photograph it before opening.",
          "Check that the manufacturer's seal on each pack is intact.",
          "Check the batch number and expiry date printed on the pack against your invoice.",
          `Report any problem to ${site.email} within 48 hours of delivery so we can raise a claim with the courier.`,
        ],
      },
      {
        kind: "callout",
        title: "Storage after delivery",
        text: "Please store your products as directed on the pack — generally below 25–30°C, away from direct sunlight and moisture, and out of reach of children. Products damaged by incorrect storage after delivery are not eligible for return.",
      },
    ],
  },
  {
    heading: "Damaged, missing and lost parcels",
    blocks: [
      {
        kind: "p",
        text: "If something goes wrong in transit, we deal with the courier so that you do not have to.",
      },
      {
        kind: "bullets",
        items: [
          `Parcel arrived damaged: photograph it before opening if possible and email ${site.email} within 48 hours. We replace it at no cost.`,
          "An item is missing from the parcel: tell us within 48 hours and we will either dispatch the missing item or refund it.",
          "Tracking shows delivered but you have not received it: contact us within 48 hours. We raise an investigation with the courier, which typically takes 3–5 working days, and resolve it with a replacement or refund.",
          "Parcel lost in transit: once the courier confirms the loss, you get a full refund or a free replacement, whichever you prefer.",
        ],
      },
    ],
  },
  {
    heading: "Order tracking",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Your tracking number is emailed and texted to you on dispatch.",
          "Your order confirmation page remains available at its permanent link and shows current status.",
          "If you placed the order while signed in, all your orders and their statuses are visible under your account.",
          `If tracking has not updated for more than 48 hours, contact us with your order number and we will chase it.`,
        ],
      },
    ],
  },
  {
    heading: "Prescription medicines are not shipped",
    blocks: [
      {
        kind: "callout",
        title: "Rx Range is reference only",
        text: `The 21 prescription medicines listed under our Rx Range are published so that healthcare professionals, pharmacists and distributors can see our portfolio. They are not sold or shipped through ${site.domain}. They must be dispensed by a licensed pharmacist against a valid prescription. For distribution or availability enquiries, please contact us directly.`,
      },
    ],
  },
  {
    heading: "Questions and complaints",
    blocks: [
      {
        kind: "p",
        text: `For anything to do with a delivery, email ${site.email} or call ${site.supportPhone} during ${site.supportHours}. Please have your order number ready — it makes everything faster.`,
      },
      {
        kind: "p",
        text: "Cancellations, returns and refunds are covered separately in our Cancellation & Refund Policy.",
      },
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping &"
      titleAccent="Delivery Policy"
      updated="18 August 2026"
      effective="18 August 2026"
      intro={`How, when and where ${site.legalName} delivers your order — including what it costs, how long it takes, and what happens if a parcel is delayed, damaged or never arrives.`}
      sections={sections}
    />
  );
}
