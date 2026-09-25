import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { CouponPopup } from "@/components/coupon-popup";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LaunchGate } from "@/components/launch-gate";
import { launchHasPassed } from "@/lib/launch";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/utils";

// Display face: characterful, heavy weights, optical-size axis - carries every
// headline and every big number. Body: Manrope, for long reading at small sizes.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  // Variable font: leave `weight` off so the full 200-800 range and the
  // optical-size / width axes all load together.
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.fullName} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.fullName,
  authors: [{ name: site.fullName, url: siteUrl("/about") }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "Health and wellness",
  formatDetection: { email: false, address: false, telephone: false },
  keywords: [
    "Leaf Genix Lifesciences",
    "nutraceuticals India",
    "Synvit-Forte spirulina tablet",
    "Probion bovine colostrum probiotic",
    "Edo Well omega 3 syrup",
    "L-Sharp 400 L-carnosine",
    "MD3 Nano Shot vitamin D3",
    "Perfect Liv ayurvedic liver syrup",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl(),
    siteName: site.fullName,
    title: `${site.fullName} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#005c2d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initiallyLaunched = launchHasPassed();
  const containerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim();
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();
  const hasTagManager = Boolean(containerId && /^GTM-[A-Z0-9]+$/i.test(containerId));
  const hasAnalytics = Boolean(measurementId && /^G-[A-Z0-9]+$/i.test(measurementId));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "OnlineStore"],
        "@id": siteUrl("/#organization"),
        name: site.legalName,
        alternateName: site.name,
        url: siteUrl(),
        logo: {
          "@type": "ImageObject",
          url: siteUrl("/leafgenix-logo.png"),
        },
        email: site.email,
        telephone: site.supportPhone,
        slogan: site.tagline,
        description: site.description,
        areaServed: { "@type": "Country", name: "India" },
        address: {
          "@type": "PostalAddress",
          streetAddress: `${site.addressLines[1]}, ${site.addressLines[2]}`,
          addressLocality: site.city,
          addressRegion: site.state,
          postalCode: site.postalCode,
          addressCountry: "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.supportPhone,
          email: site.email,
          contactType: "customer support",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
        sameAs: Object.values(site.social).filter(Boolean),
        knowsAbout: [
          "Nutraceuticals",
          "Nutrition labels",
          "Vitamin and mineral supplements",
          "Probiotics",
          "Omega-3 nutrition",
          "Women and child health",
        ],
      },
      {
        "@type": "WebSite",
        "@id": siteUrl("/#website"),
        url: siteUrl(),
        name: site.fullName,
        description: site.description,
        inLanguage: "en-IN",
        publisher: { "@id": siteUrl("/#organization") },
      },
    ],
  };

  return (
    <html
      lang="en-IN"
      className={`${bricolage.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <head>
        {hasTagManager ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`,
            }}
          />
        ) : hasAnalytics ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              strategy="beforeInteractive"
            />
            <Script id="google-analytics" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${measurementId}');`}
            </Script>
          </>
        ) : null}
        {/* Marks scripting as available before first paint. Scroll-reveal
            styles only engage when this class is present, so content is
            never hidden for users without JavaScript. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <LaunchGate initiallyLaunched={initiallyLaunched} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99] focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>

        <CartProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <CouponPopup />
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
