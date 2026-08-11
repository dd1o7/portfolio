import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is already password-protected; this keeps it out of
      // search results as well.
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
