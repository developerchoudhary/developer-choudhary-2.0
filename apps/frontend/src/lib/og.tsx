import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brandColors, logoSvg, svgDataUrl } from "./brand";
import { SITE_URL, siteSettings } from "./site";
import type { ActiveTheme, SiteBundle, ThemeTokens } from "./types";

export const OG_SIZE = { width: 1200, height: 630 };

// Static Latin subsets of Inter (the share-image renderer cannot read the variable woff2).
// Literal paths, so the standalone build traces and ships the files.
const fonts = Promise.all([
  readFile(join(process.cwd(), "src/fonts/InterDisplay-SemiBold-latin.ttf")),
  readFile(join(process.cwd(), "src/fonts/Inter-Medium-latin.ttf")),
]).then(([display, text]) => [
  { name: "Inter Display", data: display, weight: 600 as const, style: "normal" as const },
  { name: "Inter", data: text, weight: 500 as const, style: "normal" as const },
]);

// The photo as a transparent cut-out (framed like the site's portrait) for the default card.
const portrait = readFile(join(process.cwd(), "src/assets/portrait-share.png")).then(
  (data) => `data:image/png;base64,${data.toString("base64")}`,
);

type CardColors = Pick<
  ThemeTokens,
  | "canvas"
  | "fg"
  | "fgMuted"
  | "fgSubtle"
  | "accent"
  | "highlight"
  | "brandFrom"
  | "brandTo"
  | "frame"
  | "photoFrom"
  | "photoTo"
  | "photoGlow"
>;

// The default theme (Powder) in light mode, for when the API cannot be reached.
const FALLBACK: CardColors = {
  canvas: "linear-gradient(135deg, #f8fafc 0%, #eff3f8 55%, #e6ecf4 100%)",
  fg: "#0f172a",
  fgMuted: "#475569",
  fgSubtle: "#5a6779",
  accent: "#23648e",
  highlight: "#c86a05",
  brandFrom: "#4f97c7",
  brandTo: "#23648e",
  frame: "#d9edf9",
  photoFrom: "#eef7fc",
  photoTo: "#c4e4f6",
  photoGlow: "rgb(137 201 237 / 0.3)",
};

/** Share cards always use the light mode of the active theme: it reads best in feeds. */
const cardColors = (theme: ActiveTheme | null): CardColors => theme?.tokens.light ?? FALLBACK;

const DOMAIN = new URL(SITE_URL).host.replace(/^www\./, "");

/** Cache headers: a versioned URL (?v=<theme version>) never changes, a bare one may. */
export function shareCacheControl(request: Request) {
  return new URL(request.url).searchParams.has("v")
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600";
}

/** The same colour fully transparent: the renderer blends gradients towards `transparent` as black. */
const clear = (color: string) => color.replace(/\/\s*[\d.]+\)$/, "/ 0)");

/** The opening statement of a bio, up to its first colon or full stop, short enough for a card. */
function lede(text: string) {
  const first = text.trim().split(/(?<=[.!?])\s/)[0] ?? "";
  const head = (first.split(/[:;]\s/)[0] ?? "").replace(/[\s,.;:–-]+$/, "");
  return clip(/[!?]$/.test(head) ? head : `${head}.`, 110);
}

