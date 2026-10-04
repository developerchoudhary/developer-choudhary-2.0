import { Download, FileText } from "lucide-react";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { PageHero, Section } from "@/components/site/section";
import { SkillsGrid } from "@/components/site/skills-grid";
import { EmptyState } from "@/components/ui/misc";
import { getExperience, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatBytes, formatDate } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Resume · Aman Choudhary, full-stack engineer",
  description:
    "Download the latest resume of Aman Choudhary: full-stack engineer experienced in Go, Next.js, PostgreSQL and Kubernetes, building ERPs, CRMs and web platforms.",
  path: "/resume",
});

export default async function ResumePage() {
  const [site, experience] = await Promise.all([getSite(), getExperience()]);
  const resume = site.resume;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resume", path: "/resume" },
        ])}
      />
      <PageHero
        eyebrow="Resume"
        title={
          <>
            The résumé, always <span className="text-accent">up to date.</span>
          </>
        }
        lede="Generated from the same data that powers this site, so it never goes stale."
      >
        {resume ? (
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="font-medium">{resume.title}</p>
                <p className="text-sm text-fg-muted">
                  Version {resume.version} · {formatBytes(resume.fileSize)} · Updated{" "}
                  {formatDate(resume.updatedAt)}
                </p>
              </div>
            </div>
            <a
              href="/api/v1/public/resume/download"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg shadow-glow transition hover:bg-accent-strong"
            >
              <Download className="size-4" /> Download PDF
            </a>
          </div>
        ) : (
          <EmptyState
            title="Resume coming soon"
            description="The PDF is being prepared. In the meantime, the experience below is current."
          />
        )}
      </PageHero>
      {resume && (
        <section className="container-dc pb-16">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-line bg-bg-muted shadow-card">
              <iframe
                src={`${resume.fileUrl}#toolbar=0&view=FitH`}
                title="Resume preview"
                className="h-[75vh] w-full"
                loading="lazy"
              />
            </div>
          </Reveal>
        </section>
      )}
      {experience.length > 0 && (
        <Section eyebrow="Experience" title="Work history">
          <ExperienceTimeline items={experience} compact />
        </Section>
      )}
      {site.skills.length > 0 && (
        <Section eyebrow="Skills" title="Technical skills">
          <SkillsGrid groups={site.skills} />
        </Section>
      )}
    </>
  );
}
