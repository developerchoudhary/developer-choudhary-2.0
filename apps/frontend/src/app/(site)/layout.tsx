import { connection } from "next/server";
import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { LocationConsent } from "@/components/site/location-consent";
import { VisitTracker } from "@/components/site/visit-tracker";
import { getServices, getSite, setting } from "@/lib/data";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await connection();
  const [site, services] = await Promise.all([getSite(), getServices()]);
  const showBlog = setting(site, "features.blog", true);
  const showReviews = setting(site, "features.reviews", true);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <Header availability={site.profile.availabilityStatus} showBlog={showBlog} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer
        profile={site.profile}
        services={services}
        resume={site.resume}
        note={setting(site, "footer.note", "")}
        showBlog={showBlog}
        showReviews={showReviews}
      />
      <JsonLd data={[...personJsonLd(site.profile, site.reviews), websiteJsonLd()]} />
      <VisitTracker />
      <LocationConsent enabled={setting(site, "features.locationConsent", true)} />
    </>
  );
}
