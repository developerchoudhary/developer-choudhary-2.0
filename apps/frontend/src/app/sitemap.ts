import type { MetadataRoute } from "next";
import { getSite, getSitemap } from "@/lib/data";
import { SITE_URL, siteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const site = await getSite();
  const settings = siteSettings(site);
  const page = (
    path: string,
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly",
    priority: number,
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  const fixed: MetadataRoute.Sitemap = [
    page("/", "weekly", 1),
    page("/work", "weekly", 0.9),
    page("/services", "monthly", 0.9),
    page("/about", "monthly", 0.8),
    page("/contact", "yearly", 0.8),
    ...(settings.showBlog ? [page("/blog", "daily", 0.8)] : []),
    ...(settings.showReviews ? [page("/reviews", "weekly", 0.6)] : []),
    ...(settings.showResume && site.resume ? [page("/resume", "monthly", 0.5)] : []),
    page("/privacy", "yearly", 0.2),
    page("/terms", "yearly", 0.2),
  ];
  try {
    const data = await getSitemap();
    const entry =
      (prefix: string, changeFrequency: "weekly" | "monthly", priority: number) =>
      (e: { slug: string; updatedAt?: string }) => ({
        url: `${SITE_URL}${prefix}/${e.slug}`,
        lastModified: e.updatedAt ? new Date(e.updatedAt) : now,
        changeFrequency,
        priority,
      });
    return [
      ...fixed,
      ...data.services.map(entry("/services", "monthly", 0.8)),
      ...data.projects.map(entry("/work", "monthly", 0.7)),
      ...(settings.showBlog
        ? [
            ...data.posts.map(entry("/blog", "weekly", 0.7)),
            ...data.categories.map(entry("/blog/category", "weekly", 0.5)),
            ...data.tags.map(entry("/blog/tag", "weekly", 0.4)),
          ]
        : []),
    ];
  } catch {
    return fixed;
  }
}
