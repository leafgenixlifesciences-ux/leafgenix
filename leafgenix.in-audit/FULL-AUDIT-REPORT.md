# Leaf Genix SEO audit

Audited: 30 September 2026 (IST)

## Executive summary

**SEO health: 85/100 (heuristic, not a ranking prediction).** The public site is technically ready for crawl and indexing. Google Search Console is still collecting index and performance data, so this score excludes unmeasured Core Web Vitals and field-performance signals.

Leaf Genix is a hybrid business: an India-wide online nutraceutical store with a Jaipur customer-support office.

## Evidence collected

| Check | Result |
| --- | --- |
| Sitemap crawl | 25 of 25 sitemap URLs returned HTTP 200 |
| Core page signals | 25 of 25 have a title, one H1, a canonical and no accidental `noindex` |
| Crawl directives | `robots.txt` is live, allows public content and names the sitemap |
| Canonical domain | HTTP and `www` both redirect to `https://leafgenix.in/` in one hop |
| Security | HTTPS, HSTS, CSP, X-Content-Type-Options, X-Frame-Options and Referrer-Policy are live |
| Rendering | Homepage primary SEO markup, canonical and JSON-LD are present in initial HTML |
| Structured data | Search Console reports 2 valid Product snippets, 2 valid Merchant listings and 2 valid Breadcrumbs; Organization, OnlineStore, WebSite and Store JSON-LD are live |
| AI-search basics | `llms.txt` is live and OAI-SearchBot, Claude-SearchBot, PerplexityBot and Applebot may crawl public pages |
| Search Console | Sitemap submitted successfully; indexing report is still processing and performance currently reports zero clicks |

## What was fixed in this audit

1. Corrected a NAP inconsistency: website hours now match the Business Profile, Monday-Saturday 09:00-19:00 IST and Sunday closed.
2. Added a Store schema entity with the official Jaipur address, phone, price range and opening-hours specification.
3. Added the same address and hours to `llms.txt` for consistent machine-readable business facts.
4. Refreshed sitemap last-modified values after the shared SEO metadata change.

## Remaining work

### Google-controlled / external

- Complete Google Business Profile verification when Google offers the verification route. Do not add ratings or reviews that are not genuine.
- Allow Search Console to finish processing. Google decides crawl and index timing; a sitemap cannot force immediate indexing.
- Build legitimate review velocity and respond professionally to reviews after the profile is public.
- Claim and keep matching NAP records on Bing Places and Apple Business Connect. These help discovery outside Google and in AI assistants that use Bing.

### Website and content

- Publish useful, source-backed articles on a regular schedule; the site now has five crawlable blog articles.
- Add clearly attributable expert review or author credentials only where true and documentable, especially for health content.
- Seek relevant earned mentions/citations from real healthcare, Jaipur-business and industry sources. Avoid paid link schemes and duplicate directory spam.
- Measure mobile Core Web Vitals after enough real-user traffic accumulates; Search Console currently has no experience data.

## Scope limits

This audit did not measure historical rankings, backlinks, local-pack position by neighbourhood, Google Business Profile insights, or CrUX field Core Web Vitals. No SEO work can guarantee a particular ranking, sitelinks, a knowledge panel, crawl time or an AI answer citation.
