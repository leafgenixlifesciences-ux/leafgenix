import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

// Nothing on this page is per-visitor. The catalogue reads behind it are
// cached in queries.ts, so this no longer needs to be force-dynamic.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What personal data ${site.legalName} collects through ${site.domain}, why we collect it, who we share it with, how long we keep it, and the rights you have over it.`,
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    heading: "Our approach",
    blocks: [
      {
        kind: "p",
        text: `${site.legalName} ("we", "us", "our") operates the website ${site.domain}. This Privacy Policy explains what personal data we collect when you use the Website, why we collect it, who we share it with, how long we keep it, and what you can ask us to do with it.`,
      },
      {
        kind: "p",
        text: "The principle we work to is simple: we collect the minimum we need to take your order and get it to you, and we do not sell it to anyone.",
      },
      {
        kind: "callout",
        title: "Legal basis",
        text: "This policy is published in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023. We act as the Data Fiduciary in respect of the personal data described here.",
      },
    ],
  },
  {
    heading: "What we collect",
    blocks: [
      {
        kind: "table",
        head: ["Category", "What it includes", "When we collect it"],
        rows: [
          [
            "Contact and delivery details",
            "Full name, email address, mobile number, delivery address including PIN code",
            "When you check out",
          ],
          [
            "Order details",
            "Products ordered, quantities, amount paid, order number, order status, delivery notes",
            "When you place an order",
          ],
          [
            "Payment reference",
            "Razorpay order id, payment id and payment method type, plus success or failure status",
            "When you pay",
          ],
          [
            "Account details",
            "Email address and the sign-in links issued to it; your name and phone if you save them",
            "Only if you choose to create an account",
          ],
          [
            "Enquiries",
            "Name, email, phone, subject and the message you send us",
            "When you use the contact form",
          ],
          [
            "Coupon sign-ups",
            "Name, email address, mobile number and marketing consent",
            "When you request a welcome coupon",
          ],
          [
            "Technical data",
            "IP address, browser type and version, device type, pages requested, timestamps",
            "Automatically, on every request",
          ],
          [
            "Website measurement data",
            "Pages viewed, approximate device and browser information, referral source and aggregated interaction events",
            "Only when Google Analytics or Google Tag Manager is enabled on the Website",
          ],
          [
            "Cart contents",
            "The products and quantities in your bag, stored in your own browser",
            "As you shop",
          ],
        ],
      },
    ],
  },
  {
    heading: "What we never collect",
    blocks: [
      {
        kind: "callout",
        title: "We never see your payment credentials",
        text: "We do not receive, process or store your card number, CVV, card expiry, UPI PIN, or net-banking username and password. Payments are handled end to end by Razorpay Software Private Limited on their own PCI-DSS compliant infrastructure. All we receive back is a transaction reference and a success or failure result.",
      },
      {
        kind: "bullets",
        items: [
          "We do not ask for health records, prescriptions, diagnoses or medical history, and you should not send them to us. If you describe a health concern in a message, we use it only to answer that message and do not add it to any profile.",
          "We do not collect government identity numbers such as Aadhaar or PAN from customers.",
          "We do not collect biometric data.",
          "We do not knowingly collect data from children — see the section on children below.",
          "We do not buy personal data from data brokers or third-party lists.",
        ],
      },
    ],
  },
  {
    heading: "Why we use your data",
    blocks: [
      {
        kind: "table",
        head: ["Purpose", "Data used", "Basis"],
        rows: [
          [
            "Process, pack and deliver your order",
            "Contact, delivery and order details",
            "Performance of our contract with you",
          ],
          [
            "Take and verify payment",
            "Order total, payment reference",
            "Performance of our contract with you",
          ],
          [
            "Send transactional messages — confirmation, dispatch, delivery, refund",
            "Email, phone, order details",
            "Performance of our contract with you",
          ],
          [
            "Answer your questions and handle complaints",
            "Contact details and message content",
            "Performance of our contract; legitimate interest",
          ],
          [
            "Detect and prevent fraudulent orders and payment abuse",
            "Technical data, order patterns",
            "Legitimate interest; legal obligation",
          ],
          [
            "Meet tax, accounting and regulatory obligations",
            "Order and invoice records",
            "Legal obligation",
          ],
          [
            "Keep the Website secure and working",
            "Technical data, error logs",
            "Legitimate interest",
          ],
          [
            "Understand Website use and improve content and shopping journeys",
            "Website measurement data",
            "Consent, where required; otherwise our legitimate interest in improving the Website",
          ],
        ],
      },
      {
        kind: "callout",
        title: "Marketing",
        text: "We send promotional email or contact you by phone only when you have specifically opted in, including through the welcome-coupon form. You may opt out at any time. Transactional messages about an order you have placed are not marketing and are sent regardless of marketing preferences.",
      },
    ],
  },
  {
    heading: "Who we share it with",
    blocks: [
      {
        kind: "p",
        text: "We do not sell, rent or trade your personal data. We share it only with the service providers who make your order possible, and only to the extent each one needs:",
      },
      {
        kind: "table",
        head: ["Recipient", "What they receive", "Why"],
        rows: [
          [
            "Razorpay Software Private Limited",
            "Name, email, phone, order amount and reference",
            "To process your payment and handle refunds",
          ],
          [
            "Courier and logistics partners",
            "Name, delivery address, phone number, order number",
            "To deliver your parcel",
          ],
          [
            "Supabase",
            "Order records and account data, stored in the AWS Mumbai (ap-south-1) region",
            "Database and authentication infrastructure",
          ],
          [
            "Resend",
            "Name, email address, mobile number and coupon details",
            "To notify us of coupon requests and deliver the coupon email",
          ],
          [
            "Our hosting provider",
            "Technical request data",
            "To serve the Website",
          ],
          [
            "Google",
            "Website measurement data when Google Analytics or Google Tag Manager is enabled; no order, payment or health information",
            "To measure Website performance and usage through Google Analytics",
          ],
          [
            "Professional advisers",
            "Only what is necessary, case by case",
            "Accounting, audit and legal advice",
          ],
          [
            "Government authorities",
            "Only what is legally required",
            "Where disclosure is required by law or court order",
          ],
        ],
      },
      {
        kind: "p",
        text: "Each provider is bound by its own contractual and legal obligations to protect the data we pass to it, and may use it only to perform the service for us.",
      },
    ],
  },
  {
    heading: "Where your data is stored",
    blocks: [
      {
        kind: "p",
        text: "Our database and order records are hosted in India, in the AWS Asia Pacific (Mumbai) region. Some of our service providers may process limited data on infrastructure outside India — for example content delivery or error monitoring. Where that happens, we take reasonable steps to ensure a comparable standard of protection applies.",
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      {
        kind: "table",
        head: ["Record", "Retention period", "Reason"],
        rows: [
          [
            "Order and invoice records",
            "8 years from the end of the relevant financial year",
            "Exceeds the statutory minimums — 6 years under the Income-tax Act, 1961 and 72 months under the CGST Act, 2017",
          ],
          [
            "Account records",
            "Until you ask us to close the account",
            "To provide the account",
          ],
          [
            "Contact form messages",
            "2 years",
            "To handle follow-up queries and complaints",
          ],
          [
            "Coupon sign-ups",
            "Until consent is withdrawn or the record is no longer needed",
            "To deliver the coupon and honour marketing preferences",
          ],
          [
            "Server and security logs",
            "Up to 180 days",
            "Security monitoring and fraud prevention",
          ],
          [
            "Cart contents",
            "Until you clear your browser storage",
            "Stored on your device, not on our servers",
          ],
        ],
      },
      {
        kind: "p",
        text: "When a retention period ends we delete the data or irreversibly anonymise it so that it can no longer be linked to you.",
      },
    ],
  },
  {
    heading: "Cookies and local storage",
    blocks: [
      {
        kind: "p",
        text: "We use a deliberately small number of strictly necessary technologies. When enabled, Google Analytics or Google Tag Manager may place analytics cookies for aggregate Website measurement. We do not use them to send order, payment or health information, and we do not use advertising cookies or behavioural profiling unless this policy is updated before those tools are enabled.",
      },
      {
        kind: "table",
        head: ["What", "Type", "Purpose"],
        rows: [
          [
            "Supabase auth cookie",
            "Strictly necessary cookie",
            "Keeps you signed in if you create an account. Set only after you sign in.",
          ],
          [
            "leafgenix.cart.v1",
            "Browser local storage",
            "Remembers what is in your shopping bag between visits. Never sent to our servers.",
          ],
          [
            "Google Analytics cookies",
            "Analytics cookie, only when Google Analytics or Google Tag Manager is enabled",
            "Measures aggregate visits and Website use. Google provides controls for managing these cookies in its privacy tools and browser settings.",
          ],
        ],
      },
      {
        kind: "p",
        text: "You can clear both at any time through your browser settings. Clearing them signs you out and empties your bag, but does not affect any order you have already placed.",
      },
    ],
  },
  {
    heading: "Your rights",
    blocks: [
      {
        kind: "p",
        text: `Under the Digital Personal Data Protection Act, 2023 you have the following rights in relation to your personal data. To exercise any of them, write to ${site.email} from the email address associated with your order or account.`,
      },
      {
        kind: "numbered",
        items: [
          "Right to access — ask for a summary of the personal data we hold about you and how we have processed it.",
          "Right to correction — ask us to correct data that is inaccurate or misleading, and to complete data that is incomplete.",
          "Right to erasure — ask us to delete your personal data where we no longer need it for the purpose it was collected.",
          "Right to withdraw consent — where processing is based on your consent, withdraw it at any time. Withdrawal does not affect processing already carried out.",
          "Right to grievance redressal — complain to our Grievance Officer about how we have handled your data.",
          "Right to nominate — nominate another person to exercise these rights on your behalf in the event of your death or incapacity.",
        ],
      },
      {
        kind: "p",
        text: "We respond to requests within 30 days. We may need to verify your identity before acting, to make sure we are not disclosing your data to someone else.",
      },
      {
        kind: "callout",
        title: "One limit on erasure",
        text: "We cannot delete records we are legally required to keep — most commonly tax invoices, which must be retained for eight years. Where that applies we will tell you clearly, delete everything we are permitted to delete, and restrict the rest so it is used only for that legal purpose.",
      },
    ],
  },
  {
    heading: "How we protect your data",
    blocks: [
      {
        kind: "bullets",
        items: [
          "The entire Website is served over HTTPS with TLS encryption.",
          "Database access is restricted by row-level security policies, so one customer's records cannot be read by another.",
          "Administrative credentials are held only on the server and are never exposed to the browser.",
          "Payment credentials never touch our systems at all — Razorpay handles them on its own PCI-DSS compliant infrastructure.",
          "Payment confirmations are verified using cryptographic signatures before an order is marked paid.",
          "Access to production data is limited to the people who need it to run the business.",
        ],
      },
      {
        kind: "p",
        text: "No system can be guaranteed perfectly secure. We take reasonable technical and organisational measures appropriate to the sensitivity of the data we hold, and in the event of a personal data breach that is likely to affect you, we will notify you and the Data Protection Board of India as required by law.",
      },
    ],
  },
  {
    heading: "Children",
    blocks: [
      {
        kind: "p",
        text: "This Website and the purchase of our Products are intended for adults aged 18 and over. We do not knowingly collect personal data from children. Some of our Products are formulated for use by children under adult supervision, but the purchase itself must be made by a parent or guardian.",
      },
      {
        kind: "p",
        text: `If you believe a child has provided us with personal data, please contact ${site.email} and we will delete it.`,
      },
    ],
  },
  {
    heading: "Grievance Officer",
    blocks: [
      {
        kind: "p",
        text: "If you have a concern about how your personal data has been handled, contact our Grievance Officer:",
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
        text: "We acknowledge every complaint within 48 hours and aim to resolve it within 30 days. If you remain dissatisfied, you may escalate to the Data Protection Board of India.",
      },
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      {
        kind: "p",
        text: "We may update this Privacy Policy as our business, our systems or the law change. The updated version takes effect when published on this page and the 'Last updated' date will change.",
      },
      {
        kind: "p",
        text: "Where a change materially affects how we use data you have already given us, we will notify you by email before it takes effect.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy"
      titleAccent="Policy"
      updated="25 September 2026"
      effective="25 September 2026"
      intro={`${site.legalName} collects the minimum personal data it needs to take your order and get it to you. This page sets out exactly what that is, who it goes to, how long we keep it, and what you can ask us to do with it.`}
      sections={sections}
    />
  );
}
