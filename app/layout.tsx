import "@/styles/globals.css";
import { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import Footer from "@/components/Footer";

import { Providers } from "./providers";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  keywords: siteConfig.keywords,
  authors: [
    { name: "Developer Choudhary", url: "https://developerchoudhary.com" },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className="bg-background font-sans antialiased scroll-smooth">
        <Providers themeProps={{ attribute: "class", defaultTheme: "system" }}>
          <div className="h-[100dvh] min-h-[100dvh] overflow-y-auto overflow-x-hidden z-10 max-h-fit relative flex justify-between flex-col">
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
        <StarsBackground />
        <ShootingStars />
      </body>
    </html>
  );
}
