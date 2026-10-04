import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ArrowLink } from "@/components/site/bits";
import {
  PostCard,
  ProjectCard,
  ProjectRow,
  ReviewCard,
  ServiceCard,
  StatTile,
} from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import {
  getFeaturedProjects,
  getProjects,
  getRecentPosts,
  getReviews,
  getServices,
  getSite,
  setting,
} from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata = {
  ...pageMetadata({
    title: `${SITE_NAME} · Websites, ERP & CRM development`,
    description: DEFAULT_DESCRIPTION,
    path: "",
  }),
  title: { absolute: `${SITE_NAME} · Websites, ERP & CRM development` },
};

export default async function HomePage() {
  const [site, services, featured, building, reviews, posts] = await Promise.all([
    getSite(),
    getServices(),
    getFeaturedProjects(3),
    getProjects(1, undefined, ["in-progress", "upcoming"]),
    getReviews(true, 3),
    getRecentPosts(3),
  ]);
  const { profile } = site;
  const heroLines = site.taglines.filter((t) => t.context === "hero").map((t) => t.text);
  const ctaText =
    site.taglines.find((t) => t.context === "cta")?.text ?? "Have an idea? Let's turn it into software.";
  const featuredServices = (
    services.some((s) => s.isFeatured) ? services.filter((s) => s.isFeatured) : services
  ).slice(0, 3);
  const stack = Array.from(
    new Set(site.skills.flatMap((g) => g.skills.filter((s) => s.isFeatured).map((s) => s.name))),
  );
  const marqueeItems =
    stack.length >= 6
      ? stack
      : Array.from(new Set(site.skills.flatMap((g) => g.skills.map((s) => s.name)))).slice(0, 14);
  const showBlog = setting(site, "features.blog", true);
  const showReviews = setting(site, "features.reviews", true);
  const inProgress = building.items.slice(0, 3);

  return (
    <>
      <Hero
        profile={profile}
        taglines={heroLines}
        eyebrow={setting(site, "hero.eyebrow", "Independent full-stack engineer · India")}
        reviews={site.reviews}
        cta={setting(site, "hero.ctaPrimary", { label: "Start a project", href: "/contact" })}
        ctaSecondary={setting(site, "hero.ctaSecondary", { label: "See the work", href: "#work" })}
      />

      <Marquee items={marqueeItems} />

      {featured.length > 0 && (
        <Section
          id="work"
          eyebrow="Selected work"
          title={
            <>
              Real products, in production, <span className="text-accent">used every day.</span>
            </>
          }
          action={<ArrowLink href="/work">All projects</ArrowLink>}
        >
          <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06} className={i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}>
                <ProjectCard project={p} large={i === 0} priority={i === 0} compact={i > 0} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <section className="container-dc">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile value={`${profile.yearsExperience}+`} label="Years of experience" />
          <StatTile value={`${profile.projectsCompleted}+`} label="Projects shipped" />
          <StatTile value={`${profile.clientsServed}+`} label="Happy clients" />
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
          eyebrow="Services"
          title={
            <>
              Software for businesses that want to <span className="text-accent">grow.</span>
            </>
          }
          lede="Pick the engagement that fits. Every project includes design, build, deployment and documentation."
          action={<ArrowLink href="/services">All services</ArrowLink>}
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

      {inProgress.length > 0 && (
        <Section
          eyebrow="On the workbench"
          title={
            <>
              What I&apos;m building <span className="text-accent">right now.</span>
            </>
          }
          size="tight"
          action={<ArrowLink href="/work?status=in-progress">See the roadmap</ArrowLink>}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {inProgress.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProjectRow project={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {showReviews && reviews.length > 0 && (
        <Section
          eyebrow="Client reviews"
          title={
            <>
              What people say after <span className="text-accent">launch day.</span>
            </>
          }
          action={<ArrowLink href="/reviews">All reviews</ArrowLink>}
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
          eyebrow="Writing"
          title={
            <>
              Notes from the <span className="text-accent">workbench.</span>
            </>
          }
          action={<ArrowLink href="/blog">All articles</ArrowLink>}
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

      <CtaBand text={ctaText} whatsapp={profile.whatsapp} email={profile.email} />

      <p className="sr-only">
        <Link href="/contact">
          Contact <ArrowUpRight className="inline size-3" />
        </Link>
      </p>
    </>
  );
}
