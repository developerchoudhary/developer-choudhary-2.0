import { ArrowUpRight, Check, Clock, IndianRupee } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/site/block-renderer";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProjectCard, ReviewCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ServiceIcon } from "@/components/site/service-icon";
import { getFeaturedProjects, getReviews, getService, getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  return pageMetadata({
    title: service.seoTitle || `${service.title} · ${service.tagline}`,
    description: service.seoDescription || service.summary,
    path: `/services/${service.slug}`,
    image: service.coverUrl || undefined,
  });
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [service, site, all, projects, reviews] = await Promise.all([
    getService(slug),
    getSite(),
    getServices(),
    getFeaturedProjects(12),
    getReviews(false, 0),
  ]);
  if (!service) notFound();

  const related = projects.filter((p) => p.serviceSlugs.includes(service.slug)).slice(0, 3);
  const serviceReviews = reviews.filter((r) => r.serviceSlug === service.slug).slice(0, 3);
  const others = all.filter((s) => s.slug !== service.slug).slice(0, 4);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[serviceJsonLd(service, site.profile), breadcrumbJsonLd(crumbs), faqJsonLd(service.faqs)]}
      />
      <section className="container-dc pt-10 pb-12 sm:pt-16">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal>
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <ServiceIcon name={service.icon} className="size-6" />
            </span>
            <h1 className="display mt-6 text-5xl sm:text-6xl lg:text-7xl">{service.title}</h1>
            <p className="mt-5 max-w-2xl text-xl text-fg-muted">{service.tagline}</p>
            <p className="mt-4 max-w-2xl text-fg-muted">{service.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg hover:opacity-90"
              >
                Get a quote <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/work"
                className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-sm font-medium hover:bg-bg-muted"
              >
                See related work
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <aside className="card p-6 lg:sticky lg:top-24">
              <dl className="space-y-5">
                {service.startingPriceLabel && (
                  <div className="flex items-start gap-3">
                    <IndianRupee className="mt-0.5 size-4 text-accent" />
                    <div>
                      <dt className="eyebrow">Investment</dt>
                      <dd className="mt-1 font-medium">{service.startingPriceLabel}</dd>
                    </div>
                  </div>
                )}
                {service.timelineLabel && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 text-accent" />
                    <div>
                      <dt className="eyebrow">Typical timeline</dt>
                      <dd className="mt-1 font-medium">{service.timelineLabel}</dd>
                    </div>
                  </div>
                )}
                {service.idealFor.length > 0 && (
                  <div>
                    <dt className="eyebrow">Ideal for</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {service.idealFor.map((i) => (
                        <span
                          key={i}
                          className="rounded-full border border-line px-2.5 py-0.5 text-xs text-fg-muted"
                        >
                          {i}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {service.techStack.length > 0 && (
                  <div>
                    <dt className="eyebrow">Stack</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {service.techStack.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-line px-2 py-0.5 font-mono text-[0.68rem] text-fg-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="container-dc grid gap-12 pb-16 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <BlockRenderer blocks={service.description} />
        </div>
        {service.deliverables.length > 0 && (
          <div>
            <p className="eyebrow mb-4">What you get</p>
            <ul className="space-y-3">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3 text-fg-muted">
                  <Check className="mt-1 size-4 shrink-0 text-accent" /> {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="container-dc pb-16">
          <p className="eyebrow mb-6">Related work</p>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {serviceReviews.length > 0 && (
        <section className="container-dc pb-16">
          <p className="eyebrow mb-6">Clients on this service</p>
          <div className="grid gap-5 md:grid-cols-3">
            {serviceReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}

      {service.faqs.length > 0 && (
        <section className="container-dc pb-16">
          <h2 className="display mb-6 text-3xl">Questions about {service.title.toLowerCase()}</h2>
          <div className="max-w-3xl">
            <Faq items={service.faqs} />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="container-dc pb-8">
          <p className="eyebrow mb-4">Other services</p>
          <div className="flex flex-wrap gap-2">
            {others.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="rounded-full border border-line px-4 py-2 text-sm hover:bg-bg-muted"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}
      <CtaBand
        text={`Need ${service.title.toLowerCase()}? Let's scope it this week.`}
        whatsapp={site.profile.whatsapp}
      />
    </>
  );
}
