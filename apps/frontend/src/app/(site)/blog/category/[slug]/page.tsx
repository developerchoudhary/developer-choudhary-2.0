import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/site/blog-list";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/ui";
import { getCategories, getCategory, getPosts, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return pageMetadata({
    title: `${category.name} articles`,
    description: category.description || `Articles about ${category.name}.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const [site, category, categories, posts] = await Promise.all([
    getSite(),
    getCategory(slug),
    getCategories(),
    getPosts(page, { category: slug }).catch(() => null),
  ]);
  if (!siteSettings(site).showBlog || !category || !posts) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: category.name, path: `/blog/category/${slug}` },
        ])}
      />
      <PageHeader
        title={category.name}
        lede={category.description || undefined}
        back={{ href: "/blog", label: "Blog" }}
      />
      <BlogList
        posts={posts}
        categories={categories}
        activeCategory={slug}
        hrefFor={(p) => (p > 1 ? `/blog/category/${slug}?page=${p}` : `/blog/category/${slug}`)}
      />
    </>
  );
}
