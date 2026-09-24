# Leaf Genix Lifesciences — leafgenix.in

E-commerce storefront for Leaf Genix Lifesciences. Eight nutraceuticals sold
online, twenty-one prescription medicines published for reference, guest
checkout with optional accounts, and Razorpay payments. Every page is
server-rendered.

| | |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS v4) |
| Database & auth | Supabase (Postgres + Row Level Security, magic-link login) |
| Payments | Razorpay Checkout (UPI, cards, net banking, wallets) |
| Rendering | SSR on every route (`force-dynamic`) — live stock & pricing |
| Design | White base · brand green `#005C2D` · brand orange `#ED940D` |

---

## 1. Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Or double-click **`run.bat`** on Windows — it installs dependencies on first
run, starts the server and opens the browser.

**No-install preview.** `NEXT_STANDALONE=1 NEXT_IMAGE_UNOPTIMIZED=1 npm run build`
emits `.next/standalone` — a ~30 MB self-contained server that runs with just
`node server.js`, no `npm install` required. Copy `.next/static` into
`.next/standalone/.next/static` and `public` into `.next/standalone/public`
first. Useful for handing a runnable copy to someone who cannot reach the npm
registry.

`.env.local` already points at the live Supabase project (`leafgenix`,
`ap-south-1`) with the schema applied and all products seeded. Payment and
email-provider secrets still need to be supplied — see below.

## 2. Environment variables

| Variable | Where to get it | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://leafgenix.in` in production | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → `service_role` (Reveal) | **Yes — server only** |
| `RAZORPAY_KEY_ID` | Razorpay → Account & Settings → API Keys | No |
| `RAZORPAY_KEY_SECRET` | Generated together with the key id | **Yes** |
| `RAZORPAY_WEBHOOK_SECRET` | The secret you type when creating the webhook (§5) | **Yes** |
| `RESEND_API_KEY` | Resend → API Keys | **Yes — server only** |
| `RESEND_FROM_EMAIL` | A sender on your verified Resend domain | No |
| `LEAD_NOTIFICATION_EMAIL` | Inbox that receives new coupon lead details | No |
| `ADMIN_NOTIFICATION_EMAIL` | Inbox for contact enquiries and paid orders (falls back to lead/support email) | No |

**Two things still need filling in before orders work:**

1. `SUPABASE_SERVICE_ROLE_KEY` — without it, browsing works but placing an
   order returns a clear "not configured" message instead of crashing.
2. `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — without them checkout runs in
   "setup mode" and explains why.
3. `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — without them the contact and
   welcome-coupon forms stay unavailable, and paid-order emails remain pending.

All three Razorpay values are read **on the server at request time**, so adding
or rotating keys only needs a restart — never a rebuild. (They are deliberately
not `NEXT_PUBLIC_` variables, which Next.js inlines at build time.)

## 3. Catalogue

### Nutraceuticals — sold online (9)

| Product | Form | Key actives |
|---|---|---|
| Synvit-Forte | 10 Tablets | Spirulina + Omega-3 EPA/DHA + Vitamin D3 + 21 multivitamins |
| Probion | 10 Sachets | Bovine colostrum 400 mg + 6-strain probiotic, 5 Billion CFU |
| Edo Well | Syrup 200 ml | EPA 400 mg + DHA 300 mg + D3 400 IU per 10 ml |
| L-Sharp 400 | Syrup 200 ml | L-Carnosine 400 mg per 5 ml |
| Firtilo-f | 10 Tablets | Myo-inositol 1100 mg + D-chiro-inositol 27.8 mg (40:1) + chromium + fenugreek + D3 |
| MD3 Nano Shot | 5 ml solution | Cholecalciferol 60000 IU, nano technology, sugar free |
| Perfect Liv | Syrup 200 ml | Ayurvedic hepatoprotective |
| Haemerange | Syrup 200 ml | Elemental iron 32.8 mg + B12 + folic acid per 15 ml |
| Calcin-K27 | 10 Softgels | Calcium 500 mg + calcitriol + Vitamin K27 + Mg + Zn |

