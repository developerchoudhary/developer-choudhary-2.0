import type { MetadataRoute } from "next";
import { getSitemap } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/experience`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  try {
    const data = await getSitemap();
    const entry =
      (prefix: string, freq: "weekly" | "monthly", priority: number) =>
      (e: { slug: string; updatedAt?: string }) => ({
        url: `${SITE_URL}${prefix}/${e.slug}`,
        lastModified: e.updatedAt ? new Date(e.updatedAt) : now,
        changeFrequency: freq,
        priority,
      });
    return [
      ...fixed,
      ...data.services.map(entry("/services", "monthly", 0.8)),
      ...data.projects.map(entry("/work", "monthly", 0.7)),
      ...data.posts.map(entry("/blog", "weekly", 0.7)),
      ...data.categories.map(entry("/blog/category", "weekly", 0.5)),
      ...data.tags.map(entry("/blog/tag", "weekly", 0.4)),
    ];
  } catch {
    return fixed;
  }
}
