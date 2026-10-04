"use client";

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { BLOCK_LABELS, type Block, type BlockType, newBlock } from "@/lib/blocks";
import { cn } from "@/lib/utils";
import { BlockPreview } from "./block-preview";
import { ImagePicker, type PickedImage } from "./media-library";

type Data = Record<string, unknown>;

interface Props {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}

const languages = [
  "ts",
  "tsx",
  "js",
  "go",
  "sql",
  "bash",
  "yaml",
  "json",
  "html",
  "css",
  "python",
  "java",
  "dockerfile",
  "text",
];

export function BlockEditor({ value, onChange }: Props) {
  const [preview, setPreview] = useState(false);

  const update = (id: string, data: Data) =>
    onChange(value.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...data } } : b)));
  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    onChange(next);
  };
  const duplicate = (index: number) => {
    const src = value[index];
    if (!src) return;
    const copy = { ...newBlock(src.type), data: JSON.parse(JSON.stringify(src.data)) as Data };
    onChange([...value.slice(0, index + 1), copy, ...value.slice(index + 1)]);
  };
  const add = (type: BlockType, after?: number) => {
    const block = newBlock(type);
    if (after === undefined) onChange([...value, block]);
    else onChange([...value.slice(0, after + 1), block, ...value.slice(after + 1)]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">
          {value.length} block{value.length === 1 ? "" : "s"} · supports **bold**, _italic_, `code` and
          [links](url) inside text
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={() => setPreview((p) => !p)}>
          {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{" "}
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>
      {preview ? (
        <div className="card p-6 sm:p-10">
          <BlockPreview blocks={value} />
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((block, i) => (
            <div key={block.id} className="card">
              <div className="flex items-center justify-between border-b border-line px-3 py-2">
                <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
                  {BLOCK_LABELS[block.type]}
                </span>
                <div className="flex items-center gap-0.5">
                  <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="size-3.5" />
                  </IconButton>
                  <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                    <ArrowDown className="size-3.5" />
                  </IconButton>
                  <IconButton label="Duplicate" onClick={() => duplicate(i)}>
                    <Copy className="size-3.5" />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => remove(block.id)} className="hover:text-danger">
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </div>
              </div>
              <div className="p-3">
                <BlockFields block={block} onChange={(data) => update(block.id, data)} />
              </div>
              <AddMenu onAdd={(type) => add(type, i)} compact />
            </div>
          ))}
          {value.length === 0 && (
            <div className="card p-8 text-center text-sm text-fg-muted">
              Start with a paragraph or heading.
            </div>
          )}
          <AddMenu onAdd={(type) => add(type)} />
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-1.5 text-fg-subtle hover:bg-bg-muted hover:text-fg disabled:opacity-30",
        className,
      )}
    >
      {children}
    </button>
  );
}

function AddMenu({ onAdd, compact }: { onAdd: (type: BlockType) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const types = Object.keys(BLOCK_LABELS) as BlockType[];
  return (
    <div className={cn("relative flex justify-center", compact ? "-mb-3 translate-y-1/2" : "")}>
      {open ? (
        <div className="z-10 flex flex-wrap justify-center gap-1.5 rounded-xl border border-line bg-bg-elevated p-2 shadow-lift">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onAdd(t);
                setOpen(false);
              }}
              className="rounded-md border border-line px-2.5 py-1 text-xs hover:bg-bg-muted"
            >
              {BLOCK_LABELS[t]}
            </button>
          ))}
          <button type="button" onClick={() => setOpen(false)} className="px-2 text-xs text-fg-subtle">
            Close
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-line bg-bg-elevated text-fg-muted hover:text-fg",
            compact ? "size-7 justify-center" : "h-10 px-4 text-sm",
          )}
        >
          <Plus className="size-4" /> {!compact && "Add block"}
        </button>
      )}
    </div>
  );
}

