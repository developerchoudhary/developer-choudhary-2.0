import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PostCard, ProjectCard, ReviewCard, ServiceCard, StatTile } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { Marquee } from "@/components/site/marquee";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { TaglineRotator } from "@/components/site/tagline-rotator";
import { Stars } from "@/components/ui/misc";
import { getFeaturedProjects, getRecentPosts, getReviews, getServices, getSite, setting } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${SITE_NAME} · Websites, ERP & CRM development`,
  description: DEFAULT_DESCRIPTION,
  path: "",
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

export default async function HomePage() {
  const [site, services, projects, reviews, posts] = await Promise.all([
    getSite(),
    getServices(),
    getFeaturedProjects(4),
    getReviews(true, 3),
    getRecentPosts(3),
  ]);
  const { profile } = site;
  const heroLines = site.taglines.filter((t) => t.context === "hero").map((t) => t.text);
  const cta = setting<{ label: string; href: string }>(site, "hero.ctaPrimary", {
    label: "Start a project",
    href: "/contact",
  });
  const ctaSecondary = setting<{ label: string; href: string }>(site, "hero.ctaSecondary", {
    label: "See the work",
    href: "/work",
  });
  const ctaText =
    site.taglines.find((t) => t.context === "cta")?.text ?? "Have an idea? Let's turn it into software.";
  const featuredServices = services.filter((s) => s.isFeatured).slice(0, 3);
  const stack = Array.from(
    new Set(site.skills.flatMap((g) => g.skills.filter((s) => s.isFeatured).map((s) => s.name))),
  ).slice(0, 14);
  const showBlog = setting(site, "features.blog", true);
  const showReviews = setting(site, "features.reviews", true);

  return (
    <>
      <section className="container-dc pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <p className="eyebrow mb-6">
              {setting(site, "hero.eyebrow", "Independent full-stack engineer · India")}
            </p>
            <h1 className="display text-[clamp(2.75rem,7.2vw,6rem)]">
              {heroLines.length > 0 ? (
                <TaglineRotator items={heroLines} />
              ) : (
                <span>Websites, ERPs and CRMs built to last.</span>
              )}
            </h1>
            <p className="mt-7 max-w-xl text-lg text-fg-muted sm:text-xl">{profile.bioShort}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={cta.href}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg transition hover:opacity-90"
              >
                {cta.label} <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href={ctaSecondary.href}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium text-fg transition hover:bg-bg-muted"
              >
                {ctaSecondary.label}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${profile.availabilityStatus === "available" ? "bg-success animate-pulse-soft" : profile.availabilityStatus === "limited" ? "bg-highlight" : "bg-danger"}`}
                />
                {profile.availabilityNote ||
                  (profile.availabilityStatus === "available"
                    ? "Available for new projects"
                    : "Limited availability")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />{" "}
                {[profile.locationCity, profile.locationCountry].filter(Boolean).join(", ")} · working
                worldwide
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-bg-muted shadow-lift">
              <Image
                src={profile.avatarUrl || "/aman-choudhary.jpg"}
                alt={profile.fullName}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="card absolute -left-4 bottom-10 flex items-center gap-3 px-4 py-3 sm:-left-8">
              <span className="display text-3xl">{profile.yearsExperience}+</span>
              <span className="text-xs leading-tight text-fg-muted">
                years building
                <br />
                software
              </span>
            </div>
            {site.reviews.count > 0 && (
              <div className="card absolute -right-2 top-8 flex items-center gap-3 px-4 py-3 sm:-right-6">
                <Stars rating={Math.round(site.reviews.average)} size="size-3.5" />
                <span className="text-xs text-fg-muted">
                  {site.reviews.average.toFixed(1)} · {site.reviews.count} reviews
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="container-dc">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile value={profile.yearsExperience} label="Years of experience" />
          <StatTile value={profile.projectsCompleted} label="Projects shipped" />
          <StatTile value={profile.clientsServed} label="Happy clients" />
          <StatTile
            value={site.reviews.count > 0 ? site.reviews.average.toFixed(1) : "5.0"}
            label="Average client rating"
            suffix="★"
          />
        </div>
      </section>

      {featuredServices.length > 0 && (
        <Section
          id="services"
          number="01"
          eyebrow="Services"
          title={
            <>
              Software for businesses that want to <em className="text-accent">grow.</em>
            </>
          }
          lede="Pick the engagement that fits. Every project includes design, build, deployment and documentation."
          action={
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-medium link-underline"
            >
              All services <ArrowRight className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-3">
            {featuredServices.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <ServiceCard service={s} index={i} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section
          id="work"
          number="02"
          eyebrow="Selected work"
          title={
            <>
              Real products, in production, <em className="text-accent">used every day.</em>
            </>
          }
          action={
            <Link href="/work" className="inline-flex items-center gap-1 text-sm font-medium link-underline">
              All projects <ArrowRight className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProjectCard project={p} large={i === 0} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section
        number="03"
        eyebrow="How we work"
        title={
          <>
            Clear scope. Fixed timelines. <em className="text-accent">No surprises.</em>
          </>
        }
      >
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <li className="card h-full p-6">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm text-fg-muted">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {stack.length > 0 && <Marquee items={stack} />}

      {showReviews && reviews.length > 0 && (
        <Section
          number="04"
          eyebrow="Client reviews"
          title={
            <>
              What people say after <em className="text-accent">launch day.</em>
            </>
          }
          action={
            <Link
              href="/reviews"
              className="inline-flex items-center gap-1 text-sm font-medium link-underline"
            >
              All reviews <ArrowRight className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.08}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {showBlog && posts.length > 0 && (
        <Section
          number="05"
          eyebrow="Writing"
          title={
            <>
              Notes from the <em className="text-accent">workbench.</em>
            </>
          }
          action={
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium link-underline">
              All articles <ArrowRight className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <CtaBand text={ctaText} whatsapp={profile.whatsapp} />
    </>
  );
}