/** Shortens text to at most `max` characters, at a word boundary, with an ellipsis. */
export function clip(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max / 2)).replace(/[\s,.;:–-]+$/, "")}…`;
}

function TopBar({ c }: { c: CardColors }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        background: `linear-gradient(90deg, ${c.brandFrom}, ${c.brandTo})`,
      }}
    />
  );
}

function Brand({ c, theme, name }: { c: CardColors; theme: ActiveTheme | null; name: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 27, color: c.fgMuted }}>
      {/* biome-ignore lint/performance/noImgElement: rendered by the share-image engine, not the browser */}
      <img src={svgDataUrl(logoSvg({ size: 52, ...brandColors(theme) }))} width={52} height={52} alt="" />
      {name}
    </div>
  );
}

/** A 1200×630 share card in the active theme: brand row, kicker, title, subtitle, footer. */
export async function shareCard({
  theme,
  siteName,
  kicker,
  title,
  subtitle,
  footer,
}: {
  theme: ActiveTheme | null;
  siteName: string;
  kicker: string;
  title: string;
  subtitle?: string;
  footer: string;
}) {
  const c = cardColors(theme);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: c.canvas,
        color: c.fg,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <TopBar c={c} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Brand c={c} theme={theme} name={siteName} />
        <div style={{ fontSize: 22, color: c.accent, textTransform: "uppercase", letterSpacing: 3 }}>
          {kicker}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1000 }}>
        <div
          style={{
            fontFamily: "Inter Display",
            fontSize: title.length > 48 ? 60 : 72,
            lineHeight: 1.06,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 30, lineHeight: 1.35, color: c.fgMuted }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: c.fgSubtle }}>
        <span>{footer}</span>
        <span>{DOMAIN}</span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts },
  );
}

/**
 * The site-wide share card (/og-image.png): the hero of the home page — greeting, name, role,
 * short bio — beside the photo in its leaf frame, all in the active theme's colours.
 */
export async function defaultShareCard(site: SiteBundle, headers?: HeadersInit) {
  const c = cardColors(site.theme);
  const { profile } = site;
  const role = profile.headline.replace(/[.!\s]+$/, "");
  const name = profile.fullName.split(/\s+/).filter(Boolean);
  const greeting = [
    { text: "Hi,", accent: false },
    { text: "I'm", accent: false },
    ...name.map((text, i) => ({ text: i === name.length - 1 ? `${text},` : text, accent: true })),
  ];
  const leaf = "64px 0 128px 0";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: c.canvas,
        color: c.fg,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <TopBar c={c} />
      <div style={{ position: "absolute", left: 72, top: 64, display: "flex" }}>
        <Brand c={c} theme={site.theme} name={siteSettings(site).name} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 186,
          width: 650,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter Display",
            fontSize: role.length > 26 ? 60 : 68,
            lineHeight: 1.06,
            letterSpacing: -2,
          }}
        >
          {/* One item per word so the greeting wraps between words, like the hero. */}
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.25em" }}>
            {greeting.map((w, i) => (
              <span key={`${i}-${w.text}`} style={{ color: w.accent ? c.accent : c.fg }}>
                {w.text}
              </span>
            ))}
          </div>
          {role && <div style={{ color: c.highlight, marginTop: 6 }}>{`${role}.`}</div>}
        </div>
        {profile.bioShort && (
          <div style={{ marginTop: 28, fontSize: 27, lineHeight: 1.4, color: c.fgMuted }}>
            {lede(profile.bioShort)}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 72, bottom: 56, fontSize: 22, color: c.fgSubtle }}>
        {DOMAIN}
      </div>
      <div style={{ position: "absolute", right: 72, top: 104, width: 352, height: 440, display: "flex" }}>
        <div
          style={{
            position: "absolute",
            left: -18,
            top: -18,
            width: 352,
            height: 440,
            borderRadius: leaf,
            background: c.frame,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 352,
            height: 440,
            display: "flex",
            overflow: "hidden",
            borderRadius: leaf,
            // Same studio backdrop as .photo-backdrop in globals.css.
            backgroundImage: `radial-gradient(60.7% 48.5% at 95% 94.7%, ${c.photoGlow}, ${clear(c.photoGlow)}), radial-gradient(77.3% 61.9% at 53.3% 34.7%, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0)), linear-gradient(to bottom left, ${c.photoFrom}, ${c.photoTo})`,
            boxShadow: "0 30px 60px -30px rgba(15, 23, 42, 0.35)",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: rendered by the share-image engine, not the browser */}
          <img src={await portrait} width={352} height={440} alt="" />
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts, headers },
  );
}
