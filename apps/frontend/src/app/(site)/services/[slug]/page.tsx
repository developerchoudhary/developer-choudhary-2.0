import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/site/block-renderer";
import { ProjectCard } from "@/components/site/cards";
import { Cta } from "@/components/site/cta";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { ServiceIcon } from "@/components/site/service-icon";
import { BackLink, ButtonLink, TagList } from "@/components/site/ui";
import { getProjects, getService, getSite } from "@/lib/data";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

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
  const [service, site, related] = await Promise.all([
    getService(slug),
    getSite(),
    getProjects({ service: slug, pageSize: 3 }).catch(() => null),
  ]);
  if (!service) notFound();
  const settings = siteSettings(site);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ];
  const contactHref = `/contact?service=${encodeURIComponent(service.title)}`;
  const facts = [
    { label: "Starting at", value: service.startingPriceLabel },
    { label: "Typical timeline", value: service.timelineLabel },
  ].filter((f) => f.value);

  return (
    <>
      <JsonLd
        data={[serviceJsonLd(service, site.profile), faqJsonLd(service.faqs), breadcrumbJsonLd(crumbs)]}
      />
      <header className="container-dc pt-12 sm:pt-16">
        <BackLink href="/services">All services</BackLink>
        <div className="rise mt-10 flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <ServiceIcon name={service.icon} className="size-6" />
        </div>
        <h1 className="display rise mt-6 max-w-3xl text-balance text-[2.4rem] sm:text-[3.25rem]">
          {service.title}
        </h1>
        {service.tagline && (
          <p className="rise mt-4 max-w-2xl text-pretty text-lg text-fg-muted sm:text-xl">
            {service.tagline}
          </p>
        )}
        <div className="rise mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <ButtonLink href={contactHref}>Discuss your project</ButtonLink>
          {facts.length > 0 && (
            <dl className="flex gap-8">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-sm text-fg-subtle">{f.label}</dt>
                  <dd className="font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {service.coverUrl && (
        <div className="container-dc mt-12">
          <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-line bg-bg-muted">
            <Image
              src={service.coverUrl}
              alt={service.title}
              fill
              priority
              sizes="(min-width: 1120px) 1056px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="container-dc mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="min-w-0 max-w-[68ch]">
          {service.summary && (
            <p className="text-pretty text-xl leading-relaxed text-fg">{service.summary}</p>
          )}
          <BlockRenderer blocks={service.description} className="rich mt-8" />
          {service.faqs.length > 0 && (
            <div className="mt-14">
              <h2 className="display mb-4 text-2xl">Questions</h2>
              <Faq items={service.faqs} />
            </div>
          )}
        </div>
        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          {service.deliverables.length > 0 && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold">What you get</h2>
              <ul className="mt-4 space-y-3 text-[0.95rem]">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 text-fg-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {service.idealFor.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold">A good fit for</h2>
              <ul className="mt-3 space-y-2 text-[0.95rem] text-fg-muted">
                {service.idealFor.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {service.techStack.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold">Tech stack</h2>
              <TagList items={service.techStack} className="mt-3" />
            </div>
          )}
        </aside>
      </div>

      {related && related.items.length > 0 && (
        <section className="container-dc pt-20 pb-4">
          <h2 className="display mb-8 text-2xl sm:text-[1.75rem]">Related work</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.items.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <Cta
        title={settings.ctaTitle}
        text={`Tell me about your project and I will reply ${settings.responseTime} with next steps.`}
        whatsapp={site.profile.whatsapp}
        primary={{ label: "Discuss your project", href: contactHref }}
      />
    </>
  );
}
