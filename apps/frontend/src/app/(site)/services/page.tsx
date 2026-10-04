import type { Metadata } from "next";
import { ServiceCard } from "@/components/site/cards";
import { Cta } from "@/components/site/cta";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { Empty, PageHeader } from "@/components/site/ui";
import { getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Services",
    description:
      "Business websites, ERP systems, CRM portals, custom web apps, APIs and self-hosted infrastructure, built end to end by Aman Choudhary.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const [services, site] = await Promise.all([getServices(), getSite()]);
  const settings = siteSettings(site);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <PageHeader
        title="Services"
        lede="From the first wireframe to the server it runs on. Pick what fits, or combine them."
      />
      <section className="container-dc pb-6">
        {services.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={Math.min(i, 3) * 0.05}>
                <ServiceCard service={s} showPrice />
              </Reveal>
            ))}
          </div>
        ) : (
          <Empty title="Services are being updated">Get in touch and tell me what you need.</Empty>
        )}
      </section>
      <Cta
        title="Not sure which one fits?"
        text="Tell me what you are trying to achieve and I will suggest the simplest path."
        whatsapp={site.profile.whatsapp}
        primary={settings.heroPrimary}
      />
    </>
  );
}
