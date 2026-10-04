import { ArrowUpRight, Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/site/block-renderer";
import { ProjectCard } from "@/components/site/cards";
import { Cta } from "@/components/site/cta";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ArrowLink, BackLink, ButtonLink, StatusBadge, TagList } from "@/components/site/ui";
import { getProject, getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata, projectJsonLd } from "@/lib/seo";
import { PROJECT_TYPE_LABELS, siteSettings } from "@/lib/site";
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
    image: project.coverUrl || null, // no cover: the segment's opengraph-image route renders a titled card
  });
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, site, services] = await Promise.all([getProject(slug), getSite(), getServices()]);
  if (!project) notFound();
  const settings = siteSettings(site);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ];
  const period = [formatMonth(project.startedAt), formatMonth(project.completedAt)]
    .filter(Boolean)
    .join(" – ");
  const facts = [
    { label: "Client", value: project.clientName },
    { label: "Industry", value: project.clientIndustry },
    { label: "My role", value: project.role },
    { label: "Timeline", value: period || (project.status === "upcoming" ? "Starting soon" : "") },
  ].filter((f) => f.value);
  const linkedServices = services.filter((s) => project.serviceSlugs.includes(s.slug));
  const type = PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType;

  return (
    <>
      <JsonLd data={[projectJsonLd(project, site.profile), breadcrumbJsonLd(crumbs)]} />
      <article>
        <header className="container-dc pt-12 sm:pt-16">
          <BackLink href="/work">All work</BackLink>
          <div className="rise mt-10 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">{type}</span>
            {project.status !== "completed" && <StatusBadge status={project.status} />}
          </div>
          <h1 className="display rise mt-3 max-w-3xl text-balance text-[2.4rem] sm:text-[3.25rem]">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="rise mt-4 max-w-2xl text-pretty text-lg text-fg-muted sm:text-xl">
              {project.subtitle}
            </p>
          )}
          {(project.liveUrl || project.repoUrl) && (
            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row">
              {project.liveUrl && (
                <ButtonLink href={project.liveUrl}>
                  Visit live site <ArrowUpRight className="size-4" />
                </ButtonLink>
              )}
              {project.repoUrl && (
                <ButtonLink href={project.repoUrl} variant="secondary">
                  <Github className="size-4" /> Source code
                </ButtonLink>
              )}
            </div>
          )}
          {facts.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-sm text-fg-subtle">{f.label}</dt>
                  <dd className="mt-1 font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        {project.coverUrl && (
          <Reveal className="container-dc mt-10">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-bg-muted shadow-lift sm:aspect-[16/9]">
              <Image
                src={project.coverUrl}
                alt={project.title}
                fill
                priority
                sizes="(min-width: 1120px) 1056px, 100vw"
                className="object-cover object-top"
              />
            </div>
          </Reveal>
        )}

        <div className="container-dc mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <div className="min-w-0 max-w-[68ch]">
            {project.summary && (
              <p className="text-pretty text-xl leading-relaxed text-fg">{project.summary}</p>
            )}
            <BlockRenderer blocks={project.description} className="rich mt-8" />
            {project.gallery.length > 0 && (
              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {project.gallery.map((g) => (
                  <figure key={g.url}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-bg-muted">
                      <Image
                        src={g.url}
                        alt={g.alt || project.title}
                        fill
                        sizes="(min-width: 768px) 340px, 100vw"
                        className="object-cover"
                      />
                    </div>
                    {g.caption && (
                      <figcaption className="mt-2 text-sm text-fg-subtle">{g.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
          <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
            {project.highlights.length > 0 && (
              <dl className="grid grid-cols-2 gap-3">
                {project.highlights.map((h) => (
                  <div key={h.label} className="card flex flex-col p-4">
                    <dt className="order-2 mt-1 text-sm text-fg-muted">{h.label}</dt>
                    <dd className="order-1 text-2xl font-semibold tracking-tight text-fg">{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {project.technologies.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold">Tech stack</h2>
                <TagList items={project.technologies} className="mt-3" />
              </div>
            )}
            {linkedServices.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold">Services</h2>
                <ul className="mt-3 space-y-2">
                  {linkedServices.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="text-[0.95rem] text-accent hover:underline"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>

      {project.related.length > 0 && (
        <section className="container-dc pt-20 pb-4">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h2 className="display text-2xl sm:text-[1.75rem]">More work</h2>
            <ArrowLink href="/work">All projects</ArrowLink>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {project.related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <Cta
        title="Building something similar?"
        text={settings.ctaText}
        whatsapp={site.profile.whatsapp}
        primary={settings.heroPrimary}
      />
    </>
  );
}
