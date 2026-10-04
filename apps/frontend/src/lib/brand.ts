import type { ActiveTheme } from "./types";

/**
 * The DC mark: a solid D with a lowercase c cut out of its counter, on a gradient tile.
 * The tile colours come from the active theme (set in the admin); these are the fallbacks
 * used when the API is unreachable, matching the default theme.
 */
export const LOGO_D_PATH = "M18 14h9a18 18 0 0 1 0 36h-9z";
export const LOGO_C_PATH = "M38.36 27.4a6 6 0 1 0 0 9.2";
export const DEFAULT_BRAND = { from: "#4f97c7", to: "#23648e" } as const;

export function brandColors(theme: ActiveTheme | null | undefined) {
  const t = theme?.tokens.light;
  return { from: t?.brandFrom ?? DEFAULT_BRAND.from, to: t?.brandTo ?? DEFAULT_BRAND.to };
}

/** Appends the theme version so browsers and social networks refetch assets after a theme change. */
export function versioned(path: string, theme: ActiveTheme | null | undefined) {
  return theme ? `${path}?v=${theme.version}` : path;
}

/**
 * The mark as a standalone SVG document. `radius` 0 gives a full-bleed square (app icons the OS
 * rounds itself); `scale` shrinks the letter inside the tile (maskable safe zone).
 */
export function logoSvg({
  size = 64,
  from = DEFAULT_BRAND.from,
  to = DEFAULT_BRAND.to,
  radius = 16,
  scale = 1,
}: {
  size?: number;
  from?: string;
  to?: string;
  radius?: number;
  scale?: number;
} = {}) {
  const inset = (64 - 64 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="64" height="64" rx="${radius}" fill="url(#g)"/><g transform="translate(${inset} ${inset}) scale(${scale})"><path d="${LOGO_D_PATH}" fill="#fff"/><path d="${LOGO_C_PATH}" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/></g></svg>`;
}

export const svgDataUrl = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
