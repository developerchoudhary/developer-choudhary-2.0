import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

/** Bricolage Grotesque (variable) carries headlines; Geist handles text and code. */
export const display = localFont({
  src: [{ path: "../fonts/BricolageGrotesque-Variable.ttf", weight: "200 800", style: "normal" }],
  variable: "--font-display",
  display: "swap",
});

export const fontClassNames = `${GeistSans.variable} ${GeistMono.variable} ${display.variable}`;
