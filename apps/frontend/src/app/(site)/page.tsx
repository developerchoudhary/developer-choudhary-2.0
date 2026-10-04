import type { Metadata } from "next";
import { ProjectCard, ServiceCard, Testimonial } from "@/components/site/cards";
import { Cta } from "@/components/site/cta";
import { Hero } from "@/components/site/hero";
import { Reveal } from "@/components/site/reveal";
import { ArrowLink, Section } from "@/components/site/ui";
import { getFeaturedProjects, getReviews, getServices, getSite } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = siteSettings(await getSite());
  return pageMetadata({
    title: settings.seoTitle,
    description: settings.seoDescription,
    path: "",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const [site, services, projects, reviews] = await Promise.all([
    getSite(),
    getServices(),
    getFeaturedProjects(3),
    getReviews(true, 1),
  ]);
  const settings = siteSettings(site);
  const featuredServices = (
    services.some((s) => s.isFeatured) ? services.filter((s) => s.isFeatured) : services
  ).slice(0, 3);
  const testimonial = settings.showReviews ? reviews[0] : undefined;

  return (
    <>
      <Hero profile={site.profile} primary={settings.heroPrimary} secondary={settings.heroSecondary} />

      {projects.length > 0 && (
        <Section
          id="work"
          title="Selected work"
          lede="A few recent projects, from first sketch to production."
          action={<ArrowLink href="/work">All projects</ArrowLink>}
        >
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {featuredServices.length > 0 && (
        <Section title="What I can do for you" action={<ArrowLink href="/services">All services</ArrowLink>}>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredServices.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.06}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {testimonial && (
        <section className="py-14 sm:py-20">
          <Reveal className="container-dc">
            <Testimonial review={testimonial} />
          </Reveal>
        </section>
      )}

      <Cta
        title={settings.ctaTitle}
        text={settings.ctaText}
        whatsapp={site.profile.whatsapp}
        primary={settings.heroPrimary}
      />
    </>
  );
}
