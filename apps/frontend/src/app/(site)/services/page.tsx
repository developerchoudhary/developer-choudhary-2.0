import { ServiceCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { PageHero, Section } from "@/components/site/section";
import { getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services · Website, ERP, CRM & custom software development",
  description:
    "Business websites, ERP systems, CRM portals, custom web apps, APIs and self-hosted DevOps. Fixed scope, clear timelines, built with Next.js, Go and PostgreSQL.",
  path: "/services",
});

const faqs = [
  {
    question: "How do we start?",
    answer:
      "Send a short brief through the contact form. I reply within one working day with questions, then we book a call and I send a written scope and quote.",
  },
  {
    question: "Do you work with clients outside India?",
    answer:
      "Yes. Most of my current clients are in Australia and India. I work remotely, overlap with your hours for calls, and share progress on a staging URL every week.",
  },
  {
    question: "Who owns the code?",
    answer:
      "You do. Everything is delivered in your own GitHub organisation and deployed to servers you control, with documentation so another developer could take over.",
  },
  {
    question: "What about maintenance?",
    answer:
      "Every project includes 30 days of post-launch support. After that I offer a monthly retainer for updates, monitoring and new features.",
  },
];

export default async function ServicesPage() {
  const [site, services] = await Promise.all([getSite(), getServices()]);
  const cta =
    site.taglines.find((t) => t.context === "cta")?.text ??
    "Not sure which one fits? Tell me about the problem.";
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
            Everything a business needs to run <em className="text-accent">online.</em>
          </>
        }
        lede="From a fast marketing site to a full ERP, I design, build and host software that your team can rely on for years."
      />
      <section className="container-dc pb-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i * 0.06, 0.3)}>
              <ServiceCard service={s} index={i} />
            </Reveal>
          ))}
        </div>
      </section>
      <Section eyebrow="FAQ" title="Common questions">
        <div className="max-w-3xl">
          <Faq items={faqs} />
        </div>
      </Section>
      <CtaBand text={cta} whatsapp={site.profile.whatsapp} />
    </>
  );
}
