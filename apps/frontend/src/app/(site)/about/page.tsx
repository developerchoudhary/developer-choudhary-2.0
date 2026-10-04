import { ArrowUpRight, Download, GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { SkillsGrid } from "@/components/site/skills-grid";
import { getCertifications, getEducation, getExperience, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatMonth } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "About Aman Choudhary · Full-stack engineer from Rajasthan",
  description:
    "The story, skills and values behind Developer Choudhary: a full-stack engineer building websites, ERPs and CRMs with Next.js, Go and Kubernetes.",
  path: "/about",
});

const values = [
  {
    title: "Simple beats clever",
    text: "I pick boring, proven technology and write code the next developer can read. Fewer moving parts means fewer 2 a.m. incidents.",
  },
  {
    title: "Own your stack",
    text: "Your code lives in your GitHub, your data on servers you control. No lock-in, no surprise invoices.",
  },
  {
    title: "Show, don't tell",
    text: "Working software every week on a staging URL. You always know where the project stands.",
  },
  {
    title: "Built to be operated",
    text: "Monitoring, backups, documentation and admin panels are part of the delivery, not an upsell.",
  },
];

export default async function AboutPage() {
  const [site, experience, education, certifications] = await Promise.all([
    getSite(),
    getExperience(),
    getEducation(),
    getCertifications(),
  ]);
  const { profile } = site;
  const paragraphs = profile.bioLong.split(/\n{2,}/).filter(Boolean);
  const aboutTagline = site.taglines.find((t) => t.context === "about")?.text;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <section className="container-dc grid gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-bg-muted shadow-lift lg:sticky lg:top-24">
            <Image
              src={profile.avatarUrl || "/aman-choudhary.jpg"}
              alt={profile.fullName}
              fill
              priority
              sizes="(min-width: 1024px) 35vw, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="order-1 lg:order-2">
          <p className="eyebrow mb-5">About</p>
          <h1 className="display text-5xl sm:text-6xl">
            {aboutTagline ?? (
              <>
                I turn business problems into software that <em className="text-accent">just works.</em>
              </>
            )}
          </h1>
          <p className="mt-6 text-xl text-fg-muted">{profile.headline}</p>
          <div className="rich mt-8 text-fg-muted">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />{" "}
              {[profile.locationCity, profile.locationRegion, profile.locationCountry]
                .filter(Boolean)
                .join(", ")}
            </span>
            {education[0] && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-3.5" /> {education[0].degree}, {education[0].institution}
              </span>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
            >
              Work with me <ArrowUpRight className="size-4" />
            </Link>
            {site.resume && (
              <Link
                href="/resume"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-medium hover:bg-bg-muted"
              >
                <Download className="size-4" /> Resume
              </Link>
            )}
          </div>
        </Reveal>
      </section>

      <Section
        number="01"
        eyebrow="Principles"
        title={
          <>
            How I like to <em className="text-accent">work.</em>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="card h-full p-6">
                <h3 className="text-lg font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-fg-muted">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {site.skills.length > 0 && (
        <Section
          number="02"
          eyebrow="Skills"
          title={
            <>
              The stack I reach for <em className="text-accent">every day.</em>
            </>
          }
          lede="Years are hands-on production experience, not tutorials."
        >
          <SkillsGrid groups={site.skills} />
        </Section>
      )}

      {experience.length > 0 && (
        <Section
          number="03"
          eyebrow="Experience"
          title={
            <>
              Where I have <em className="text-accent">worked.</em>
            </>
          }
          action={
            <Link href="/experience" className="text-sm font-medium link-underline">
              Full history
            </Link>
          }
        >
          <ExperienceTimeline items={experience} compact />
        </Section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <Section number="04" eyebrow="Education" title="Education & certifications">
          <div className="grid gap-5 md:grid-cols-2">
            {education.map((e) => (
              <div key={e.id} className="card p-6">
                <p className="eyebrow">
                  {[formatMonth(e.startedAt), formatMonth(e.endedAt)].filter(Boolean).join(" — ")}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{e.degree}</h3>
                <p className="text-fg-muted">
                  {e.institution}
                  {e.field ? ` · ${e.field}` : ""}
                </p>
                {e.description && <p className="mt-3 text-sm text-fg-muted">{e.description}</p>}
              </div>
            ))}
            {certifications.map((c) => (
              <div key={c.id} className="card p-6">
                <p className="eyebrow">{formatMonth(c.issuedAt) || "Certification"}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{c.name}</h3>
                <p className="text-fg-muted">{c.issuer}</p>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm link-underline"
                  >
                    View credential <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
      <CtaBand text="Let's build something your customers will love." whatsapp={profile.whatsapp} />
    </>
  );
}
