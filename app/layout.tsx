import "@/styles/globals.css";
import { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "./providers";
import React from "react";

// Define site-wide metadata for SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL("https://developerchoudhary.com"),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  keywords: siteConfig.keywords,
  authors: [{ name: "Amandeep Kumar", url: "https://developerchoudhary.com" }],
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://developerchoudhary.com/",
    languages: {
      "en-US": "/en-US",
      "de-DE": "/de-DE",
    },
  },
  openGraph: {
    title: siteConfig.name,
    description:
      "A skilled website developer specializing in Next.js and modern web technologies. Check out innovative projects, seamless UI designs, and dynamic web solutions.",
    url: "https://developerchoudhary.com",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@developer_jaat",
    title: siteConfig.name,
    description:
      "A skilled website developer specializing in Next.js and modern web technologies. Check out innovative projects, seamless UI designs, and dynamic web solutions.",
    images: ["/og-image.jpg"],
    creator: "@developer_jaat",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "og:locale": "en_US",
    "og:type": "website",
    "geo.region": "IN-RJ", // Rajasthan, India
    "geo.placename": "Sri Ganganagar",
  },
};

// Define viewport settings for responsive behavior
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// Root layout component to structure the entire application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className="bg-background font-sans antialiased scroll-smooth">
        {/* Theme provider for global styling and theme management */}
        <Providers themeProps={{ attribute: "class", defaultTheme: "system" }}>
          <div className="h-screen min-h-screen overflow-y-auto overflow-x-hidden z-10 max-h-fit relative flex justify-between flex-col">
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
        {/* Background effects */}
        <StarsBackground />
        <ShootingStars />
        {/* Analytics tracking */}
        <Analytics />
      </body>
    </html>
  );
}
