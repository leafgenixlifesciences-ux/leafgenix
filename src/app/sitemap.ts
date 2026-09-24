import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/queries";
import { posts } from "@/lib/blog";
import { siteUrl } from "@/lib/utils";

// The catalogue behind this changes rarely, and a crawler hitting it should
// not cost a live database query every time.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const siteUpdated = new Date("2026-09-24T00:00:00+05:30");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: siteUpdated, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/products"), lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/about"), lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/prescription-range"), lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/blog"), lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.6 },
    { url: siteUrl("/gallery"), lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/shipping-policy"), lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/refund-policy"), lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/privacy-policy"), lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/terms"), lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: siteUrl(`/products/${p.slug}`),
      lastModified: siteUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: siteUrl(`/blog/${p.slug}`),
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
