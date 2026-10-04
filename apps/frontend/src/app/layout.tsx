import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontClassNames } from "@/lib/fonts";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · Websites, ERP & CRM development`, template: `%s · ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Aman Choudhary", url: SITE_URL }],
  creator: "Aman Choudhary",
  keywords: [
    "web developer India",
    "Next.js developer",
    "Golang developer",
    "ERP development",
    "CRM development",
    "full stack developer",
  ],
  alternates: { canonical: SITE_URL, types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
  openGraph: { type: "website", locale: "en_IN", url: SITE_URL, siteName: SITE_NAME },
  twitter: { card: "summary_large_image", creator: "@developer_jaat" },
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
  icons: { icon: "/favicon.ico", apple: "/icon.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e12" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontClassNames}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
