import { ArrowUpRight, Check, Clock, IndianRupee } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TechList } from "@/components/site/bits";
import { BlockRenderer } from "@/components/site/block-renderer";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProjectCard, ReviewCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
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
  const serviceReviews = reviews.filter((r) => r.serviceSlug === service.slug).slice(0, 2);
  const others = all.filter((s) => s.slug !== service.slug).slice(0, 5);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[serviceJsonLd(service, site.profile), faqJsonLd(service.faqs), breadcrumbJsonLd(crumbs)]}
      />
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="container-dc relative pt-10 pb-12 sm:pt-16 sm:pb-16">
          <Breadcrumbs items={crumbs} />
          <Reveal>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <ServiceIcon name={service.icon} className="size-5" />
                </span>
                <h1 className="display mt-6 max-w-3xl text-balance text-4xl sm:text-6xl">{service.title}</h1>
                <p className="mt-5 max-w-2xl text-pretty text-lg text-fg-muted sm:text-xl">
                  {service.tagline}
                </p>
              </div>
              <div className="card grid grid-cols-2 divide-x divide-line">
                <div className="p-5">
                  <p className="eyebrow inline-flex items-center gap-1.5">
                    <IndianRupee className="size-3" /> Starting at
                  </p>
                  <p className="mt-2 text-xl font-semibold">{service.startingPriceLabel || "On request"}</p>
                </div>
                <div className="p-5">
                  <p className="eyebrow inline-flex items-center gap-1.5">
                    <Clock className="size-3" /> Timeline
                  </p>
                  <p className="mt-2 text-xl font-semibold">{service.timelineLabel || "Depends on scope"}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container-dc grid gap-12 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="text-xl leading-relaxed text-fg">{service.summary}</p>
          <div className="mt-8">
            <BlockRenderer blocks={service.description} />
          </div>
          {service.faqs.length > 0 && (
            <div className="mt-14">
              <h2 className="display mb-6 text-3xl">Questions</h2>
              <Faq items={service.faqs} />
            </div>
          )}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {service.deliverables.length > 0 && (
            <div className="card p-6">
              <p className="eyebrow mb-4">What you get</p>
              <ul className="space-y-2.5 text-sm">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex gap-2.5 text-fg-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {service.idealFor.length > 0 && (
            <div className="card p-6">
              <p className="eyebrow mb-4">Ideal for</p>
              <ul className="space-y-2 text-sm text-fg-muted">
                {service.idealFor.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {service.techStack.length > 0 && (
            <div className="card p-6">
              <p className="eyebrow mb-4">Stack</p>
              <TechList items={service.techStack} max={12} />
            </div>
          )}
          <Link
            href={`/contact?service=${encodeURIComponent(service.title)}`}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-fg shadow-glow transition hover:bg-accent-strong"
          >
            Discuss this service <ArrowUpRight className="size-4" />
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <Section eyebrow="Related work" title="Delivered with this service" size="tight">
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {serviceReviews.length > 0 && (
        <Section eyebrow="Reviews" title="From clients" size="tight">
          <div className="grid gap-5 md:grid-cols-2">
            {serviceReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </Section>
      )}

      {others.length > 0 && (
        <section className="container-dc py-10">
          <p className="eyebrow mb-4">Other services</p>
          <div className="flex flex-wrap gap-2">
            {others.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg"
              >
                <ServiceIcon name={s.icon} className="size-3.5" /> {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <CtaBand
        text={`Ready to talk about ${service.title.toLowerCase()}? I reply within one working day.`}
        whatsapp={site.profile.whatsapp}
        email={site.profile.email}
      />
    </>
  );
}
