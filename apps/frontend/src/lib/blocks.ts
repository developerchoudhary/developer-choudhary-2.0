export type BlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "gallery"
  | "code"
  | "quote"
  | "list"
  | "callout"
  | "divider"
  | "embed"
  | "table"
  | "cta"
  | "stats";

export interface Block<T = Record<string, unknown>> {
  id: string;
  type: BlockType;
  data: T;
}

export interface ParagraphData {
  text: string;
}
export interface HeadingData {
  level: 2 | 3 | 4;
  text: string;
}
export interface ImageData {
  fileId?: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}
export interface GalleryData {
  items: ImageData[];
}
export interface CodeData {
  language: string;
  code: string;
  filename?: string;
}
export interface QuoteData {
  text: string;
  cite?: string;
}
export interface ListData {
  style: "ordered" | "unordered";
  items: string[];
}
export interface CalloutData {
  tone: "info" | "tip" | "warning";
  title?: string;
  text: string;
}
export interface EmbedData {
  provider: "youtube";
  url: string;
  caption?: string;
}
export interface TableData {
  headers: string[];
  rows: string[][];
}
export interface CtaData {
  label: string;
  href: string;
  text?: string;
}
export interface StatsData {
  items: Array<{ label: string; value: string }>;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  image: "Image",
  gallery: "Gallery",
  code: "Code",
  quote: "Quote",
  list: "List",
  callout: "Callout",
  divider: "Divider",
  embed: "YouTube embed",
  table: "Table",
  cta: "Call to action",
  stats: "Stats row",
};

export function newBlock(type: BlockType): Block {
  const id = `b_${Math.random().toString(36).slice(2, 10)}`;
  const data: Record<BlockType, Record<string, unknown>> = {
    paragraph: { text: "" },
    heading: { level: 2, text: "" },
    image: { url: "", alt: "", caption: "" },
    gallery: { items: [] },
    code: { language: "ts", code: "", filename: "" },
    quote: { text: "", cite: "" },
    list: { style: "unordered", items: [""] },
    callout: { tone: "info", title: "", text: "" },
    divider: {},
    embed: { provider: "youtube", url: "", caption: "" },
    table: { headers: ["Column 1", "Column 2"], rows: [["", ""]] },
    cta: { label: "Start a project", href: "/contact", text: "" },
    stats: { items: [{ label: "", value: "" }] },
  };
  return { id, type, data: data[type] };
}

export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      const d = b.data as Record<string, unknown>;
      if (typeof d.text === "string") return d.text;
      if (Array.isArray(d.items))
        return (d.items as unknown[]).filter((i) => typeof i === "string").join(" ");
      return "";
    })
    .join(" ");
}

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

const inlinePattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|_[^_]+_)/g;

export type InlineNode =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "code"; value: string }
  | { kind: "em"; value: string }
  | { kind: "link"; value: string; href: string };

export function parseInline(text: string): InlineNode[] {
  const out: InlineNode[] = [];
  let last = 0;
  for (const m of text.matchAll(inlinePattern)) {
    const token = m[0];
    const index = m.index ?? 0;
    if (index > last) out.push({ kind: "text", value: text.slice(last, index) });
    if (token.startsWith("**")) out.push({ kind: "strong", value: token.slice(2, -2) });
    else if (token.startsWith("`")) out.push({ kind: "code", value: token.slice(1, -1) });
    else if (token.startsWith("[")) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) out.push({ kind: "link", value: link[1] ?? "", href: link[2] ?? "#" });
    } else out.push({ kind: "em", value: token.slice(1, -1) });
    last = index + token.length;
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
  return out;
}
