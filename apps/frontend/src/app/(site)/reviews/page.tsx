import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewCard, Stars } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ReviewForm } from "@/components/site/review-form";
import { Empty, PageHeader } from "@/components/site/ui";
import { getReviews, getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Client reviews",
    description:
      "What clients say about working with Aman Choudhary on websites, ERPs, CRMs and web platforms.",
    path: "/reviews",
  });
}

export default async function ReviewsPage() {
  const [site, reviews, services] = await Promise.all([getSite(), getReviews(false, 0), getServices()]);
  if (!siteSettings(site).showReviews) notFound();
  const summary = site.reviews;
  const serviceTitle = (slug: string) => services.find((s) => s.slug === slug)?.title;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ])}
      />
      <PageHeader
        title="Client reviews"
        lede="What clients say after working with me. Every review comes from a real project and is checked before it is published."
      >
        {summary.count > 0 && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold tracking-tight tabular">
              {summary.average.toFixed(1)}
            </span>
            <Stars rating={Math.round(summary.average)} />
            <span className="text-fg-muted">
              from {summary.count} review{summary.count === 1 ? "" : "s"}
            </span>
          </p>
        )}
      </PageHeader>

      <section className="container-dc pb-6">
        {reviews.length === 0 ? (
          <Empty title="No reviews published yet">Worked with me? Your review below would mean a lot.</Empty>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i, 3) * 0.05}>
                <ReviewCard review={r} serviceTitle={serviceTitle(r.serviceSlug)} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section id="write" className="container-dc py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <h2 className="display text-[1.75rem] sm:text-[2.25rem]">Worked together?</h2>
            <p className="mt-4 max-w-sm text-pretty text-fg-muted">
              A few honest lines help the next business decide. Your review appears here once I have checked
              it.
            </p>
          </div>
          <ReviewForm services={services} />
        </div>
      </section>
    </>
  );
}
