import { ArrowUpRight, Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/site/block-renderer";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { getProject, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata, projectJsonLd } from "@/lib/seo";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/site";
import { formatMonth } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return pageMetadata({
    title:
      project.seoTitle ||
      `${project.title} · ${project.subtitle || PROJECT_TYPE_LABELS[project.projectType]}`,
    description: project.seoDescription || project.summary,
    path: `/work/${project.slug}`,
    image: project.coverUrl || `/work/${project.slug}/opengraph-image`,
  });
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProject(slug), getSite()]);
  if (!project) notFound();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ];
  const period = [formatMonth(project.startedAt), formatMonth(project.completedAt)]
    .filter(Boolean)
    .join(" — ");

  return (
    <>
      <JsonLd data={[projectJsonLd(project, site.profile), breadcrumbJsonLd(crumbs)]} />
      <article>
        <header className="container-dc pt-10 sm:pt-16">
          <Breadcrumbs items={crumbs} />
          <Reveal>
            <div className="mt-8 mb-4 flex flex-wrap items-center gap-3">
              <p className="eyebrow">
                {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
                {project.clientIndustry ? ` · ${project.clientIndustry}` : ""}
              </p>
              {project.status !== "completed" && (
                <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-accent-fg">
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
              )}
            </div>
            <h1 className="display max-w-4xl text-balance text-4xl sm:text-6xl lg:text-7xl">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="mt-5 max-w-2xl text-pretty text-xl text-fg-muted">{project.subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg shadow-glow transition hover:bg-accent-strong"
                >
                  Visit live site <ArrowUpRight className="size-4" />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong px-5 text-sm font-medium transition hover:bg-bg-muted"
                >
                  <Github className="size-4" /> Source code
                </a>
              )}
            </div>
          </Reveal>
        </header>

        {project.coverUrl && (
          <Reveal className="container-dc mt-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-bg-muted shadow-lift">
              <Image
                src={project.coverUrl}
                alt={project.title}
                fill
                priority
                sizes="(min-width: 1200px) 1200px, 100vw"
                className="object-cover object-top"
              />
            </div>
          </Reveal>
        )}

        <div className="container-dc mt-14 grid gap-12 lg:grid-cols-[0.65fr_1.35fr]">
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <dl className="card divide-y divide-line">
              {project.clientName && <Row label="Client" value={project.clientName} />}
              {project.role && <Row label="My role" value={project.role} />}
              {period && <Row label="Timeline" value={period} />}
              <div className="p-5">
                <dt className="eyebrow">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-line bg-bg-muted/50 px-2 py-0.5 font-mono text-[0.68rem] text-fg-muted"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            {project.highlights.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {project.highlights.map((h) => (
                  <div key={h.label} className="card p-4">
                    <p className="display text-3xl">{h.value}</p>
                    <p className="mt-1 text-xs text-fg-muted">{h.label}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
          <div>
            <p className="text-xl leading-relaxed text-fg">{project.summary}</p>
            <div className="mt-8">
              <BlockRenderer blocks={project.description} />
            </div>
            {project.gallery.length > 0 && (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {project.gallery.map((g) => (
                  <figure key={g.url} className="overflow-hidden rounded-2xl border border-line bg-bg-muted">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={g.url}
                        alt={g.alt || project.title}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    {g.caption && (
                      <figcaption className="px-4 py-3 text-sm text-fg-muted">{g.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      {project.related.length > 0 && (
        <section className="container-dc mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="display text-3xl">More work</h2>
            <Link href="/work" className="text-sm font-medium link-underline">
              All projects
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {project.related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
      <CtaBand
        text="Building something similar? Let's talk about it."
        whatsapp={site.profile.whatsapp}
        email={site.profile.email}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
