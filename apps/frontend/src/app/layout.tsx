import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { versioned } from "@/lib/brand";
import { getSite } from "@/lib/data";
import { fontClassNames } from "@/lib/fonts";
import { SITE_URL, siteSettings } from "@/lib/site";
import "@/styles/globals.css";
import { Providers } from "./providers";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const s = siteSettings(site);
  // Icons are drawn in the active theme's colours; the version makes browsers refetch them after a change.
  const icon = (path: string) => versioned(path, site.theme);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seoTitle, template: `%s · ${s.name}` },
    description: s.seoDescription,
    applicationName: s.name,
    authors: [{ name: site.profile.fullName, url: SITE_URL }],
    creator: site.profile.fullName,
    keywords: s.seoKeywords.length ? s.seoKeywords : undefined,
    alternates: { canonical: SITE_URL, types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
    openGraph: { type: "website", locale: "en_IN", url: SITE_URL, siteName: s.name },
    twitter: { card: "summary_large_image", creator: s.twitterHandle || undefined },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: icon("/brand/favicon.ico"), sizes: "32x32" },
        { url: icon("/brand/logo.svg"), type: "image/svg+xml" },
        { url: icon("/brand/icon-192.png"), sizes: "192x192", type: "image/png" },
      ],
      apple: icon("/brand/apple-touch-icon.png"),
    },
    manifest: "/manifest.webmanifest",
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { theme } = await getSite();
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: theme?.tokens.light.bg ?? "#f8fafc" },
      { media: "(prefers-color-scheme: dark)", color: theme?.tokens.dark.bg ?? "#17181c" },
    ],
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { theme } = await getSite();
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={fontClassNames}>
      <head>
        {/* The theme chosen in Admin → Theme. Its selectors outrank the defaults in globals.css. */}
        {theme && (
          <style
            id="dc-theme"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: the API emits only colour values, and "<" is escaped
            dangerouslySetInnerHTML={{ __html: theme.css.replaceAll("<", "\\3c ") }}
          />
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
