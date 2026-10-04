import { FolderKanban } from "lucide-react";
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
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Work · Websites, ERPs, CRMs and platforms in production",
  description:
    "Case studies from Developer Choudhary: property platforms, CRM portals, e-commerce, e-learning and business websites built with Next.js, Go and PostgreSQL.",
  path: "/work",
});

const TYPES = ["website", "web-app", "erp", "crm", "ecommerce", "api", "devops"];
const STATUSES = ["completed", "in-progress", "upcoming"];

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const type = TYPES.includes(sp.type ?? "") ? sp.type : undefined;
  const status = STATUSES.includes(sp.status ?? "") ? sp.status : undefined;
  const [projects, site] = await Promise.all([
    getProjects(page, type, status).catch(() => ({
      items: [],
      meta: { currentPage: 1, pageSize: 12, totalItems: 0, totalPages: 0 },
    })),
    getSite(),
  ]);
  const href = (patch: { type?: string; status?: string; page?: number }) => {
    const q = new URLSearchParams();
    const t = "type" in patch ? patch.type : type;
    const s = "status" in patch ? patch.status : status;
    if (t) q.set("type", t);
    if (s) q.set("status", s);
    if (patch.page && patch.page > 1) q.set("page", String(patch.page));
    const qs = q.toString();
    return qs ? `/work?${qs}` : "/work";
  };
  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
      active ? "border-fg bg-fg text-bg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
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
            Products people <span className="text-accent">actually use.</span>
          </>
        }
        lede="A selection of websites, platforms and internal tools I have shipped, plus what is on the workbench right now."
      />
      <section className="container-dc pb-8">
        <div className="mb-8 space-y-3">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href({ type: undefined })} className={chip(!type)}>
              All types
            </Link>
            {TYPES.map((t) => (
              <Link key={t} href={href({ type: t })} className={chip(type === t)}>
                {PROJECT_TYPE_LABELS[t]}
              </Link>
            ))}
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href({ status: undefined })} className={chip(!status)}>
              Any status
            </Link>
            {STATUSES.map((s) => (
              <Link key={s} href={href({ status: s })} className={chip(status === s)}>
                {PROJECT_STATUS_LABELS[s]}
              </Link>
            ))}
          </div>
        </div>
        {projects.items.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-5" />}
            title="Nothing matches those filters"
            description="Try another type or status, or browse everything."
            action={
              <Link href="/work" className="text-sm font-medium text-accent">
                Clear filters
              </Link>
            }
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
        <Pagination meta={projects.meta} hrefFor={(p) => href({ page: p })} />
      </section>
      <CtaBand
        text="Want results like these for your business? Let's scope it together."
        whatsapp={site.profile.whatsapp}
        email={site.profile.email}
      />
    </>
  );
}
