"use client";

import { Plus, Trash2, X } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const statusTone: Record<string, "neutral" | "accent" | "highlight" | "success" | "danger" | "muted"> = {
  new: "accent",
  contacted: "highlight",
  qualified: "highlight",
  proposal: "highlight",
  won: "success",
  lost: "muted",
  spam: "danger",
  pending: "highlight",
  approved: "success",
  rejected: "danger",
  draft: "muted",
  scheduled: "highlight",
  published: "success",
  archived: "muted",
  high: "danger",
  normal: "neutral",
  low: "muted",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={statusTone[value] ?? "neutral"}>{value}</Badge>;
}

export function ConfirmButton({
  onConfirm,
  label = "Delete",
  confirmLabel = "Confirm delete",
  className,
  pending,
}: {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  className?: string;
  pending?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-danger", className)}
        onClick={() => setArmed(true)}
      >
        <Trash2 className="size-4" /> {label}
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Button type="button" variant="danger" size="sm" loading={pending} onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  );
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  suggestions = [],
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s));
    if (items.length) onChange([...value, ...items]);
    setDraft("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  const remaining = suggestions
    .filter((s) => !value.includes(s) && s.toLowerCase().includes(draft.toLowerCase()))
    .slice(0, 8);
  return (
    <div className="rounded-xl border border-line bg-bg-elevated p-2 focus-within:border-accent">
      <div className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md bg-bg-muted px-2 py-1 text-xs">
            {v}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              className="text-fg-subtle hover:text-fg"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm focus:outline-none"
        />
      </div>
      {draft && remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-md border border-line px-2 py-0.5 text-xs text-fg-muted hover:text-fg"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LinesInput({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Textarea
      rows={rows}
      value={value.join("\n")}
      placeholder={placeholder ?? "One item per line"}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      onBlur={() => onChange(value.map((v) => v.trim()).filter(Boolean))}
    />
  );
}

interface RepeatableProps<T> {
  value: T[];
  onChange: (v: T[]) => void;
  blank: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel?: string;
  max?: number;
}

export function Repeatable<T>({
  value,
  onChange,
  blank,
  render,
  addLabel = "Add item",
  max = 30,
}: RepeatableProps<T>) {
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional editor rows
        <div key={i} className="flex gap-2 rounded-xl border border-line p-3">
          <div className="flex-1 space-y-2">
            {render(item, (patch) => onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v))))}
          </div>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="self-start rounded-lg p-1.5 text-fg-subtle hover:text-danger"
            aria-label="Remove"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      {value.length < max && (
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, blank()])}>
          <Plus className="size-4" /> {addLabel}
        </Button>
      )}
    </div>
  );
}

export function SeoFields({
  title,
  description,
  onTitle,
  onDescription,
  canonical,
  onCanonical,
}: {
  title: string;
  description: string;
  onTitle: (v: string) => void;
  onDescription: (v: string) => void;
  canonical?: string;
  onCanonical?: (v: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field label="SEO title" hint={`${title.length}/70`}>
        <Input
          value={title}
          maxLength={70}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Defaults to the title"
        />
      </Field>
      <Field label="SEO description" hint={`${description.length}/170`}>
        <Textarea
          rows={3}
          value={description}
          maxLength={170}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Defaults to the summary"
        />
      </Field>
      {onCanonical && (
        <Field label="Canonical URL" hint="only if republished from elsewhere">
          <Input
            value={canonical ?? ""}
            onChange={(e) => onCanonical(e.target.value)}
            placeholder="https://"
          />
        </Field>
      )}
    </div>
  );
}

export function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-fg-subtle">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}

export function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(local: string) {
  return local ? new Date(local).toISOString() : undefined;
}
