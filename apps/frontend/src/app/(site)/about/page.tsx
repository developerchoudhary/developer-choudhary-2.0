import { ArrowUpRight, Download } from "lucide-react";
import type { Metadata } from "next";
import { Cta } from "@/components/site/cta";
import { JsonLd } from "@/components/site/json-ld";
import { Portrait } from "@/components/site/portrait";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink, Section, Tag } from "@/components/site/ui";
import { getCertifications, getEducation, getExperience, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SKILL_CATEGORY_LABELS, siteSettings } from "@/lib/site";
import type { Certification, Education, Experience, SkillGroup } from "@/lib/types";
import { cn, formatMonth } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return pageMetadata({
    title: "About",
    description: profile.bioShort || `About ${profile.fullName}, ${profile.headline}.`,
    path: "/about",
  });
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  freelance: "Freelance",
  contract: "Contract",
  internship: "Internship",
};

const STAT_COLUMNS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default async function AboutPage() {
  const [site, experience, education, certifications] = await Promise.all([
    getSite(),
    getExperience(),
    getEducation(),
    getCertifications(),
  ]);
  const { profile } = site;
  const settings = siteSettings(site);
  const paragraphs = (profile.bioLong || profile.bioShort).split(/\n{2,}/).filter(Boolean);
  const stats = [
    { label: "Years of experience", value: profile.yearsExperience },
    { label: "Projects delivered", value: profile.projectsCompleted },
    { label: "Clients served", value: profile.clientsServed },
  ].filter((s) => s.value > 0);
  const showResume = settings.showResume && site.resume;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <section className="container-dc grid gap-14 pt-12 pb-12 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20">
        <div className="max-w-2xl">
          <h1 className="display rise text-[2.5rem] sm:text-[3.25rem]">About me</h1>
          <div
            className="rise mt-6 space-y-5 text-pretty text-lg leading-relaxed text-fg-muted"
            style={delay(80)}
          >
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={delay(140)}>
            <ButtonLink href="/contact">Work with me</ButtonLink>
            {showResume && (
              <ButtonLink href="/api/v1/public/resume/download" variant="secondary">
                <Download className="size-4" /> Download resume
              </ButtonLink>
            )}
          </div>
        </div>
        <div className="rise mx-auto w-full max-w-[300px] pl-3 lg:mx-0 lg:mt-3" style={delay(100)}>
          <Portrait
            size="md"
            src={profile.avatarUrl || "/portraits/aman-portrait-4x5.webp"}
            alt={profile.fullName}
            priority
          />
        </div>
      </section>

      {stats.length > 0 && (
        <section className="container-dc pb-4">
          <dl className={cn("grid divide-x divide-line border-y border-line", STAT_COLUMNS[stats.length])}>
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col px-3 py-6 first:pl-0 sm:px-8">
                <dt className="order-2 mt-1 text-sm text-fg-muted">{s.label}</dt>
                <dd className="order-1 text-3xl font-semibold tracking-tight tabular sm:text-4xl">
                  {s.value}+
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {experience.length > 0 && (
        <Section id="experience" title="Experience">
          <ExperienceList items={experience} />
        </Section>
      )}

      {site.skills.length > 0 && (
        <Section id="skills" title="Skills & tools" lede="Highlighted ones are what I use nearly every week.">
          <SkillGroups groups={site.skills} />
        </Section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <Section title={certifications.length > 0 ? "Education & certifications" : "Education"}>
          <BackgroundList education={education} certifications={certifications} />
        </Section>
      )}

      <Cta
        title={settings.ctaTitle}
        text={settings.ctaText}
        whatsapp={profile.whatsapp}
        primary={settings.heroPrimary}
      />
    </>
  );
}

function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((x) => {
        const period = `${formatMonth(x.startedAt)} – ${x.isCurrent ? "Present" : formatMonth(x.endedAt)}`;
        const where = [EMPLOYMENT_LABELS[x.employmentType], x.isRemote ? "Remote" : x.location]
          .filter(Boolean)
          .join(" · ");
        return (
          <Reveal as="li" key={x.id} className="grid gap-3 py-8 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-10">
            <div className="text-sm">
              <p className="font-medium text-fg-muted tabular">{period}</p>
              {where && <p className="mt-1 text-fg-subtle">{where}</p>}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight">
                {x.role}
                <span className="font-normal text-fg-subtle"> at </span>
                {x.companyUrl ? (
                  <a
                    href={x.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-accent hover:underline"
                  >
                    {x.company}
                    <ArrowUpRight className="size-4" />
                  </a>
                ) : (
                  x.company
                )}
              </h3>
              {x.summary && <p className="mt-2 text-pretty leading-relaxed text-fg-muted">{x.summary}</p>}
              {x.achievements.length > 0 && (
                <ul className="mt-4 space-y-2 text-[0.95rem] text-fg-muted">
                  {x.achievements.slice(0, 3).map((a) => (
                    <li key={a} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              {x.technologies.length > 0 && (
                <p className="mt-4 text-sm text-fg-subtle">{x.technologies.slice(0, 8).join(" · ")}</p>
              )}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}

function SkillGroups({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <Reveal key={g.category}>
          <h3 className="text-sm font-semibold">{SKILL_CATEGORY_LABELS[g.category] ?? g.category}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {g.skills.map((s) => (
              <li key={s.id}>
                <Tag
                  className={
                    s.isFeatured ? "border-accent/25 bg-accent-soft font-medium text-accent" : undefined
                  }
                >
                  {s.name}
                </Tag>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}

function BackgroundList({
  education,
  certifications,
}: {
  education: Education[];
  certifications: Certification[];
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {education.map((e) => (
        <li key={e.id} className="grid gap-2 py-7 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-10">
          <p className="text-sm font-medium text-fg-muted tabular">
            {[formatMonth(e.startedAt), formatMonth(e.endedAt)].filter(Boolean).join(" – ")}
          </p>
          <div>
            <h3 className="font-semibold tracking-tight">
              {e.degree}
              {e.field && <span className="font-normal text-fg-muted">, {e.field}</span>}
            </h3>
            <p className="mt-1 text-fg-muted">
              {[e.institution, e.location].filter(Boolean).join(" · ")}
              {e.grade && <span className="text-fg-subtle"> · {e.grade}</span>}
            </p>
            {e.description && <p className="mt-2 text-[0.95rem] text-fg-muted">{e.description}</p>}
          </div>
        </li>
      ))}
      {certifications.map((c) => (
        <li key={c.id} className="grid gap-2 py-7 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-10">
          <p className="text-sm font-medium text-fg-muted tabular">{formatMonth(c.issuedAt)}</p>
          <div>
            <h3 className="font-semibold tracking-tight">{c.name}</h3>
            <p className="mt-1 text-fg-muted">
              {c.issuer}
              {c.credentialUrl && (
                <>
                  {c.issuer && " · "}
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-accent hover:underline"
                  >
                    View credential <ArrowUpRight className="size-3.5" />
                  </a>
                </>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
