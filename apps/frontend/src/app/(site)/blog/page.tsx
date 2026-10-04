import { Rss, Search } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/site/blog-list";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/ui";
import { getCategories, getPosts, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Blog",
    description:
      "Practical notes on building business software: Go and Next.js, ERP and CRM design, PostgreSQL and self-hosting.",
    path: "/blog",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const search = sp.search?.trim() || undefined;
  const [site, posts, categories] = await Promise.all([
    getSite(),
    getPosts(page, { search }).catch(() => ({
      items: [],
      meta: { currentPage: 1, pageSize: 9, totalItems: 0, totalPages: 0 },
    })),
    getCategories(),
  ]);
  if (!siteSettings(site).showBlog) notFound();
  const hrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <PageHeader
        title="Blog"
        lede="Notes from building real software: engineering write-ups, business software design and lessons from production."
      >
        <form action="/blog" aria-label="Search articles" className="flex max-w-md items-center gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search articles</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search articles"
              className="h-11 w-full rounded-xl border border-line bg-bg-elevated pr-4 pl-10 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none"
            />
          </label>
          <a
            href="/feed.xml"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg-elevated text-fg-muted transition-colors hover:text-fg"
            aria-label="RSS feed"
            title="RSS feed"
          >
            <Rss className="size-4" />
          </a>
        </form>
        {search && (
          <p className="mt-4 text-sm text-fg-muted">
            {posts.meta.totalItems} result{posts.meta.totalItems === 1 ? "" : "s"} for “{search}” ·{" "}
            <a href="/blog" className="font-medium text-accent hover:underline">
              Clear
            </a>
          </p>
        )}
      </PageHeader>
      <BlogList posts={posts} categories={search ? [] : categories} hrefFor={hrefFor} />
    </>
  );
}
