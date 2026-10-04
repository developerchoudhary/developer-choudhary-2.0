"use client";

import { AlertTriangle, Copy, Monitor, Moon, Pencil, Plus, Smartphone, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { type PreviewDevice, type PreviewMode, SitePreview } from "@/components/admin/site-preview";
import { LogoMark } from "@/components/site/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAction, useOne } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type {
  ActiveTheme,
  ThemeDefinition,
  ThemeIssue,
  ThemeItem,
  ThemeList,
  ThemeModeColors,
  ThemePreview,
  ThemeSurface,
  ThemeTokens,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGES = [
  { path: "/", label: "Home" },
  { path: "/work", label: "Work" },
  { path: "/services", label: "Services" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/blog", label: "Blog" },
];

const HEX = /^#[0-9a-f]{6}$/i;

type Editing = { id: string | null; draft: ThemeDefinition };

function definitionOf(t: ThemeItem): ThemeDefinition {
  return {
    name: t.name,
    description: t.description,
    surface: t.surface,
    logoFrom: t.logoFrom,
    logoTo: t.logoTo,
    backdrop: t.backdrop,
    light: { ...t.light },
    dark: { ...t.dark },
  };
}

/**
 * Shows the new theme in this admin tab straight away (the page itself still has the old theme's
 * CSS until it reloads), including the favicon.
 */
function applyHere(theme: Pick<ActiveTheme, "css" | "version">) {
  let style = document.getElementById("dc-theme-live");
  if (!style) {
    style = document.createElement("style");
    style.id = "dc-theme-live";
    document.head.append(style);
  }
  style.textContent = theme.css;
  for (const link of document.querySelectorAll<HTMLLinkElement>(
    'link[rel~="icon"], link[rel="apple-touch-icon"]',
  )) {
    const url = new URL(link.href);
    if (!url.pathname.startsWith("/brand/")) continue;
    url.searchParams.set("v", theme.version);
    link.href = url.toString();
  }
}

/**
 * Pick the colours of the public site. Every theme can be tried on the real pages before it goes
 * live; built-in themes are fixed, and duplicating one gives a custom theme you can edit.
 * The theme also colours emails, résumé PDFs, the favicon and app icons, and share images.
 */
export default function ThemePage() {
  const { data, isLoading } = useOne<ThemeList>("/themes");
  const { resolvedTheme } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [preview, setPreview] = useState<ThemePreview | null>(null);
  const [mode, setMode] = useState<PreviewMode>("light");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [page, setPage] = useState("/");

  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") setMode(resolvedTheme);
  }, [resolvedTheme]);

  const themes = data?.themes ?? [];
  const current = themes.find((t) => t.slug === (selected ?? data?.active)) ?? themes[0];

  // Live check of the theme being edited: readability problems and the CSS for the preview.
  useEffect(() => {
    if (!editing) {
      setPreview(null);
      return;
    }
    let stale = false;
    const id = window.setTimeout(() => {
      admin
        .post<ThemePreview>("/themes/preview", editing.draft)
        .then((p) => !stale && setPreview(p))
        .catch(() => {});
    }, 200);
    return () => {
      stale = true;
      window.clearTimeout(id);
    };
  }, [editing]);

  const activate = useAction((slug: string) => admin.put<ActiveTheme>("/themes/active", { slug }), {
    invalidate: ["/themes"],
    onSuccess: (active) => {
      applyHere(active);
      toast.success(`${active.name} is now live on the site.`);
    },
  });
  const save = useAction(
    (e: Editing) =>
      e.id ? admin.put<ThemeItem>(`/themes/${e.id}`, e.draft) : admin.post<ThemeItem>("/themes", e.draft),
    {
      invalidate: ["/themes"],
      onSuccess: (saved) => {
        if (saved.active) applyHere(saved);
        setSelected(saved.slug);
        setEditing(null);
        toast.success(saved.active ? "Theme saved and live on the site." : "Theme saved.");
      },
    },
  );
  const remove = useAction((id: string) => admin.delete(`/themes/${id}`), {
    invalidate: ["/themes"],
    success: "Theme deleted",
    onSuccess: () => setSelected(null),
  });

  if (isLoading || !data || !current) return <Skeleton className="h-[640px]" />;

  const startFrom = (t: ThemeItem, name: string) =>
    setEditing({ id: null, draft: { ...definitionOf(t), name: name.slice(0, 40) } });
  const css = editing ? (preview?.css ?? current.css) : current.css;
  const issues = editing ? (preview?.issues ?? []) : [];

  return (
    <>
      <PageHeader
        title="Theme"
        description="Colours of the public site, emails, résumé PDFs, favicon and share images. Pick a theme to try it on the real pages; the site changes only when you choose “Use this theme”."
        actions={
          !editing && (
            <Button type="button" onClick={() => startFrom(current, "My theme")}>
              <Plus className="size-4" /> New theme
            </Button>
          )
        }
      />
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
        <section className="card sticky top-24 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="truncate font-medium">
                {editing ? editing.draft.name || "Untitled" : current.name}
              </span>
              {!editing && current.active && (
                <Badge tone="success" dot>
                  Live
                </Badge>
              )}
              {editing && <Badge tone="warning">Unsaved</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={page}
                onChange={(e) => setPage(e.target.value)}
                className="h-9 w-32 py-1.5"
                aria-label="Page to preview"
              >
                {PAGES.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.label}
                  </option>
                ))}
              </Select>
              <IconToggle
                value={device}
                onChange={setDevice}
                options={[
                  { value: "desktop", label: "Desktop", icon: <Monitor className="size-4" /> },
                  { value: "mobile", label: "Mobile", icon: <Smartphone className="size-4" /> },
                ]}
              />
              <IconToggle
                value={mode}
                onChange={setMode}
                options={[
                  { value: "light", label: "Light mode", icon: <Sun className="size-4" /> },
                  { value: "dark", label: "Dark mode", icon: <Moon className="size-4" /> },
                ]}
              />
            </div>
          </div>
          <SitePreview
            path={page}
            css={css}
            mode={mode}
            device={device}
            className={cn(device === "mobile" && "my-4")}
          />
        </section>

        {editing ? (
          <ThemeEditor
            editing={editing}
            surfaces={data.surfaces}
            issues={issues}
            checked={preview !== null}
            saving={save.isPending}
            onChange={(draft) => setEditing({ ...editing, draft })}
            onSave={() => save.mutate(editing)}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div className="space-y-3">
            {themes.map((t) => (
              <ThemeCard
                key={t.slug}
                theme={t}
                selected={t.slug === current.slug}
                onSelect={() => setSelected(t.slug)}
              >
                {!t.active && (
                  <Button
                    type="button"
                    size="sm"
                    variant="accent"
                    loading={activate.isPending}
                    onClick={() => activate.mutate(t.slug)}
                  >
                    Use this theme
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => startFrom(t, `${t.name} copy`)}
                >
                  <Copy className="size-3.5" /> Duplicate
                </Button>
                {!t.builtin && t.id && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing({ id: t.id, draft: definitionOf(t) })}
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                    {!t.active && (
                      <ConfirmButton
                        pending={remove.isPending}
                        onConfirm={() => t.id && remove.mutate(t.id)}
                        confirmLabel="Delete theme"
                      />
                    )}
                  </>
                )}
              </ThemeCard>
            ))}
            <p className="px-1 text-xs text-fg-subtle">
              Built-in themes can’t be changed. Duplicate one to make your own version.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function IconToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; icon: ReactNode }>;
}) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-label={o.label}
          aria-pressed={o.value === value}
          title={o.label}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-lg transition",
            o.value === value ? "bg-bg-elevated text-fg shadow-card" : "text-fg-muted hover:text-fg",
          )}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

