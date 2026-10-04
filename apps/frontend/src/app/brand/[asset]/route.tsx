import { ImageResponse } from "next/og";
import { brandColors, logoSvg, svgDataUrl } from "@/lib/brand";
import { getSite } from "@/lib/data";

// Favicon, app icons and the logo follow the theme chosen in the admin, so they are rendered on
// request (pages link them with ?v=<theme version>, so browsers refetch after a theme change).
export const dynamic = "force-dynamic";

type Png = { size: number; radius: number; scale: number };

const PNGS = new Map<string, Png>([
  ["icon-192.png", { size: 192, radius: 16, scale: 1 }],
  ["icon-512.png", { size: 512, radius: 16, scale: 1 }],
  // Full bleed: Android crops maskable icons to its own shape, and iOS rounds touch icons itself.
  ["icon-maskable.png", { size: 512, radius: 0, scale: 0.8 }],
  ["apple-touch-icon.png", { size: 180, radius: 0, scale: 1 }],
]);

const FAVICON_SIZES = [16, 32, 48];

// Rendered images by asset and colours; a handful of themes at most, so a small map is enough.
const rendered = new Map<string, Buffer>();

async function png({ from, to }: { from: string; to: string }, { size, radius, scale }: Png) {
  const key = `${size}/${radius}/${scale}/${from}/${to}`;
  const hit = rendered.get(key);
  if (hit) return hit;
  const svg = logoSvg({ size, from, to, radius, scale });
  const res = new ImageResponse(
    // biome-ignore lint/performance/noImgElement: rendered by the image engine, not the browser
    <img src={svgDataUrl(svg)} width={size} height={size} alt="" />,
    { width: size, height: size },
  );
  const out = Buffer.from(await res.arrayBuffer());
  if (rendered.size > 64) rendered.clear();
  rendered.set(key, out);
  return out;
}

/** An .ico file holding PNG images, which every current browser reads. */
function ico(images: Array<{ size: number; data: Buffer }>) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry); // width
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1); // height
    header.writeUInt8(0, entry + 2); // palette colours
    header.writeUInt8(0, entry + 3); // reserved
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

export async function GET(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const spec = PNGS.get(asset);
  if (!spec && asset !== "favicon.ico" && asset !== "logo.svg") {
    return new Response("Not found", { status: 404 });
  }
  const colors = brandColors((await getSite()).theme);
  // A versioned URL always means the same picture; a bare one (/favicon.ico) can change with the theme.
  const cache = new URL(request.url).searchParams.has("v")
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600";

  if (spec) {
    return new Response(new Uint8Array(await png(colors, spec)), {
      headers: { "Content-Type": "image/png", "Cache-Control": cache },
    });
  }
  if (asset === "logo.svg") {
    return new Response(logoSvg({ size: 64, ...colors }), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": cache },
    });
  }
  const images = await Promise.all(
    FAVICON_SIZES.map(async (size) => ({ size, data: await png(colors, { size, radius: 14, scale: 1 }) })),
  );
  return new Response(new Uint8Array(ico(images)), {
    headers: { "Content-Type": "image/x-icon", "Cache-Control": cache },
  });
}
