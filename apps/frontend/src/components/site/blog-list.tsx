import type { Category, Paginated, Post } from "@/lib/types";
import { PostRow } from "./cards";
import { Reveal } from "./reveal";
import { Empty, FilterTabs, Pagination } from "./ui";

/** Category tabs, then one row per article, then pagination. Shared by the blog, category and tag pages. */
export function BlogList({
  posts,
  categories,
  activeCategory,
  hrefFor,
}: {
  posts: Paginated<Post>;
  categories: Category[];
  activeCategory?: string;
  hrefFor: (page: number) => string;
}) {
  const used = categories.filter((c) => c.postCount > 0);
  return (
    <section className="container-dc pb-16">
      {used.length > 1 && (
        <div className="mb-8">
          <FilterTabs
            label="Categories"
            items={[
              { href: "/blog", label: "All", active: !activeCategory },
              ...used.map((c) => ({
                href: `/blog/category/${c.slug}`,
                label: c.name,
                active: activeCategory === c.slug,
                count: c.postCount,
              })),
            ]}
          />
        </div>
      )}
      {posts.items.length === 0 ? (
        <Empty title="Nothing published here yet">New articles land regularly. Check back soon.</Empty>
      ) : (
        <div className="border-b border-line">
          {posts.items.map((p) => (
            <Reveal key={p.id}>
              <PostRow post={p} />
            </Reveal>
          ))}
        </div>
      )}
      <Pagination meta={posts.meta} hrefFor={hrefFor} />
    </section>
  );
}
