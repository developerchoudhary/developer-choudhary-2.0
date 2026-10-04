import { Rss } from "lucide-react";
import { BlogList } from "@/components/site/blog-list";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/section";
import { getCategories, getPosts } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog · Notes on Go, Next.js, ERPs, CRMs and self-hosting",
  description:
    "Practical articles on building business software: Go and Next.js engineering, ERP and CRM design, PostgreSQL, Kubernetes and running software on your own servers.",
  path: "/blog",
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const search = sp.search?.trim() || undefined;
  const [posts, categories] = await Promise.all([
    getPosts(page, { search }).catch(() => ({
      items: [],
      meta: { currentPage: 1, pageSize: 9, totalItems: 0, totalPages: 0 },
    })),
    getCategories(),
  ]);
  const hrefFor = (p: number) =>
    `/blog?${new URLSearchParams({ ...(search ? { search } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`.replace(
      /\?$/,
      "",
    );
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Notes from building <em className="text-accent">real software.</em>
          </>
        }
        lede="Engineering write-ups, business software design and lessons from running production systems on my own cluster."
      >
        <form action="/blog" className="flex max-w-md gap-2">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search articles"
            className="h-11 w-full rounded-full border border-line bg-bg-elevated px-4 text-sm focus:border-accent focus:outline-none"
          />
          <button type="submit" className="h-11 rounded-full bg-fg px-5 text-sm font-medium text-bg">
            Search
          </button>
          <a
            href="/feed.xml"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted hover:text-fg"
            aria-label="RSS feed"
          >
            <Rss className="size-4" />
          </a>
        </form>
      </PageHero>
      <BlogList posts={posts} categories={categories} hrefFor={hrefFor} showFeatured={!search} />
    </>
  );
}
