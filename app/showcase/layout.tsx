import { Metadata } from "next";

import { siteConfig } from "@/config/site";
import React from "react";

export const metadata: Metadata = {
  description: siteConfig.showcaseDescription,
  keywords: siteConfig.showcaseKeywords,
  authors: [
    {
      name: "Developer Choudhary",
      url: "https://developerchoudhary.com/showcase",
    },
  ],
};

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full">{children}</div>;
}
