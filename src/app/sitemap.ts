import type { MetadataRoute } from "next";
import { getAllTags, getProjects, getResearch, slugifyTag } from "@/lib/content";
import { siteConfig } from "@/site.config";

/** Tells search engines every page worth indexing. Admin routes are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const [projects, research, tags] = await Promise.all([
    getProjects(),
    getResearch(),
    getAllTags(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/research`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/now`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified: project.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...research.map((item) => ({
      url: `${base}/research/${item.slug}`,
      lastModified: item.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map(({ tag }) => ({
      url: `${base}/tags/${slugifyTag(tag)}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
