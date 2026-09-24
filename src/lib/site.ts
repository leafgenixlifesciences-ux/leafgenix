/** Single place to change company details. Header, footer, policy pages,
 *  structured data and the Razorpay checkout all read from here.
 *
 *  Values marked VERIFY were read off the printed brand material and should be
 *  confirmed against current company records before launch. */

export const site = {
  name: "Leaf Genix",
  fullName: "Leaf Genix Lifesciences",
  legalName: "Leaf Genix Lifesciences",
  domain: "leafgenix.in",
  tagline: "Lifting and Empowering All Families",
  consumerLine: "giving smiles to life",
  /** VERIFY — "37 YEARS" is the anniversary mark on the 2023 visual-aid
   *  artwork; the founding year has not been confirmed from a document. Until
   *  it is, every surface renders the safe forms below rather than a number. */
  years: 37,
  yearsStat: "30+",
  yearsProse: "three decades",
  description:
    "Leaf Genix Lifesciences makes research-led nutraceuticals in India — doses set with reference to published research, full label disclosure, and manufacturing at WHO-GMP certified partner facilities.",
  positioning:
    "A highly respected pharma company with focus on science & technology",
  vision:
    "Association with HCPs led by dedication & commitment through innovative formulations for patients benefit",
  focus: "Cutting-edge solutions dedicated to Women & Child Health",
  awardLine:
    "With our service we win hearts… With our commitment we win awards",

  // --- contact ---------------------------------------------------------- //
  email: "support@leafpharmaceuticals.in",
  supportPhone: "+91 95019 01100",
  whatsapp: "919501901100",
  addressLines: [
    "Leaf Genix Lifesciences",
    "42, G-1, Nemi Nagar Extension",
    "Amarpali Marg, Vaishali Nagar",
    "Jaipur, Rajasthan 302021",
    "India",
  ],
  city: "Jaipur",
  state: "Rajasthan",
  postalCode: "302021",
  supportHours: "Mon – Sat, 10:00 – 18:00 IST",

  // --- compliance ------------------------------------------------------- //
  // All values below are transcribed from primary documents:
  //   • FSSAI Registration Certificate under FSS Act 2006, issued 29-01-2026
  //   • GST tax invoice raised on the entity
  // Do not edit these without a document in front of you.
  entityType: "Sole Proprietorship",
  proprietor: "Varun Sethi",

  /** FSSAI Registration (not a Licence) held by the FBO itself. */
  fssai: "22226076000075",
  fssaiType: "Registration",
  fssaiValidUpto: "28 January 2027",
  fssaiKindOfBusiness: "Wholesaler, Distributor",

  /** GSTIN check digit verified; embeds PAN BSWPS3920A, state code 08 (Rajasthan). */
  gstin: "08BSWPS3920A1ZI",

  /** A sole proprietorship has no CIN. Intentionally blank — every surface
   *  that renders it drops the row when empty. */
  cin: "",
  manufacturer:
    "Samson Laboratories Pvt. Ltd. (WHO-GMP Certified), 152 Sansiwala, Barotiwala, Distt. Solan (H.P.) 174103",
  manufacturerLicence: "MB/05/157",

  // --- social ----------------------------------------------------------- //
  // Fill in only real, live profile URLs. Anything left blank is hidden from
  // the footer rather than rendered as a dead link.
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
  },
} as const;

export const trustPoints = [
  "Made at WHO-GMP certified facilities",
  "FSSAI registered",
  "No proprietary blends",
  "Full composition printed on every pack",
  "Three decades in Indian healthcare",
  "Free delivery over ₹999",
] as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Nutraceuticals" },
  { href: "/prescription-range", label: "Rx Range" },
  { href: "/blog", label: "Journal" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;
