import type { NextConfig } from "next";

/**
 * Two optional build flags, both OFF by default — a plain `npm run build`
 * produces a standard, fully-optimised Next.js app.
 *
 *   NEXT_STANDALONE=1         emit .next/standalone: a self-contained server
 *                             with only the traced dependencies (~30 MB).
 *                             Handy for Docker, or for handing someone a
 *                             runnable copy that needs no `npm install`.
 *
 *   NEXT_IMAGE_UNOPTIMIZED=1  skip on-the-fly image optimisation, which drops
 *                             the `sharp` dependency. sharp ships binaries
 *                             compiled per-platform, so a bundle built on
 *                             Linux would otherwise fail to start on Windows.
 *                             Do NOT set this for a real deployment — you want
 *                             image optimisation in production.
 *
 * Preview bundle:
 *   NEXT_STANDALONE=1 NEXT_IMAGE_UNOPTIMIZED=1 npm run build
 */
const standalone = process.env.NEXT_STANDALONE === "1";
const unoptimizedImages = process.env.NEXT_IMAGE_UNOPTIMIZED === "1";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * Everything the site loads is enumerated here, so an injected <script src>
 * or a rogue third-party frame has nowhere to load from.
 *
 * Two entries deserve a note:
 *
 *   'unsafe-inline' in script-src  Next inlines its bootstrap and flight data
 *                                  as inline <script> tags, and the app adds
 *                                  two of its own (the `js` class marker and
 *                                  the JSON-LD blocks). A nonce would be
 *                                  stricter, but nonces have to be threaded
 *                                  through the proxy on every request; this is
 *                                  the honest trade for a static header.
 *   'unsafe-eval' in development   Turbopack's HMR runtime needs it. It is
 *                                  dropped from the production policy.
 *
 * Razorpay Checkout loads its script from checkout.razorpay.com, then opens
 * api.razorpay.com in an iframe and talks to it over XHR, so all three
 * razorpay hosts appear below. Trim this list if you ever drop the gateway.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://checkout.razorpay.com https://*.razorpay.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://*.razorpay.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://*.razorpay.com",
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  ...(standalone ? { output: "standalone" as const } : {}),

  images: {
    unoptimized: unoptimizedImages,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Uncomment once product images are served from Supabase Storage.
      // { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },

  // Trim the client bundle: only the icons actually imported get shipped.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: csp },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
