import { connection } from "next/server";
import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { LocationConsent } from "@/components/site/location-consent";
import { ThemePreview } from "@/components/site/theme-preview";
import { VisitTracker } from "@/components/site/visit-tracker";
import { getSite } from "@/lib/data";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await connection();
  const site = await getSite();
  const settings = siteSettings(site);

  return (
    <div className="site-canvas flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <Header siteName={settings.name} showBlog={settings.showBlog} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer profile={site.profile} settings={settings} hasResume={Boolean(site.resume)} />
      <JsonLd
        data={[...personJsonLd(site.profile, settings.name, site.reviews), websiteJsonLd(settings.name)]}
      />
      <VisitTracker />
      <LocationConsent enabled={settings.askLocation} />
      <ThemePreview />
    </div>
  );
}
