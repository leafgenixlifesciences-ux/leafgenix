import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/api/", "/checkout", "/cart", "/order/", "/account", "/auth/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: privatePaths },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: privatePaths },
      { userAgent: "PerplexityBot", allow: "/", disallow: privatePaths },
      { userAgent: "Applebot", allow: "/", disallow: privatePaths },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
