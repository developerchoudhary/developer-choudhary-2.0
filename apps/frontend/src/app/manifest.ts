import type { MetadataRoute } from "next";
import { versioned } from "@/lib/brand";
import { getSite } from "@/lib/data";
import { siteSettings } from "@/lib/site";

// Colours and icons follow the theme chosen in the admin, so the manifest is built on request.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSite();
  const s = siteSettings(site);
  const light = site.theme?.tokens.light;
  const icon = (path: string) => versioned(path, site.theme);
  return {
    name: `${s.name} · ${site.profile.fullName}`,
    short_name: s.name,
    description: s.seoDescription,
    start_url: "/",
    display: "standalone",
    background_color: light?.bg ?? "#f8fafc",
    theme_color: light?.accent ?? "#23648e",
    icons: [
      { src: icon("/brand/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: icon("/brand/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: icon("/brand/icon-maskable.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "technology", "productivity"],
    lang: "en",
  };
}
