import { ArrowUpRight, Info, Lightbulb, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import {
  type Block,
  type CalloutData,
  type CodeData,
  type CtaData,
  type EmbedData,
  type GalleryData,
  type HeadingData,
  type ImageData,
  type ListData,
  type ParagraphData,
  parseInline,
  type QuoteData,
  type StatsData,
  type TableData,
  youtubeId,
} from "@/lib/blocks";
import { buttonClass } from "./ui";

export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((node, i) => {
        const key = `${node.kind}-${i}`;
        switch (node.kind) {
          case "strong":
            return <strong key={key}>{node.value}</strong>;
          case "em":
            return <em key={key}>{node.value}</em>;
          case "code":
            return <code key={key}>{node.value}</code>;
          case "link":
            return node.href.startsWith("/") ? (
              <Link key={key} href={node.href}>
                {node.value}
              </Link>
            ) : (
              <a key={key} href={node.href} target="_blank" rel="noopener noreferrer">
                {node.value}
              </a>
            );
          default:
            return <Fragment key={key}>{node.value}</Fragment>;
        }
      })}
    </>
  );
}

function Figure({ item, priority }: { item: ImageData; priority?: boolean }) {
  if (!item.url) return null;
  const sized = item.width && item.height;
  return (
    <figure>
      {sized ? (
        <Image
          src={item.url}
          alt={item.alt ?? ""}
          width={item.width}
          height={item.height}
          sizes="(min-width: 768px) 720px, 100vw"
          className="w-full rounded-xl border border-line"
          priority={priority}
        />
      ) : (
        // biome-ignore lint/performance/noImgElement: dimensions unknown for legacy images
        <img
          src={item.url}
          alt={item.alt ?? ""}
          className="w-full rounded-xl border border-line"
          loading="lazy"
        />
      )}
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  );
}

const calloutIcon = { info: Info, tip: Lightbulb, warning: TriangleAlert };
const calloutTone = {
  info: "border-accent/25 bg-accent-soft",
  tip: "border-highlight/30 bg-highlight/10",
  warning: "border-danger/25 bg-danger/10",
};

export type CodeRenderer = (props: { code: string; language: string; filename?: string }) => ReactNode;

export function renderBlock(block: Block, Code: CodeRenderer): ReactNode {
  switch (block.type) {
    case "paragraph": {
      const d = block.data as unknown as ParagraphData;
      return d.text ? (
        <p>
          <Inline text={d.text} />
        </p>
      ) : null;
    }
    case "heading": {
      const d = block.data as unknown as HeadingData;
      const id = d.text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (d.level === 3) return <h3 id={id}>{d.text}</h3>;
      if (d.level === 4) return <h4 id={id}>{d.text}</h4>;
      return <h2 id={id}>{d.text}</h2>;
    }
    case "image":
      return <Figure item={block.data as unknown as ImageData} />;
    case "gallery": {
      const d = block.data as unknown as GalleryData;
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {d.items.map((item) => (
            <Figure key={item.url} item={item} />
          ))}
        </div>
      );
    }
    case "code": {
      const d = block.data as unknown as CodeData;
      return Code({ code: d.code, language: d.language, filename: d.filename });
    }
    case "quote": {
      const d = block.data as unknown as QuoteData;
      return (
        <blockquote>
          {d.text}
          {d.cite && (
            <footer className="mt-3 text-sm font-normal not-italic text-fg-muted">— {d.cite}</footer>
          )}
        </blockquote>
      );
    }
    case "list": {
      const d = block.data as unknown as ListData;
      const items = d.items.filter((i) => i.trim());
      const children = items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable id
        <li key={i}>
          <Inline text={item} />
        </li>
      ));
      return d.style === "ordered" ? <ol>{children}</ol> : <ul>{children}</ul>;
    }
    case "callout": {
      const d = block.data as unknown as CalloutData;
      const Icon = calloutIcon[d.tone] ?? Info;
      return (
        <aside
          className={`flex gap-3 rounded-xl border p-4 text-[0.95rem] ${calloutTone[d.tone] ?? calloutTone.info}`}
        >
          <Icon className="mt-0.5 size-5 shrink-0" />
          <div>
            {d.title && <p className="font-semibold">{d.title}</p>}
            <p className="text-fg-muted">
              <Inline text={d.text} />
            </p>
          </div>
        </aside>
      );
    }
    case "divider":
      return <hr />;
    case "embed": {
      const d = block.data as unknown as EmbedData;
      const id = youtubeId(d.url);
      if (!id) return null;
      return (
        <figure>
          <div className="aspect-video overflow-hidden rounded-xl border border-line bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={d.caption || "YouTube video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
          {d.caption && <figcaption>{d.caption}</figcaption>}
        </figure>
      );
    }
    case "table": {
      const d = block.data as unknown as TableData;
      return (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {d.headers.map((h, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: table columns are positional
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.rows.map((row, r) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: table rows are positional
                <tr key={r}>
                  {row.map((cell, c) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: table cells are positional
                    <td key={c}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "cta": {
      const d = block.data as unknown as CtaData;
      return (
        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          {d.text && <p className="font-medium text-fg">{d.text}</p>}
          <Link
            href={d.href || "/contact"}
            className={buttonClass("primary", "md", "h-11 shrink-0 px-5 no-underline")}
          >
            {d.label} <ArrowUpRight className="size-4" />
          </Link>
        </div>
      );
    }
    case "stats": {
      const d = block.data as unknown as StatsData;
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          {d.items.map((s) => (
            <div key={`${s.label}-${s.value}`} className="card p-5">
              <p className="text-3xl font-semibold tracking-tight text-fg">{s.value}</p>
              <p className="mt-1 text-sm text-fg-muted">{s.label}</p>
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

export function BlocksView({
  blocks,
  className,
  code,
}: {
  blocks: Block[] | undefined;
  className?: string;
  code: CodeRenderer;
}) {
  if (!blocks?.length) return null;
  return (
    <div className={className ?? "rich"}>
      {blocks.map((block) => (
        <div key={block.id} className="contents">
          {renderBlock(block, code)}
        </div>
      ))}
    </div>
  );
}