function ThemeCard({
  theme,
  selected,
  onSelect,
  children,
}: {
  theme: ThemeItem;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  const { light, dark } = theme.tokens;
  return (
    <div
      className={cn(
        "card overflow-hidden transition",
        selected ? "ring-2 ring-accent" : "hover:border-line-strong",
      )}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected} className="block w-full p-4 text-left">
        <span className="flex items-center gap-3">
          <LogoMark
            className="size-9 shrink-0"
            title=""
            colors={{ from: light.brandFrom, to: light.brandTo }}
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm font-semibold">
              {theme.name}
              {theme.active && (
                <Badge tone="success" dot>
                  Live
                </Badge>
              )}
              {!theme.builtin && <Badge tone="muted">Custom</Badge>}
            </span>
            <span className="block truncate text-xs text-fg-muted">
              {theme.description || "No description"}
            </span>
          </span>
        </span>
        <span className="mt-3 grid grid-cols-2 gap-2">
          <ModeSwatch tokens={light} label="Light" />
          <ModeSwatch tokens={dark} label="Dark" />
        </span>
      </button>
      {selected && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">{children}</div>
      )}
    </div>
  );
}

/** A thumbnail of one mode: name colour, role-line colour and the main button on the page background. */
function ModeSwatch({ tokens: t, label }: { tokens: ThemeTokens; label: string }) {
  return (
    <span
      className="flex h-11 items-center gap-2 rounded-lg border px-2.5"
      style={{ background: t.bg, borderColor: t.lineStrong }}
      title={`${label} mode`}
    >
      <span className="text-sm font-semibold" style={{ color: t.accent }}>
        Aa
      </span>
      <span className="h-1.5 w-5 rounded-full" style={{ background: t.highlight }} />
      <span
        className="ml-auto h-5 w-10 rounded-md"
        style={{
          backgroundImage: `linear-gradient(90deg, ${t.btnFrom}, ${t.btnTo})`,
          boxShadow: `0 4px 10px -6px ${t.btnGlow}`,
        }}
      />
    </span>
  );
}

const MODE_FIELDS: Array<{ key: keyof ThemeModeColors; label: string; issue: string }> = [
  { key: "accent", label: "Accent (name, links)", issue: "accent" },
  { key: "highlight", label: "Highlight (role line)", issue: "highlight" },
  { key: "buttonFrom", label: "Button start", issue: "button" },
  { key: "buttonTo", label: "Button end", issue: "button" },
];