### Prescription range — reference only (21)

Published at `/prescription-range`, grouped by therapy area, with no cart. They
live in a separate `rx_products` table that has no price column at all, so they
cannot accidentally become purchasable.

> ⚠️ **Prices are placeholders.** MRPs and selling prices were not in the source
> brand material. Set the real ones in Supabase → Table Editor → `products`
> (`price_paise` and `mrp_paise`, both in **paise** — ₹749 is `74900`).

## 4. Payment flow

```
Browser                    Server                          Razorpay
   │  POST /api/razorpay/create-order
   │ ───────────────────────►│  re-prices cart from DB,
   │                         │  inserts order (status: created),
   │                         │  creates Razorpay order  ─────────►│
   │ ◄─────────────────────  │  returns key id + order ids        │
   │  Razorpay Checkout modal opens (UPI / card / netbanking)     │
   │  POST /api/razorpay/verify  (signature check, fast path)     │
   │                         │  marks paid, decrements stock      │
   │                         │  emails confirmation to customer  │
   │                         │  and paid-order details to admin  │
   │                         │ ◄──── POST /api/razorpay/webhook ──│
   │                         │  authoritative confirmation        │
   ▼  redirected to /order/<id>
```

Security properties worth knowing:

- The browser never sends prices. `cartItemSchema` accepts only `slug` and
  `quantity`, and Zod strips everything else — so a forged price cannot even
  enter the system. The server re-reads price and stock from Postgres on every
  order.
- Payment signatures are verified with constant-time HMAC comparison; the
  webhook signature is verified against the **raw** request body.
- The verify route and the webhook race on every order, by design - Razorpay
  fires `payment.captured` at roughly the moment the browser calls `/verify`.
  Both are written for it: each moves the order to `paid` with a single
  conditional `UPDATE ... WHERE status IN ('created','pending','failed')`, so
  only one can win, and stock is moved through `decrement_stock_for_order`,
  which claims `orders.stock_decremented_at` before touching anything. A
  duplicate delivery, a webhook retry, or both routes firing at once all
  decrement exactly once. See `supabase/migrations/` - do not replace that
  claim inside the function with a plain UPDATE.
- A refund puts the stock back (`restock_for_order`), and is idempotent the
  same way.
- The public write routes (`create-order`, `contact`, `cart`) are rate limited
  per IP. See `src/lib/rate-limit.ts` for the scope of that guarantee - it
  counts per server instance, so a multi-region deployment wants a shared
  store or edge rules in front of it.
- Anything that reaches a `Location:` header goes through
  `safeInternalPath()`. A `startsWith("/")` check is not enough: `//evil.com`
  and `/\evil.com` both pass it and both resolve off-site.
- The `service_role` key never leaves the server (`src/lib/supabase/admin.ts`
  is marked `server-only`).
- An order that belongs to an account is only readable by that account.
  Guest orders have no `user_id`, so the v4 UUID in the URL is what keeps them
  unguessable - but once a customer signs in, the link alone is not enough.
- Every route degrades to a clean JSON error if a key is missing, rather than
  throwing an unhandled 500.

## 5. Razorpay webhook (before going live)

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**

- URL: `https://leafgenix.in/api/razorpay/webhook`
- Secret: anything strong — the same value goes in `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`

