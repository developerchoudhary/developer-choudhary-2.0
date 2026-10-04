import { Newspaper } from "lucide-react";
import Link from "next/link";
import type { Category, Paginated, Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "../ui/misc";
import { Pagination } from "./bits";
import { PostCard } from "./cards";
import { Reveal } from "./reveal";

interface BlogListProps {
  posts: Paginated<Post>;
  categories: Category[];
  activeCategory?: string;
  hrefFor: (page: number) => string;
  showFeatured?: boolean;
}

export function BlogList({ posts, categories, activeCategory, hrefFor, showFeatured }: BlogListProps) {
  const [first, ...rest] = posts.items;
  const featured = showFeatured && posts.meta.currentPage === 1 && first && first.coverUrl ? first : null;
  const grid = featured ? rest : posts.items;
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-sm transition",
      active ? "border-fg bg-fg text-bg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
    );
  return (
    <section className="container-dc pb-8">
      {categories.some((c) => c.postCount > 0) && (
        <div className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/blog" className={chip(!activeCategory)}>
            All
          </Link>
          {categories
            .filter((c) => c.postCount > 0)
            .map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className={cn(chip(activeCategory === c.slug), "shrink-0")}
              >
                {c.name} <span className="text-fg-subtle">{c.postCount}</span>
              </Link>
            ))}
        </div>
      )}
      {posts.items.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="size-5" />}
          title="Nothing published here yet"
          description="New articles land regularly. Check back soon or subscribe to the RSS feed."
        />
      ) : (
        <>
          {featured && (
            <Reveal className="mb-6">
              <PostCard post={featured} featured />
            </Reveal>
          )}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {grid.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        </>
      )}
      <Pagination meta={posts.meta} hrefFor={hrefFor} />
    </section>
  );
}
