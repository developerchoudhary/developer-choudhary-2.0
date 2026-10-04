import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · Aman Choudhary`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f0",
    theme_color: "#0e7c66",
    icons: [{ src: "/icon.png", sizes: "340x431", type: "image/png" }],
    categories: ["business", "technology", "productivity"],
    lang: "en",
  };
}
