import { ReviewCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ReviewForm } from "@/components/site/review-form";
import { PageHero, Section } from "@/components/site/section";
import { EmptyState, Stars } from "@/components/ui/misc";
import { getReviews, getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Client reviews & ratings",
  description:
    "What clients say about working with Aman Choudhary on websites, ERP systems and CRM portals. Read verified reviews or leave your own.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const [site, reviews, services] = await Promise.all([getSite(), getReviews(false, 0), getServices()]);
  const summary = site.reviews;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ])}
      />
      <PageHero
        eyebrow="Reviews"
        title={
          <>
            Honest words from <em className="text-accent">people I have built for.</em>
          </>
        }
        lede="Every review is submitted by a real client and approved before it appears here."
      >
        {summary.count > 0 && (
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="display text-6xl">{summary.average.toFixed(1)}</span>
              <div>
                <Stars rating={Math.round(summary.average)} />
                <p className="mt-1 text-sm text-fg-muted">
                  from {summary.count} review{summary.count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <ul className="w-full max-w-xs space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = summary.distribution[String(n)] ?? 0;
                const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
                return (
                  <li key={n} className="flex items-center gap-2">
                    <span className="w-3 font-mono text-fg-subtle">{n}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
                      <span className="block h-full rounded-full bg-highlight" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-6 text-right font-mono text-fg-subtle">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </PageHero>
      <section className="container-dc pb-8">
        {reviews.length === 0 ? (
          <EmptyState
            title="No public reviews yet"
            description="Worked with me? Be the first to share your experience below."
          />
        ) : (
          <div className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i * 0.04, 0.3)}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
      <Section
        id="write"
        eyebrow="Leave a review"
        title={
          <>
            Worked with me? <em className="text-accent">Tell others how it went.</em>
          </>
        }
        lede="Reviews are moderated to keep out spam. Your email is never published."
      >
        <div className="max-w-2xl">
          <ReviewForm services={services} />
        </div>
      </Section>
      <CtaBand text="Ready to be the next success story?" whatsapp={site.profile.whatsapp} />
    </>
  );
}
