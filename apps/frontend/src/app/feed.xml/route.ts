import { getPosts, getSite } from "@/lib/data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const xmlEscape = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c,
  );

export async function GET() {
  const [site, posts] = await Promise.all([getSite(), getPosts(1).catch(() => ({ items: [] }))]);
  const items = posts.items
    .map(
      (p) => `<item>
  <title>${xmlEscape(p.title)}</title>
  <link>${SITE_URL}/blog/${p.slug}</link>
  <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
  <pubDate>${new Date(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate>
  <description>${xmlEscape(p.excerpt)}</description>${p.category ? `\n  <category>${xmlEscape(p.category.name)}</category>` : ""}
</item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${xmlEscape(SITE_NAME)} · Blog</title>
  <link>${SITE_URL}/blog</link>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>${xmlEscape(site.profile.headline)}</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
}
