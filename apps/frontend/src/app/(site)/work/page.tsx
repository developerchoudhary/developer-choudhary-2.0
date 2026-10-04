import type { Metadata } from "next";
import { ProjectCard, ProjectRow } from "@/components/site/cards";
import { Cta } from "@/components/site/cta";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { Empty, FilterTabs, PageHeader, Pagination } from "@/components/site/ui";
import { getProjectFacets, getProjects, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PROJECT_TYPE_LABELS, siteSettings } from "@/lib/site";
import type { Paginated, Project } from "@/lib/types";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Work",
    description:
      "Selected projects by Aman Choudhary: property platforms, CRM portals, e-commerce and business websites built with Next.js, Go and PostgreSQL.",
    path: "/work",
  });
}

const emptyPage: Paginated<Project> = {
  items: [],
  meta: { currentPage: 1, pageSize: 12, totalItems: 0, totalPages: 0 },
};

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const [facets, site] = await Promise.all([getProjectFacets(), getSite()]);
  const types = facets.types.filter((t) => t.count > 0);
  const type = types.some((t) => t.value === sp.type) ? sp.type : undefined;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const [completed, building] = await Promise.all([
    getProjects({ page, type, status: "completed" }).catch(() => emptyPage),
    page === 1
      ? getProjects({ type, status: "in-progress,upcoming", pageSize: 6 }).catch(() => emptyPage)
      : Promise.resolve(emptyPage),
  ]);
  const settings = siteSettings(site);
  const total = types.reduce((sum, t) => sum + t.count, 0);
  const href = (patch: { type?: string; page?: number }) => {
    const q = new URLSearchParams();
    const t = "type" in patch ? patch.type : type;
    if (t) q.set("type", t);
    if (patch.page && patch.page > 1) q.set("page", String(patch.page));
    const qs = q.toString();
    return qs ? `/work?${qs}` : "/work";
  };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />
      <PageHeader
        title="Work"
        lede="Websites, web apps and business software I have designed, built and shipped for clients in India and abroad."
      >
        {types.length > 1 && (
          <FilterTabs
            label="Project type"
            items={[
              { href: href({ type: undefined }), label: "All", active: !type, count: total },
              ...types.map((t) => ({
                href: href({ type: t.value }),
                label: PROJECT_TYPE_LABELS[t.value] ?? t.value,
                active: type === t.value,
                count: t.count,
              })),
            ]}
          />
        )}
      </PageHeader>

      <section className="container-dc pb-6">
        {completed.items.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
            {completed.items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 3) * 0.05}>
                <ProjectCard
                  project={p}
                  priority={i < 2}
                  sizes="(min-width: 1120px) 528px, (min-width: 768px) 50vw, 100vw"
                />
              </Reveal>
            ))}
          </div>
        ) : (
          building.items.length === 0 && (
            <Empty title="No projects here yet">New case studies are on the way. Check back soon.</Empty>
          )
        )}
        <Pagination meta={completed.meta} hrefFor={(p) => href({ page: p })} />
      </section>

      {building.items.length > 0 && (
        <section className="container-dc py-14 sm:py-16">
          <h2 className="display text-2xl sm:text-[1.75rem]">In progress & upcoming</h2>
          <p className="mt-2 text-fg-muted">What I am building right now, and what is next.</p>
          <div className="mt-6 card px-5 sm:px-6">
            {building.items.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <Cta
        title={settings.ctaTitle}
        text={settings.ctaText}
        whatsapp={site.profile.whatsapp}
        primary={settings.heroPrimary}
      />
    </>
  );
}
