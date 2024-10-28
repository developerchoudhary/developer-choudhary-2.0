import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import FloatingNavbar from "@/components/FloatingNavbar";
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
      <body
        className={clsx(
          "overflow-x-hidden scrollbar-hide bg-background font-sans antialiased scroll-smooth",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex h-full w-full flex-col scrollbar-hide">
            <header className="z-20 flex w-full justify-start absolute top-4 p-4">
              <FloatingNavbar />
            </header>
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
        <ShootingStars />
        <StarsBackground />
      </body>
    </html>
  );
}
