import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/section";
import { getExperience, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Experience · Work history of Aman Choudhary",
  description:
    "Roles, responsibilities and outcomes from building CRM portals, property platforms, institutional websites and Kubernetes infrastructure.",
  path: "/experience",
});

export default async function ExperiencePage() {
  const [site, experience] = await Promise.all([getSite(), getExperience()]);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Experience", path: "/experience" },
        ])}
      />
      <PageHero
        eyebrow="Experience"
        title={
          <>
            Work history, with the <em className="text-accent">outcomes attached.</em>
          </>
        }
        lede="What I was responsible for, what shipped, and the technology behind it."
      >
        {site.resume && (
          <Link
            href="/resume"
            className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium hover:bg-bg-muted"
          >
            Download the resume
          </Link>
        )}
      </PageHero>
      <section className="container-dc pb-16">
        <ExperienceTimeline items={experience} />
      </section>
      <CtaBand text="Need this experience on your project?" whatsapp={site.profile.whatsapp} />
    </>
  );
}