function BlockFields({ block, onChange }: { block: Block; onChange: (data: Data) => void }) {
  const d = block.data as Data;
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  const arr = (k: string) => (Array.isArray(d[k]) ? (d[k] as unknown[]) : []);

  switch (block.type) {
    case "paragraph":
      return (
        <Textarea
          rows={4}
          value={str("text")}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Write a paragraph…"
        />
      );
    case "heading":
      return (
        <div className="flex gap-2">
          <Select
            className="w-24"
            value={String(d.level ?? 2)}
            onChange={(e) => onChange({ level: Number(e.target.value) })}
          >
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
          </Select>
          <Input
            value={str("text")}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Heading text"
          />
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <ImagePicker
            label="Image"
            value={
              str("url")
                ? {
                    fileId: str("fileId"),
                    url: str("url"),
                    alt: str("alt"),
                    width: d.width as number | undefined,
                    height: d.height as number | undefined,
                  }
                : null
            }
            onChange={(img: PickedImage | null) =>
              onChange(
                img
                  ? {
                      fileId: img.fileId,
                      url: img.url,
                      alt: img.alt,
                      width: img.width ?? undefined,
                      height: img.height ?? undefined,
                    }
                  : { fileId: "", url: "", alt: "" },
              )
            }
          />
          <Input
            value={str("caption")}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Caption (optional)"
          />
        </div>
      );
    case "gallery": {
      const items = arr("items") as Array<{
        fileId?: string;
        url: string;
        alt?: string;
        caption?: string;
        width?: number;
        height?: number;
      }>;
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.url || i} className="flex items-start gap-2">
              <div className="flex-1">
                <ImagePicker
                  label={`Image ${i + 1}`}
                  value={
                    item.url
                      ? {
                          fileId: item.fileId ?? "",
                          url: item.url,
                          alt: item.alt ?? "",
                          width: item.width,
                          height: item.height,
                        }
                      : null
                  }
                  onChange={(img) =>
                    onChange({
                      items: items.map((it, j) =>
                        j === i
                          ? img
                            ? {
                                ...it,
                                fileId: img.fileId,
                                url: img.url,
                                alt: img.alt,
                                width: img.width ?? undefined,
                                height: img.height ?? undefined,
                              }
                            : { ...it, url: "" }
                          : it,
                      ),
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ items: items.filter((_, j) => j !== i) })}
                className="mt-7 rounded-md p-1.5 text-fg-subtle hover:text-danger"
                aria-label="Remove image"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange({ items: [...items, { url: "" }] })}
          >
            <Plus className="size-4" /> Add image
          </Button>
        </div>
      );
    }
    case "code":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select
              className="w-36"
              value={str("language") || "ts"}
              onChange={(e) => onChange({ language: e.target.value })}
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
            <Input
              value={str("filename")}
              onChange={(e) => onChange({ filename: e.target.value })}
              placeholder="filename.ts (optional)"
            />
          </div>
          <Textarea
            rows={8}
            className="font-mono text-xs"
            value={str("code")}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="// code"
            spellCheck={false}
          />
        </div>
      );
    case "quote":
      return (
        <div className="space-y-2">
          <Textarea
            rows={3}
            value={str("text")}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Quote"
          />
          <Input
            value={str("cite")}
            onChange={(e) => onChange({ cite: e.target.value })}
            placeholder="Who said it (optional)"
          />
        </div>
      );
    case "list": {
      const items = arr("items").filter((x): x is string => typeof x === "string");
      return (
        <div className="space-y-2">
          <Select
            className="w-40"
            value={str("style") || "unordered"}
            onChange={(e) => onChange({ style: e.target.value })}
          >
            <option value="unordered">Bulleted</option>
            <option value="ordered">Numbered</option>
          </Select>
          <Textarea
            rows={5}
            value={items.join("\n")}
            onChange={(e) => onChange({ items: e.target.value.split("\n") })}
            placeholder="One item per line"
          />
        </div>
      );
    }
    case "callout":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select
              className="w-36"
              value={str("tone") || "info"}
              onChange={(e) => onChange({ tone: e.target.value })}
            >
              <option value="info">Info</option>
              <option value="tip">Tip</option>
              <option value="warning">Warning</option>
            </Select>
            <Input
              value={str("title")}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Title (optional)"
            />
          </div>
          <Textarea
            rows={3}
            value={str("text")}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Callout text"
          />
        </div>
      );
    case "divider":
      return <p className="text-center text-xs text-fg-subtle">— horizontal rule —</p>;
    case "embed":
      return (
        <div className="space-y-2">
          <Input
            value={str("url")}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <Input
            value={str("caption")}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Caption (optional)"
          />
        </div>
      );
    case "table": {
      const headers = arr("headers").filter((x): x is string => typeof x === "string");
      const rows = arr("rows").filter((r): r is string[] => Array.isArray(r));
      return (
        <div className="space-y-2">
          <Field label="Headers" hint="comma separated">
            <Input
              value={headers.join(", ")}
              onChange={(e) => onChange({ headers: e.target.value.split(",").map((h) => h.trim()) })}
            />
          </Field>
          <Field label="Rows" hint="one row per line, cells separated by |">
            <Textarea
              rows={5}
              className="font-mono text-xs"
              value={rows.map((r) => r.join(" | ")).join("\n")}
              onChange={(e) =>
                onChange({
                  rows: e.target.value.split("\n").map((line) => line.split("|").map((c) => c.trim())),
                })
              }
            />
          </Field>
        </div>
      );
    }
    case "cta":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={str("label")}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Button label"
          />
          <Input
            value={str("href")}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder="/contact"
          />
          <Input
            className="sm:col-span-2"
            value={str("text")}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Supporting sentence (optional)"
          />
        </div>
      );
    case "stats": {
      const items = arr("items") as Array<{ label: string; value: string }>;
      return (
        <div className="space-y-2">
          {items.map((it, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional rows
            <div key={i} className="flex gap-2">
              <Input
                value={it.value}
                onChange={(e) =>
                  onChange({ items: items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })
                }
                placeholder="40%"
              />
              <Input
                value={it.label}
                onChange={(e) =>
                  onChange({ items: items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })
                }
                placeholder="Faster page loads"
              />
              <button
                type="button"
                onClick={() => onChange({ items: items.filter((_, j) => j !== i) })}
                className="rounded-md p-1.5 text-fg-subtle hover:text-danger"
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange({ items: [...items, { label: "", value: "" }] })}
          >
            <Plus className="size-4" /> Add stat
          </Button>
        </div>
      );
    }
    default:
      return null;
  }
}
