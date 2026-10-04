import { getPost, getSite } from "@/lib/data";
import { clip, OG_SIZE, shareCard } from "@/lib/og";
import { siteSettings } from "@/lib/site";

export const alt = "Article";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPost(slug).catch(() => null), getSite()]);
  return shareCard({
    theme: site.theme,
    siteName: siteSettings(site).name,
    kicker: post?.category?.name ? `Blog · ${post.category.name}` : "Blog",
    title: post?.title ?? "Article",
    subtitle: clip(post?.excerpt ?? "", 140),
    footer: post ? `${site.profile.fullName} · ${post.readingTimeMinutes} min read` : site.profile.fullName,
  });
}