Test the whole flow with test-mode keys (`rzp_test_…`) and Razorpay's
[test cards / test UPI](https://razorpay.com/docs/payments/payments/test-card-details/)
before switching to live keys.

## 6. Product content & images

Everything a product page shows lives in the `products` table — description,
uses, specifications, differentiators, nutrition table, evidence citations,
FAQs. Edit rows in the Supabase Table Editor; the site reflects changes on the
next request (SSR, no rebuild).

`data/products.json` is the seed copy of that content, kept in git so the
catalogue is versioned and can be re-seeded.

### Carousel images

Each product has **six** images at `public/products/<slug>-1.jpg` … `-6.jpg`,
listed in the `gallery` column:

1. pack front · 2. pack angled · 3. composition · 4. key actives ·
5. benefits · 6. directions

These are generated stand-ins so the store looks finished. Regenerate with:

```bash
node scripts/generate-product-images.mjs          # skips existing files
FORCE_REGEN=1 node scripts/generate-product-images.mjs   # redo everything
```

**To use real photography:** drop your files into `public/products/` with the
same filenames (portrait 4:5, 1200 × 1500 or larger). Nothing else changes —
the `gallery` column already points at them. To host on Supabase Storage
instead, upload, put the public URLs in `gallery`, and uncomment the
`remotePatterns` block in `next.config.ts`.

The database schema, RLS policies and functions are tracked in
`supabase/migrations/`. Read `supabase/README.md` before changing any of
them - a couple of the rules there are easy to undo by accident.

## 6a. Journal (blog)

Four educational articles live in `src/lib/blog.ts` as typed content (no CMS):
label literacy, vitamin D, omega-3 for children, probiotics. `/blog` lists them,
`/blog/[slug]` renders one with key takeaways, a contents list, sources and a
"from the range" card (via the post's `related` product slug). Add a post by
appending to the `posts` array — it is picked up by the index, the sitemap and
the matching product page automatically. Keep the same rules as product copy:
nutrient-function language only, no disease claims, every number sourced.

The Rx range is deliberately text-only (no pack photographs) — Schedule H
medicines are listed for clinicians, not advertised.

## 7. Project map

```
src/
├── app/
│   ├── page.tsx                      Home
│   ├── products/page.tsx             Catalogue
│   ├── products/[slug]/page.tsx      Detail — carousel, uses, specs,
│   │                                 differentiators, nutrition, evidence, FAQ
│   ├── prescription-range/page.tsx   Rx range, grouped by therapy area
│   ├── cart, checkout, order/[id]    Purchase flow
│   ├── account, login, auth/*        Optional accounts (magic link)
│   ├── about, contact                Content
│   ├── terms, privacy-policy,
│   │   shipping-policy, refund-policy  Razorpay-required policies
│   └── api/
│       ├── razorpay/create-order     Cart → priced order → Razorpay order
│       ├── razorpay/verify           Browser-side signature verification
│       ├── razorpay/webhook          Authoritative payment events
│       ├── contact                   Contact form
│       └── coupon                    Lead capture + coupon email
├── components/
│   ├── product-carousel.tsx          Scroll-snap carousel: swipe, arrows,
│   │                                 thumbnails, keyboard, ARIA live region
│   ├── brand.tsx                     Logo lockups from the real artwork
│   └── …                             Header, footer, cart, forms
├── lib/
│   ├── site.ts        ← company details: phone, GSTIN, CIN live here
│   ├── shipping.ts    ← free-shipping threshold & flat rate
│   ├── queries.ts     Server-side data access (RLS-scoped)
│   ├── cart-store.ts  Cart as an external store (useSyncExternalStore)
│   ├── razorpay.ts    Client + signature verification
│   └── supabase/      server / client / admin / session helpers
├── data/products.json Seed copy of the catalogue content
└── proxy.ts           Session refresh on every request
```

`src/lib/site.ts` and `src/lib/shipping.ts` are deliberately the single sources
of truth for company details and delivery rules.

## 8. Deploying

The site is live on Netlify: **https://leafgenix.netlify.app**
(project `leafgenix`, dashboard https://app.netlify.com/projects/leafgenix).
`netlify.toml` pins Node 22 and the Next.js adapter; nothing else is needed.

Environment variables live in Netlify → Site configuration → Environment
variables. The three `NEXT_PUBLIC_*` values are set. The four secrets are
**not** — add them yourself (never paste them into a chat):

| Key | Where to find it |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay → Account & Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | the secret you type when creating the webhook (§5) |
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_FROM_EMAIL` | verified sender, e.g. `LeafGenix Website <offers@leafgenix.in>` |
| `LEAD_NOTIFICATION_EMAIL` | business inbox for coupon leads |
| `ADMIN_NOTIFICATION_EMAIL` | business inbox for contact and paid-order notifications |

Until they are added the catalogue, cart and accounts work, but checkout
shows "payments not configured", the contact form cannot accept messages, and
the coupon form cannot issue a code until its email settings are present.
After adding them, trigger a redeploy (Deploys → Trigger deploy).

To ship a new version, run from the project folder:

```
npx -y @netlify/mcp@latest --site-id 79fa50c6-662d-47ba-8ed8-895af96efc7c --proxy-path "<path from the Netlify MCP deploy-site tool>"
```

or link the folder once with `npx netlify-cli link` and then `npx netlify-cli deploy --build --prod`.

Going live on the real domain:

1. Netlify → Domain management → add `leafgenix.in` and follow the DNS steps.
2. Change `NEXT_PUBLIC_SITE_URL` to `https://leafgenix.in` and redeploy.
3. Supabase → Authentication → URL Configuration: Site URL
   `https://leafgenix.in`, and add `https://leafgenix.in/auth/callback`
   (plus the `leafgenix.netlify.app` equivalents while testing) to Redirect URLs.
4. Create the Razorpay webhook (§5) against the live URL.

## 9. Before going live — checklist

### Verified from primary documents — no action needed
- Legal name, constitution (sole proprietorship) and proprietor
- Registered office, support email, support phone
- FSSAI Registration `22226076000075`, valid to 28 Jan 2027
- GSTIN `08BSWPS3920A1ZI` (check digit validated; embeds PAN, state code 08)
- Manufacturing partner and licence

### Still open
- [ ] **FSSAI scope.** The registration held is a *Registration* (not a Licence), Kind
      of Business **"Wholesaler, Distributor"**, capped at ₹12 lakh annual turnover.
      Direct-to-consumer e-commerce generally needs a licence whose scope covers
      retail / e-commerce, and above that turnover a State or Central Licence.
      Confirm with your FSSAI consultant before taking live orders.
- [ ] **Renew FSSAI before 28 January 2027** — renewal can be filed from 180 days prior.
- [ ] Set real prices in Supabase (`price_paise`, `mrp_paise`) — currently placeholders
- [ ] Add real social profile URLs in `src/lib/site.ts` (blank = hidden, not a dead link)
- [ ] Confirm the operational commitments in the Shipping policy match how you
      actually run: 2 PM dispatch cut-off, Mon–Sat working days, 2–7 day delivery
      windows, 3 delivery attempts, free-shipping threshold and flat rate
      (`src/lib/shipping.ts`)
- [ ] Name a Grievance Officer. The policies currently give the designation plus the
      real support email and phone; IT Rules also expect a named individual.
- [ ] Replace the six generated images per product with real pack shots
- [ ] Have a regulatory consultant review product claims against FSSAI nutraceutical labelling rules.
      Sept 2026 pass already removed "First time in India", "suitable for all ages", "prevents
      heart disease / premature ageing", "complete brain development across all age groups",
      "universal neuroprotective", "best way", "drug of choice" and the hard "37 years" figure
      (now "three decades" / "30+" until the founding year is documented — see `site.ts`).
      Still to review: disease-named copy on L-Sharp 400, Perfect Liv and MD3 Nano Shot
      (autism/ADHD/epilepsy adjuvant, "reverses hepatic cell damage", "prevents rickets /
      osteoporosis") and the WHO/NASA/UN spirulina attributions on Synvit-Forte.
- [ ] Have the four policy pages reviewed by your lawyer — they are thorough drafts written against Indian e-commerce law, but they are not legal advice
- [ ] Complete Razorpay KYC and switch from `rzp_test_` to `rzp_live_` keys
- [ ] Cross-check every composition against the current physical label

`BRAND-REFERENCE.md` / `.html` in this folder hold the full brand extraction —
logo colour codes, master palette and the complete product data as read from the
visual ad mix.
