import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/site/blog-list";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/section";
import { getCategories, getCategory, getPosts } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return pageMetadata({
    title: `${category.name} articles`,
    description: category.description || `Articles about ${category.name.toLowerCase()}.`,
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
  const [category, categories, posts] = await Promise.all([
    getCategory(slug),
    getCategories(),
    getPosts(page, { category: slug }).catch(() => null),
  ]);
  if (!category || !posts) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: category.name, path: `/blog/category/${slug}` },
        ])}
      />
      <PageHero eyebrow="Category" title={category.name} lede={category.description || undefined} />
      <BlogList
        posts={posts}
        categories={categories}
        activeCategory={slug}
        hrefFor={(p) => (p > 1 ? `/blog/category/${slug}?page=${p}` : `/blog/category/${slug}`)}
      />
    </>
  );
}
