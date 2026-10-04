import { ArrowUpRight, Award, Download, GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatTile } from "@/components/site/cards";
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
  { title: "Simple beats clever", text: "Boring, proven technology and code the next developer can read." },
  {
    title: "Own your stack",
    text: "Your code in your GitHub, your data on servers you control. No lock-in.",
  },
  { title: "Show, don't tell", text: "Working software every week on a staging URL you can share." },
  {
    title: "Built to be operated",
    text: "Monitoring, backups, docs and admin panels are part of the delivery.",
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
  const aboutLine = site.taglines.find((t) => t.context === "about")?.text;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden="true" />
        <div className="container-dc relative grid gap-12 pt-12 pb-16 sm:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-bg-muted shadow-lift">
                <Image
                  src={profile.avatarUrl || "/aman-choudhary.jpg"}
                  alt={profile.fullName}
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="card absolute -right-3 -bottom-4 flex items-center gap-2 px-4 py-3 text-sm shadow-lift sm:-right-6">
                <MapPin className="size-4 text-accent" />
                {[profile.locationCity, profile.locationRegion].filter(Boolean).join(", ")}
              </div>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={0.1}>
            <p className="eyebrow mb-5">About</p>
            <h1 className="display text-balance text-4xl sm:text-6xl">
              {aboutLine ?? (
                <>
                  Hi, I&apos;m {profile.fullName.split(" ")[0]}. I build software that{" "}
                  <span className="text-accent">businesses run on.</span>
                </>
              )}
            </h1>
            <div className="mt-7 space-y-4 text-pretty text-lg leading-relaxed text-fg-muted">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-sm font-medium text-bg transition hover:bg-fg/90"
              >
                Work with me <ArrowUpRight className="size-4" />
              </Link>
              {site.resume && (
                <a
                  href="/api/v1/public/resume/download"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong px-5 text-sm font-medium transition hover:bg-bg-muted"
                >
                  <Download className="size-4" /> Resume
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-dc">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile value={`${profile.yearsExperience}+`} label="Years of experience" />
          <StatTile value={`${profile.projectsCompleted}+`} label="Projects shipped" />
          <StatTile value={`${profile.clientsServed}+`} label="Clients served" />
          <StatTile value={experience.length} label="Companies worked with" />
        </div>
      </section>

      <Section eyebrow="Principles" title="How I like to work" size="tight">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="card h-full p-6">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-3 font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {experience.length > 0 && (
        <Section
          id="experience"
          eyebrow="Experience"
          title={
            <>
              Where I&apos;ve <span className="text-accent">shipped.</span>
            </>
          }
        >
          <ExperienceTimeline items={experience} />
        </Section>
      )}

      {site.skills.length > 0 && (
        <Section
          id="skills"
          eyebrow="Toolbox"
          title="The stack I reach for"
          lede="Highlighted tools are the ones I use nearly every week."
        >
          <SkillsGrid groups={site.skills} />
        </Section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <Section eyebrow="Background" title="Education & certifications" size="tight">
          <div className="grid gap-4 md:grid-cols-2">
            {education.map((e) => (
              <div key={e.id} className="card flex gap-4 p-6">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <GraduationCap className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{e.degree}</p>
                  <p className="text-sm text-fg-muted">
                    {e.institution}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  <p className="mt-1 font-mono text-xs text-fg-subtle">
                    {[formatMonth(e.startedAt), formatMonth(e.endedAt)].filter(Boolean).join(" — ")}
                    {e.grade ? ` · ${e.grade}` : ""}
                  </p>
                  {e.description && <p className="mt-3 text-sm text-fg-muted">{e.description}</p>}
                </div>
              </div>
            ))}
            {certifications.map((c) => (
              <div key={c.id} className="card flex gap-4 p-6">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Award className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-fg-muted">{c.issuer}</p>
                  <p className="mt-1 font-mono text-xs text-fg-subtle">{formatMonth(c.issuedAt)}</p>
                  {c.credentialUrl && (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                    >
                      View credential <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <CtaBand
        text="If any of this resonates, I would love to hear what you are building."
        whatsapp={profile.whatsapp}
        email={profile.email}
      />
    </>
  );
}
