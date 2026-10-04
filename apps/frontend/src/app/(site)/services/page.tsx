import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { PageHero, Section } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services · Website, ERP, CRM and backend development",
  description:
    "Business websites, ERP systems, CRM portals, custom web apps, APIs and self-hosted DevOps. Clear scope, fixed quotes and weekly demos.",
  path: "/services",
});

const process = [
  {
    title: "Discover",
    text: "A focused call to understand goals, users and constraints. You get a written scope and a fixed quote.",
  },
  {
    title: "Design",
    text: "Wireframes and a clickable prototype before any code, so we agree on the experience early.",
  },
  { title: "Build", text: "Weekly demos of working software on a staging URL you can share with your team." },
  {
    title: "Launch & support",
    text: "Deployment on your infrastructure or mine, monitoring, and 30 days of support included.",
  },
];

export default async function ServicesPage() {
  const [services, site] = await Promise.all([getServices(), getSite()]);
  const faqs = services.flatMap((s) => s.faqs).slice(0, 6);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <PageHero
        eyebrow="Services"
        title={
          <>
            One engineer, <span className="text-accent">end to end.</span>
          </>
        }
        lede="From the first wireframe to the server it runs on. Pick the engagement that fits, or combine them."
      />

      <section className="container-dc pb-8">
        <div className="grid gap-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/services/${s.slug}`}
                className="group card card-hover grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center"
              >
                <div className="flex gap-5">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <ServiceIcon name={s.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, "0")}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">{s.title}</h2>
                    <p className="mt-2 text-fg-muted">{s.tagline}</p>
                  </div>
                </div>
                <ul className="grid gap-2 text-sm text-fg-muted sm:grid-cols-2 lg:grid-cols-1">
                  {s.deliverables.slice(0, 4).map((d) => (
                    <li key={d} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-6 lg:flex-col lg:items-end">
                  <div className="text-left lg:text-right">
                    <p className="font-semibold">{s.startingPriceLabel}</p>
                    <p className="text-sm text-fg-muted">{s.timelineLabel}</p>
                  </div>
                  <span className="inline-flex size-10 items-center justify-center rounded-full border border-line text-fg-subtle transition group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Section
        eyebrow="How we work"
        title={
          <>
            Clear scope. Fixed timelines. <span className="text-accent">No surprises.</span>
          </>
        }
      >
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <li className="card h-full p-6">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {faqs.length > 0 && (
        <Section eyebrow="FAQ" title="Questions people ask before we start" size="tight">
          <div className="max-w-3xl">
            <Faq items={faqs} />
          </div>
        </Section>
      )}

      <CtaBand
        text="Not sure which fits? Tell me what you are trying to achieve and I will suggest the simplest path."
        whatsapp={site.profile.whatsapp}
        email={site.profile.email}
      />
    </>
  );
}
