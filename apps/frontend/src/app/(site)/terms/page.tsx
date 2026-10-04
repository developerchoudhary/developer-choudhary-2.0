import { PageHero } from "@/components/site/section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description: "Terms for using developerchoudhary.com and engaging Developer Choudhary for services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of use"
        lede="The plain-English rules for using this site and working together."
      />
      <section className="container-dc pb-24">
        <div className="rich max-w-3xl text-fg-muted">
          <h2>Using this site</h2>
          <p>
            Content on this site is provided for information. Case studies describe real projects; figures are
            accurate at the time of writing. You may link to any page. Please do not copy articles wholesale
            without attribution.
          </p>
          <h2>Quotes and engagements</h2>
          <p>
            Prices shown on service pages are starting points. Every engagement is confirmed in a written
            scope and quote before work begins. Timelines depend on timely feedback and content from your
            side.
          </p>
          <h2>Ownership</h2>
          <p>
            On final payment you own the code and content produced for your project. Open-source libraries
            remain under their own licences.
          </p>
          <h2>Reviews</h2>
          <p>
            Submitted reviews may be edited for length or clarity and are published only after approval. I may
            decline reviews that are not from genuine clients.
          </p>
          <h2>Liability</h2>
          <p>
            The site is provided as is. I am not liable for decisions made based on its content. Contractual
            terms for projects are set out in each written agreement.
          </p>
        </div>
      </section>
    </>
  );
}