function ThemeEditor({
  editing,
  surfaces,
  issues,
  checked,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  editing: Editing;
  surfaces: ThemeSurface[];
  issues: ThemeIssue[];
  checked: boolean;
  saving: boolean;
  onChange: (d: ThemeDefinition) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const d = editing.draft;
  const bad = useMemo(() => new Set(issues.map((i) => i.field)), [issues]);
  const messages = (prefix: string) =>
    issues.filter((i) => i.field === prefix || i.field.startsWith(`${prefix}.`));
  const setMode = (mode: "light" | "dark", key: keyof ThemeModeColors, value: string) =>
    onChange({ ...d, [mode]: { ...d[mode], [key]: value } });
  const nameOk = d.name.trim().length >= 2;

  return (
    <section className="card space-y-6 p-5">
      <div>
        <h2 className="text-base font-semibold">{editing.id ? "Edit theme" : "New theme"}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          Changes show in the preview as you go. Text must stay easy to read.
        </p>
      </div>

      <div className="space-y-3">
        <Field label="Name" hint={`${d.name.length}/40`}>
          <Input value={d.name} maxLength={40} onChange={(e) => onChange({ ...d, name: e.target.value })} />
        </Field>
        <Field label="Description" hint={`${d.description.length}/120`}>
          <Input
            value={d.description}
            maxLength={120}
            placeholder="Optional"
            onChange={(e) => onChange({ ...d, description: e.target.value })}
          />
        </Field>
      </div>

      <Group title="Background" issues={messages("surface")}>
        <div className="grid grid-cols-2 gap-2">
          {surfaces.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange({ ...d, surface: s.key })}
              aria-pressed={d.surface === s.key}
              title={s.description}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-sm transition",
                d.surface === s.key
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-line hover:border-line-strong",
              )}
            >
              <span className="flex overflow-hidden rounded-md border border-line">
                <span className="size-5" style={{ background: s.lightBg }} />
                <span className="size-5" style={{ background: s.darkBg }} />
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Logo and photo" issues={[...messages("logo"), ...messages("backdrop")]}>
        <div className="flex items-end gap-3">
          <LogoMark className="mb-1 size-10 shrink-0" title="" colors={{ from: d.logoFrom, to: d.logoTo }} />
          <ColorField
            label="Logo start"
            value={d.logoFrom}
            invalid={bad.has("logo")}
            onChange={(v) => onChange({ ...d, logoFrom: v })}
          />
          <ColorField
            label="Logo end"
            value={d.logoTo}
            invalid={bad.has("logo")}
            onChange={(v) => onChange({ ...d, logoTo: v })}
          />
        </div>
        <ColorField
          label="Photo background (behind your photo, both modes)"
          value={d.backdrop}
          invalid={bad.has("backdrop")}
          onChange={(v) => onChange({ ...d, backdrop: v })}
        />
      </Group>

      {(["light", "dark"] as const).map((mode) => (
        <Group key={mode} title={mode === "light" ? "Light mode" : "Dark mode"} issues={messages(mode)}>
          <div className="grid grid-cols-2 gap-3">
            {MODE_FIELDS.map((f) => (
              <ColorField
                key={f.key}
                label={f.label}
                value={d[mode][f.key]}
                invalid={bad.has(`${mode}.${f.issue}`)}
                onChange={(v) => setMode(mode, f.key, v)}
              />
            ))}
          </div>
        </Group>
      ))}

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          loading={saving}
          disabled={!checked || issues.length > 0 || !nameOk}
          onClick={onSave}
          title={issues.length ? "Fix the readability problems first" : undefined}
        >
          Save theme
        </Button>
      </div>
    </section>
  );
}

function Group({ title, issues, children }: { title: string; issues: ThemeIssue[]; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="eyebrow">{title}</h3>
      {children}
      {issues.map((i) => (
        <p
          key={i.message}
          className="flex gap-2 rounded-lg bg-danger/10 px-3 py-2 text-xs leading-relaxed text-danger"
        >
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          {i.message}
        </p>
      ))}
    </div>
  );
}

function ColorField({
  label,
  value,
  invalid,
  onChange,
}: {
  label: string;
  value: string;
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1.5 block truncate text-xs font-medium text-fg-muted">{label}</span>
      <span
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-bg-elevated p-1.5 pr-2.5 transition focus-within:border-accent",
          invalid ? "border-danger" : "border-line",
        )}
      >
        <input
          type="color"
          value={HEX.test(value) ? value.toLowerCase() : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label}: pick`}
          className="size-7 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-line"
        />
        <input
          value={text}
          maxLength={7}
          spellCheck={false}
          aria-label={`${label}: hex`}
          onChange={(e) => {
            setText(e.target.value);
            if (HEX.test(e.target.value)) onChange(e.target.value.toLowerCase());
          }}
          onBlur={() => setText(value)}
          className="w-full min-w-0 bg-transparent font-mono text-sm text-fg uppercase outline-none"
        />
      </span>
    </label>
  );
}
