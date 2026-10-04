import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/site/blog-list";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/ui";
import { getPosts, getSite, getTag } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return { title: "Tag not found" };
  return pageMetadata({
    title: `Articles tagged “${tag.name}”`,
    description: `All articles tagged ${tag.name}.`,
    path: `/blog/tag/${slug}`,
  });
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const [site, tag, posts] = await Promise.all([
    getSite(),
    getTag(slug),
    getPosts(page, { tag: slug }).catch(() => null),
  ]);
  if (!siteSettings(site).showBlog || !tag || !posts) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: tag.name, path: `/blog/tag/${slug}` },
        ])}
      />
      <PageHeader
        title={`#${tag.name}`}
        lede={`${tag.postCount} article${tag.postCount === 1 ? "" : "s"}`}
        back={{ href: "/blog", label: "Blog" }}
      />
      <BlogList
        posts={posts}
        categories={[]}
        hrefFor={(p) => (p > 1 ? `/blog/tag/${slug}?page=${p}` : `/blog/tag/${slug}`)}
      />
    </>
  );
}
