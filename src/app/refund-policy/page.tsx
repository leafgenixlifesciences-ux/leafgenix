import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: `How to cancel an order, return a product and get a refund from ${site.legalName} — what qualifies, how long it takes, and how the money comes back.`,
  alternates: { canonical: "/refund-policy" },
};

const sections: LegalSection[] = [
  {
    heading: "Summary",
    blocks: [
      {
        kind: "p",
        text: "Nutraceuticals are consumables, so there are real limits on what can come back. Rather than bury them, here is the whole policy in one table — the detail follows below.",
      },
      {
        kind: "table",
        head: ["Situation", "What you get", "Who pays return shipping"],
        rows: [
          ["Cancelled before dispatch", "Full refund including delivery charge", "Not applicable"],
          ["Wrong product delivered", "Full refund or free replacement", "We do"],
          ["Product damaged in transit", "Full refund or free replacement", "We do"],
          ["Expired, or under 3 months to expiry on arrival", "Full refund or free replacement", "We do"],
          ["Missing item from the parcel", "Refund or dispatch of the missing item", "Not applicable"],
          ["Changed your mind, seal intact, within 7 days", "Refund of product value", "You do"],
          ["Seal broken or product used", "Not eligible", "—"],
          ["Order never delivered / lost by courier", "Full refund", "Not applicable"],
        ],
      },
      {
        kind: "callout",
        title: "The one rule that matters most",
        text: "For safety and hygiene reasons we cannot accept a return once the manufacturer's seal has been broken. This is standard across the nutraceutical industry and exists to protect the next customer. Please check your parcel before opening a pack.",
      },
    ],
  },
  {
    heading: "Cancelling an order",
    blocks: [
      {
        kind: "p",
        text: "You can cancel free of charge at any time before your order is dispatched. Since we dispatch quickly, please contact us as soon as possible.",
      },
      {
        kind: "numbered",
        items: [
          `Email ${site.email} or call ${site.supportPhone} with your order number.`,
          "If the parcel has not yet been handed to the courier, we cancel it immediately and initiate a full refund including any delivery charge.",
          "If it has already been dispatched, we cannot cancel it. You can refuse delivery, or accept it and raise a return under the section below.",
        ],
      },
      {
        kind: "p",
        text: "We may also cancel an order ourselves — for example if the product has gone out of stock, we cannot deliver to your PIN code, or we detect a pricing error or suspected fraud. In every such case you receive a full refund and we contact you to explain.",
      },
    ],
  },
  {
    heading: "What can be returned",
    blocks: [
      {
        kind: "p",
        text: "A return request must be raised within 7 days of delivery. The product must be unopened, unused, and with the manufacturer's seal intact, in its original packaging with all labels and the outer carton.",
      },
      {
        kind: "p",
        text: "The following are eligible, and we bear the cost:",
      },
      {
        kind: "bullets",
        items: [
          "You received a different product from the one you ordered.",
          "The product arrived damaged, leaking or with a broken seal.",
          "The product is expired, or has less than three months remaining to its expiry date on arrival.",
          "An item listed on your invoice was missing from the parcel.",
          "The pack is defective — for example an unreadable batch or expiry print.",
        ],
      },
      {
        kind: "p",
        text: "Change-of-mind returns are also accepted within 7 days if the seal is intact, but the return shipping cost is deducted from your refund and the original delivery charge is not refunded.",
      },
    ],
  },
  {
    heading: "What cannot be returned",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Any product whose seal has been broken, or which has been used in part or in full.",
          "Products returned more than 7 days after delivery.",
          "Products damaged after delivery by incorrect storage — heat, moisture, direct sunlight — or by mishandling.",
          "Products returned without their original packaging, labels or outer carton.",
          "Free items, samples and promotional gifts.",
          "Products bought from a retailer, pharmacy or marketplace rather than directly from this Website. Those must be returned to the seller you bought them from.",
        ],
      },
      {
        kind: "callout",
        title: "A product not working as you hoped is not a defect",
        text: "Nutraceuticals act gradually and individual responses vary. We cannot accept a return on the basis that you did not experience a particular benefit, and we would rather say so plainly than imply otherwise. If you have a concern about how a product is working for you, call us — we would genuinely like to hear it.",
      },
    ],
  },
  {
    heading: "How to raise a return",
    blocks: [
      {
        kind: "numbered",
        items: [
          `Email ${site.email} within 7 days of delivery, or call ${site.supportPhone} during ${site.supportHours}.`,
          "Include your order number, which item is affected, and the reason.",
          "Attach clear photographs of the product, the seal, the batch and expiry print, and the outer packaging. For a damaged parcel, photograph it before opening if you can.",
          "We respond within one working day with an approval and the next step.",
          "If approved, we arrange a reverse pickup where our courier services your PIN code. Where reverse pickup is not available we will ask you to self-ship and will reimburse reasonable courier charges against a receipt.",
          "Once we receive and inspect the item, we initiate your refund.",
        ],
      },
      {
        kind: "callout",
        title: "Damaged parcels — please act within 48 hours",
        text: `If your parcel arrives visibly damaged, photograph it before opening and email ${site.email} within 48 hours of delivery. This lets us raise a claim with the courier, and makes a replacement straightforward.`,
      },
    ],
  },
  {
    heading: "Refund timelines",
    blocks: [
      {
        kind: "table",
        head: ["Stage", "Timeline"],
        rows: [
          ["We approve your request", "Within 1 working day of receiving it"],
          ["Reverse pickup, where available", "2–5 working days"],
          ["Inspection on receipt", "1–2 working days"],
          ["Refund initiated by us", "Within 2 working days of inspection"],
          ["Money reaches your account", "5–7 working days after initiation"],
          ["Cancelled or undelivered order", "Refund initiated immediately on approval"],
        ],
      },
      {
        kind: "bullets",
        items: [
          "Refunds are always made to the original payment method used for the order. We cannot refund to a different card, account or UPI ID.",
          "We do not issue cash refunds and we do not refund to a wallet unless that is where the payment came from.",
          "The final leg — from our payment gateway to your bank — is controlled by your bank or card issuer, not by us. 5–7 working days is typical; some banks take longer.",
          "Where a delivery charge was paid on an order returned by choice, the delivery charge is not refunded.",
          "Where the return is our fault, you are refunded in full including all shipping.",
        ],
      },
      {
        kind: "p",
        text: `Once we initiate a refund we will send you the refund reference. If the money has not reached you 10 working days after that, contact us with the reference and we will trace it with Razorpay.`,
      },
    ],
  },
  {
    heading: "Failed, duplicate and pending payments",
    blocks: [
      {
        kind: "p",
        text: "If money was debited but your order did not confirm, it is almost always an authorisation hold rather than a completed payment. Banks reverse these automatically, usually within 5–7 working days.",
      },
      {
        kind: "p",
        text: `If it has not reversed after 7 working days, email ${site.email} with your bank reference or UTR number and the date and amount. We will trace it with Razorpay and refund you if the amount did in fact reach us.`,
      },
      {
        kind: "p",
        text: "If you were charged twice for the same order, contact us immediately. We refund the duplicate charge in full, typically within 2 working days of confirming it.",
      },
    ],
  },
  {
    heading: "Replacements",
    blocks: [
      {
        kind: "p",
        text: "Where a return is approved because of an error or damage on our side, you may choose a free replacement instead of a refund. Replacements are dispatched within 2 working days of the returned item being received, or immediately where we can see the issue from your photographs and do not need the item back.",
      },
      {
        kind: "p",
        text: "If the product is out of stock at the time of replacement, we will offer you the choice of waiting for restock or taking a full refund.",
      },
    ],
  },
  {
    heading: "Products bought elsewhere",
    blocks: [
      {
        kind: "p",
        text: `This policy covers orders placed on ${site.domain} only. If you bought a ${site.name} product from a pharmacy, retailer, distributor or another online marketplace, please raise your return with them under their policy — we are not able to refund a purchase we did not take payment for.`,
      },
      {
        kind: "p",
        text: `That said, if you have a quality concern about any ${site.name} product wherever you bought it, please tell us. Quality complaints are recorded and investigated regardless of the sales channel, and we can provide the batch certificate.`,
      },
    ],
  },
  {
    heading: "Complaints and escalation",
    blocks: [
      {
        kind: "p",
        text: `If you are unhappy with how a return or refund has been handled, escalate to our Grievance Officer at ${site.email} or ${site.supportPhone}, quoting your order number. We acknowledge within 48 hours and aim to resolve within 30 days.`,
      },
      {
        kind: "p",
        text: "Nothing in this policy limits your statutory rights under the Consumer Protection Act, 2019, including your right to approach a consumer forum.",
      },
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Cancellation &"
      titleAccent="Refund Policy"
      updated="18 August 2026"
      effective="18 August 2026"
      intro={`Nutraceuticals are consumables, so there are limits on what can come back. Here is exactly where those limits are, what you get in each situation, and how long the money takes to reach you.`}
      sections={sections}
    />
  );
}
