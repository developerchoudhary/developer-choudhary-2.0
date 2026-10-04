import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

/** Inter (variable, Latin subset with the optical-size axis) for all text; Geist Mono for code. */
export const inter = localFont({
  src: [{ path: "../fonts/InterVariable-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
});

export const fontClassNames = `${inter.variable} ${GeistMono.variable}`;
