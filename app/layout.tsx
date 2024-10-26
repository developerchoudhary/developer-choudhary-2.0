import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import FloatingNavbar from "@/components/FloatingNavbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
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
          <div className="relative flex flex-col scrollbar-hide h-[100dvh]">
            <header className="z-10 flex md:justify-center w-full justify-start absolute md:top-14 bottom-5 p-4">
              <FloatingNavbar />
            </header>
            <main className="w-full h-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
