import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";
import { formatPaise } from "@/lib/money";
import { COUPON } from "@/lib/offer";
import {
  FREE_SHIPPING_THRESHOLD_PAISE,
  FLAT_SHIPPING_PAISE,
  MAX_QTY_PER_LINE,
} from "@/lib/shipping";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms on which ${site.legalName} sells through ${site.domain} — eligibility, orders, pricing, payment, delivery, liability and governing law.`,
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    heading: "About these terms",
    blocks: [
      {
        kind: "p",
        text: `These Terms & Conditions ("Terms") govern your access to and use of the website ${site.domain} ("Website") and any purchase you make through it. Please read them carefully. By browsing the Website, creating an account, or placing an order, you confirm that you have read, understood and agree to be bound by these Terms and by our Privacy Policy, Cancellation & Refund Policy and Shipping & Delivery Policy, each of which is incorporated into these Terms by reference.`,
      },
      {
        kind: "p",
        text: "If you do not agree with any part of these Terms, please do not use the Website or place an order.",
      },
      {
        kind: "callout",
        title: "This is an electronic record",
        text: "This document is an electronic record under the Information Technology Act, 2000 and the rules made under it, and is published in accordance with Rule 3(1) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. It does not require any physical or digital signature.",
      },
    ],
  },
  {
    heading: "Who you are dealing with",
    blocks: [
      {
        kind: "p",
        text: `The Website is owned and operated by ${site.legalName} ("we", "us", "our"), a ${site.entityType.toLowerCase()} of which ${site.proprietor} is the proprietor, having its place of business at ${site.addressLines.slice(1).join(", ")}.`,
      },
      {
        kind: "table",
        head: ["Detail", "Value"],
        // Rows with an empty value are dropped, so we never publish an
        // unverified registration number.
        rows: (
          [
            ["Legal name", site.legalName],
            ["Constitution", site.entityType],
            ["Proprietor", site.proprietor],
            ["Registered office", site.addressLines.slice(1).join(", ")],
            ["Customer support email", site.email],
            [
              "Customer support phone",
              `${site.supportPhone} (${site.supportHours})`,
            ],
            [
              `FSSAI ${site.fssaiType}`,
              `${site.fssai} — valid to ${site.fssaiValidUpto}`,
            ],
            ["GSTIN", site.gstin],
            ["CIN", site.cin],
            ["Principal manufacturing partner", site.manufacturer],
            ["Manufacturing licence", site.manufacturerLicence],
          ] as [string, string][]
        ).filter(([, value]) => Boolean(value)),
      },
      {
        kind: "definitions",
        items: [
          {
            term: '"You" / "Customer" / "User"',
            text: "Any person who browses the Website, registers an account, or places an order.",
          },
          {
            term: '"Products"',
            text: "The nutraceuticals and dietary supplements offered for sale on the Website.",
          },
          {
            term: '"Rx Range"',
            text: "The prescription medicines listed on the Website for informational purposes only. These are not offered for sale online.",
          },
          {
            term: '"Order"',
            text: "A request submitted by you through the Website to purchase one or more Products.",
          },
        ],
      },
    ],
  },
  {
    heading: "Eligibility to purchase",
    blocks: [
      {
        kind: "bullets",
        items: [
          "You must be at least 18 years of age and competent to contract under the Indian Contract Act, 1872.",
          "You must provide accurate, current and complete information at checkout, including a deliverable Indian address and a reachable mobile number.",
          "You must not be barred from receiving our Products under any applicable law.",
          "If you are purchasing on behalf of an organisation, you confirm you are authorised to bind that organisation to these Terms.",
        ],
      },
      {
        kind: "p",
        text: "Persons who are minors may use the Website only with the involvement of a parent or legal guardian, who will be responsible for the transaction.",
      },
    ],
  },
  {
    heading: "Products, health information and disclaimers",
    blocks: [
      {
        kind: "callout",
        title: "Our online products are nutraceuticals, not medicines",
        text: "The Products sold on this Website are nutraceuticals and dietary supplements regulated under the Food Safety and Standards Act, 2006. They are not drugs. They are not intended to diagnose, treat, cure or prevent any disease, and nothing on this Website constitutes medical advice, diagnosis or a treatment recommendation.",
      },
      {
        kind: "bullets",
        items: [
          "Always read the label and the leaflet inside the pack before use, and do not exceed the stated dose.",
          "Consult a qualified registered medical practitioner before use if you are pregnant, planning a pregnancy, breastfeeding, under 18, elderly, managing any diagnosed medical condition, or taking any prescription medication.",
          "Do not use our Products as a substitute for a balanced diet, prescribed treatment, or professional medical care.",
          "Individual responses to nutraceuticals vary. We make no promise of any specific outcome for any individual.",
          "If you experience an adverse reaction, stop use immediately, seek medical attention, and inform us so we can record it.",
        ],
      },
      {
        kind: "p",
        text: "The Rx Range published on this Website is included solely so that healthcare professionals, pharmacists and distributors can see our portfolio. Those products are prescription-only medicines, are not available for purchase through this Website, and must be dispensed by a licensed pharmacist against a valid prescription from a registered medical practitioner.",
      },
      {
        kind: "p",
        text: "Product images are for illustrative purposes. Packaging, pack artwork and presentation may be updated from time to time. Where there is any difference between the Website and the printed label on the pack you receive, the printed label prevails.",
      },
    ],
  },
  {
    heading: "Pricing and taxes",
    blocks: [
      {
        kind: "bullets",
        items: [
          "All prices are listed in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax unless stated otherwise.",
          "The price applicable to your Order is the price displayed on the Website at the moment you complete payment.",
          "We may change prices, discounts and promotional offers at any time without prior notice. Changes do not affect Orders already paid for.",
          `Delivery charges, where applicable, are shown separately in your cart and at checkout before payment. Orders of ${formatPaise(FREE_SHIPPING_THRESHOLD_PAISE)} and above ship free; below that a flat ${formatPaise(FLAT_SHIPPING_PAISE)} delivery charge applies.`,
          "No charge is ever added after you have paid. The amount you authorise at checkout is the total amount payable.",
        ],
      },
      {
        kind: "callout",
        title: `${COUPON.percent}% welcome coupon`,
        text: `Customers who submit the welcome form and consent to receive offers receive coupon ${COUPON.code}, worth ${COUPON.percent}% off an eligible Website order. The coupon must be applied in the bag or at checkout, cannot be combined with another offer, and may be varied or withdrawn at any time. Product pages display M.R.P. before the coupon.`,
      },
      {
        kind: "callout",
        title: "Pricing errors",
        text: "Despite our best efforts, a Product may occasionally be listed at a materially incorrect price due to a technical or human error. Where this happens we reserve the right to cancel the Order and refund you in full rather than fulfil it, and we will contact you before doing so. We are not obliged to sell at an evidently incorrect price.",
      },
    ],
  },
  {
    heading: "Orders and acceptance",
    blocks: [
      {
        kind: "p",
        text: "Your Order is an offer to buy. It does not create a binding contract by itself. A contract of sale is formed only when we confirm that your Order has been dispatched.",
      },
      {
        kind: "p",
        text: "Between payment and dispatch, we may decline or cancel an Order — in whole or in part — for reasons including:",
      },
      {
        kind: "bullets",
        items: [
          "the Product is out of stock or has been discontinued;",
          "we cannot deliver to your PIN code;",
          "the price or product information was listed in error;",
          "we reasonably suspect fraud, misuse, or a breach of these Terms;",
          "the quantity ordered suggests resale rather than personal consumption; or",
          "we are prevented from fulfilling the Order by law or by circumstances outside our control.",
        ],
      },
      {
        kind: "p",
        text: "In every such case we will notify you and refund the full amount you paid, including any delivery charge, to your original payment method. We are not liable to you beyond that refund.",
      },
      {
        kind: "p",
        text: `We may limit the quantity of any Product per Order, per customer or per address. The Website currently limits each line item to ${MAX_QTY_PER_LINE} units per Order.`,
      },
    ],
  },
  {
    heading: "Payment",
    blocks: [
      {
        kind: "p",
        text: "Payments on this Website are processed by Razorpay Software Private Limited, a payment aggregator authorised by the Reserve Bank of India. By making a payment you also agree to Razorpay's own terms of service and privacy policy, which apply to the payment transaction.",
      },
      {
        kind: "bullets",
        items: [
          "We accept UPI, credit and debit cards, net banking and supported wallets.",
          "We do not receive, see or store your card number, CVV, UPI PIN, net-banking credentials or any other payment credential. Those are collected and handled entirely by Razorpay on their own infrastructure.",
          "Your Order is treated as paid only once we receive a verified payment confirmation from the payment gateway.",
          "If your payment fails or is not confirmed, your Order will not be processed and any amount debited will be reversed by your bank or card issuer, typically within 5–7 working days.",
        ],
      },
      {
        kind: "p",
        text: "We do not currently offer Cash on Delivery. All Orders must be prepaid.",
      },
    ],
  },
  {
    heading: "Delivery, cancellations and refunds",
    blocks: [
      {
        kind: "p",
        text: "Dispatch and delivery are governed by our Shipping & Delivery Policy. Cancellations, returns and refunds are governed by our Cancellation & Refund Policy. Both form part of these Terms and should be read alongside them.",
      },
      {
        kind: "p",
        text: "Risk in the Products passes to you on delivery. Title passes to you once we have received payment in full and the Products have been delivered.",
      },
    ],
  },
  {
    heading: "Accounts",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Creating an account is optional. You can complete a purchase as a guest.",
          "If you create an account, we sign you in using a one-time link sent to your email address. There is no password.",
          "You are responsible for keeping access to your email account secure, since anyone with access to it can sign in as you.",
          "Tell us immediately at " + site.email + " if you believe your account has been accessed without your authorisation.",
          "We may suspend or close an account that we reasonably believe has been used for fraud, abuse, or a breach of these Terms.",
        ],
      },
    ],
  },
  {
    heading: "Acceptable use",
    blocks: [
      {
        kind: "p",
        text: "When using the Website you agree not to:",
      },
      {
        kind: "bullets",
        items: [
          "use it for any unlawful purpose or to place fraudulent, speculative or bad-faith Orders;",
          "attempt to gain unauthorised access to any part of the Website, its servers, its databases, or any connected system;",
          "introduce any virus, trojan, worm or other malicious code;",
          "use any robot, spider, scraper or automated means to access, copy or monitor the Website or its content without our written permission;",
          "resell, redistribute or commercially exploit our Products, content, product photography or copy without our written permission;",
          "impersonate any person, or misrepresent your affiliation with any person or entity;",
          "post or transmit content that is unlawful, defamatory, obscene, or infringes anyone's rights; or",
          "interfere with the proper working of the Website or place an unreasonable load on our infrastructure.",
        ],
      },
    ],
  },
  {
    heading: "Intellectual property",
    blocks: [
      {
        kind: "p",
        text: `All content on this Website — including the ${site.name} name, the Leaf Genix logo and marks, product names, product photography, packaging design, written copy, page layouts, graphics and software — is owned by ${site.legalName} or its licensors and is protected under Indian and international intellectual property law.`,
      },
      {
        kind: "p",
        text: "You may view and print pages of the Website for your own personal, non-commercial use. Any other use — including copying, reproduction, republication, distribution, transmission, modification or creation of derivative works — requires our prior written consent.",
      },
      {
        kind: "p",
        text: "Third-party trademarks referenced on the Website (for example branded ingredient marks) remain the property of their respective owners and are used only to describe the composition of our Products.",
      },
    ],
  },
  {
    heading: "Third-party links and services",
    blocks: [
      {
        kind: "p",
        text: "The Website may contain links to third-party websites and relies on third-party services including Razorpay for payments, Supabase for data storage and authentication, and courier partners for delivery. We do not control those third parties and are not responsible for their content, policies or practices. Your use of a third-party service is governed by that party's own terms.",
      },
    ],
  },
  {
    heading: "Disclaimer of warranties",
    blocks: [
      {
        kind: "p",
        text: 'The Website and its content are provided on an "as is" and "as available" basis. While we take reasonable care to keep the Website accurate, secure and available, we do not warrant that it will be uninterrupted, timely, error-free, or free of viruses or other harmful components, or that any defect will be corrected.',
      },
      {
        kind: "p",
        text: "To the extent permitted by law, we exclude all warranties, conditions and representations not expressly set out in these Terms. Nothing in this section limits any warranty or right that cannot be excluded under the Consumer Protection Act, 2019 or other applicable law.",
      },
    ],
  },
  {
    heading: "Limitation of liability",
    blocks: [
      {
        kind: "p",
        text: "To the maximum extent permitted by law, our total aggregate liability arising out of or in connection with any Order — whether in contract, tort (including negligence), under statute or otherwise — is limited to the amount you actually paid for that Order.",
      },
      {
        kind: "p",
        text: "We are not liable for indirect, incidental, special, punitive or consequential loss, or for loss of profit, revenue, business, goodwill or anticipated savings, however caused.",
      },
      {
        kind: "p",
        text: "Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot lawfully be excluded or limited under Indian law.",
      },
    ],
  },
  {
    heading: "Indemnity",
    blocks: [
      {
        kind: "p",
        text: `You agree to indemnify and hold harmless ${site.legalName}, its directors, officers, employees and agents against any claim, demand, loss, liability, cost or expense (including reasonable legal fees) arising out of your breach of these Terms, your misuse of the Website, or your violation of any law or the rights of any third party.`,
      },
    ],
  },
  {
    heading: "Force majeure",
    blocks: [
      {
        kind: "p",
        text: "We are not liable for any delay or failure to perform our obligations where that delay or failure results from events outside our reasonable control, including acts of God, natural disasters, epidemics, fire, flood, war, civil unrest, strikes, government action or restriction, failure of public infrastructure, courier network disruption, or failure of telecommunications or payment networks.",
      },
    ],
  },
  {
    heading: "Grievance redressal",
    blocks: [
      {
        kind: "p",
        text: "In accordance with the Information Technology Act, 2000, the rules made under it, and the Consumer Protection (E-Commerce) Rules, 2020, complaints and grievances relating to the Website or any Order may be addressed to our Grievance Officer:",
      },
      {
        kind: "table",
        head: ["Field", "Detail"],
        rows: [
          ["Designation", "Grievance Officer"],
          ["Company", site.legalName],
          ["Email", site.email],
          ["Phone", `${site.supportPhone} (${site.supportHours})`],
          ["Address", site.addressLines.slice(1).join(", ")],
        ],
      },
      {
        kind: "p",
        text: "We acknowledge every grievance within 48 hours of receipt and endeavour to resolve it within 30 days. Please include your order number and a clear description of the issue so we can act quickly.",
      },
    ],
  },
  {
    heading: "Governing law and jurisdiction",
    blocks: [
      {
        kind: "p",
        text: `These Terms and any dispute arising out of or in connection with them, the Website or any Order are governed by the laws of India. Subject to the paragraph below, the courts at ${site.city}, ${site.state} shall have exclusive jurisdiction.`,
      },
      {
        kind: "p",
        text: `Before commencing any proceeding, please write to us at ${site.email}. Most issues are resolved in a single conversation, and we would much rather fix a problem than argue about it. Nothing in this section affects your statutory rights as a consumer, including your right to approach a consumer forum under the Consumer Protection Act, 2019.`,
      },
    ],
  },
  {
    heading: "Changes to these terms",
    blocks: [
      {
        kind: "p",
        text: "We may update these Terms from time to time to reflect changes in our business, our Products or the law. The updated version takes effect when published on this page, and the 'Last updated' date at the top will change.",
      },
      {
        kind: "p",
        text: "The version of these Terms that applies to your Order is the version published at the time you placed it. Your continued use of the Website after an update constitutes acceptance of the revised Terms.",
      },
    ],
  },
  {
    heading: "Severability and entire agreement",
    blocks: [
      {
        kind: "p",
        text: "If any provision of these Terms is found to be invalid or unenforceable, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will continue in full force.",
      },
      {
        kind: "p",
        text: "Our failure to enforce any right or provision is not a waiver of that right or provision. These Terms, together with the Privacy Policy, Cancellation & Refund Policy and Shipping & Delivery Policy, constitute the entire agreement between you and us in relation to your use of the Website.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms &"
      titleAccent="Conditions"
      updated="18 August 2026"
      effective="18 August 2026"
      intro={`These are the terms on which ${site.legalName} sells through ${site.domain}. They cover who may buy, how an order becomes a contract, how we price and take payment, what we are responsible for, and how to raise a complaint.`}
      sections={sections}
    />
  );
}
