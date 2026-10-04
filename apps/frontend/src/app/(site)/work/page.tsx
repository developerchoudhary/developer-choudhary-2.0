import Link from "next/link";
import { Pagination } from "@/components/site/bits";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { PageHero } from "@/components/site/section";
import { EmptyState } from "@/components/ui/misc";
import { getProjects, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PROJECT_TYPE_LABELS } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Work · Websites, ERPs, CRMs and web apps in production",
  description:
    "Case studies of websites, ERP systems, CRM portals and web applications built by Aman Choudhary with Next.js, Go, PostgreSQL and Kubernetes.",
  path: "/work",
});

const filters = ["all", "website", "erp", "crm", "web-app", "ecommerce", "api", "devops"];

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const type = sp.type && sp.type !== "all" ? sp.type : undefined;
  const [site, projects] = await Promise.all([
    getSite(),
    getProjects(page, type).catch(() => ({
      items: [],
      meta: { currentPage: 1, pageSize: 12, totalItems: 0, totalPages: 0 },
    })),
  ]);
  const hrefFor = (p: number) =>
    `/work?${new URLSearchParams({ ...(type ? { type } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`.replace(
      /\?$/,
      "",
    );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />
      <PageHero
        eyebrow="Work"
        title={
          <>
            Products I have shipped, <em className="text-accent">and what they do.</em>
          </>
        }
        lede="A selection of client and personal projects. Each one links to the live product where it is public."
      >
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (type ?? "all") === f;
            return (
              <Link
                key={f}
                href={f === "all" ? "/work" : `/work?type=${f}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  active ? "border-fg bg-fg text-bg" : "border-line text-fg-muted hover:text-fg",
                )}
              >
                {f === "all" ? "All" : PROJECT_TYPE_LABELS[f]}
              </Link>
            );
          })}
        </div>
      </PageHero>
      <section className="container-dc pb-8">
        {projects.items.length === 0 ? (
          <EmptyState
            title="No projects in this category yet"
            description="Try another filter or browse everything."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        )}
        <Pagination meta={projects.meta} hrefFor={hrefFor} />
      </section>
      <CtaBand text="Want results like these for your business?" whatsapp={site.profile.whatsapp} />
    </>
  );
}
