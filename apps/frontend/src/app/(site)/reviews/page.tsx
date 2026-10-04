import { MessageSquareQuote } from "lucide-react";
import { ReviewCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ReviewForm } from "@/components/site/review-form";
import { PageHero } from "@/components/site/section";
import { EmptyState, Stars } from "@/components/ui/misc";
import { getReviewSummary, getReviews, getServices, getSite, setting } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Client reviews",
  description:
    "What clients say about working with Developer Choudhary on websites, ERPs, CRMs and web platforms.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const [site, reviews, summary, services] = await Promise.all([
    getSite(),
    getReviews(false, 0),
    getReviewSummary(),
    getServices(),
  ]);
  const allowSubmit = setting(site, "features.reviews", true);
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: summary.distribution[String(n)] ?? 0 }));
  const max = Math.max(1, ...distribution.map((d) => d.count));

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
            Kind words from <span className="text-accent">real clients.</span>
          </>
        }
        lede="Every review is from someone I have built software for. Approved before publishing, never edited for sentiment."
      >
        {summary.count > 0 && (
          <div className="card inline-grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div>
              <p className="display text-6xl">{summary.average.toFixed(1)}</p>
              <Stars rating={Math.round(summary.average)} className="mt-2" />
              <p className="mt-2 text-sm text-fg-muted">
                {summary.count} review{summary.count === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="w-56 space-y-1.5">
              {distribution.map((d) => (
                <li key={d.n} className="flex items-center gap-3 text-xs text-fg-muted">
                  <span className="w-3 tabular">{d.n}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${(d.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-5 text-right tabular">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageHero>

      <section className="container-dc pb-8">
        {reviews.length === 0 ? (
          <EmptyState
            icon={<MessageSquareQuote className="size-5" />}
            title="No reviews published yet"
            description="Worked with me? Your review would mean a lot."
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

      {allowSubmit && (
        <section className="container-dc py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow mb-4">Worked together?</p>
              <h2 className="display text-3xl sm:text-4xl">Leave a review</h2>
              <p className="mt-4 text-fg-muted">
                A few honest lines help the next business decide. Reviews are published after a quick check.
              </p>
            </div>
            <ReviewForm services={services} />
          </div>
        </section>
      )}
    </>
  );
}
