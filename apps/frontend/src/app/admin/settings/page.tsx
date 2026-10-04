"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormCard, LinesInput } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAction, useAll } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { LinkSetting } from "@/lib/site";
import type { SettingField, SettingGroup } from "@/lib/types";

type Values = Record<string, unknown>;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Every setting comes from the backend registry, so this form always matches what the site reads.
 * Only changed values are sent; unknown keys are rejected by the API.
 */
export default function SettingsPage() {
  const { data: groups, isLoading } = useAll<SettingGroup>("/settings");
  const saved = useMemo(() => {
    const out: Values = {};
    for (const g of groups ?? []) for (const f of g.items) out[f.key] = f.value;
    return out;
  }, [groups]);
  const [values, setValues] = useState<Values>({});
  useEffect(() => setValues(saved), [saved]);

  const changed = Object.keys(values).filter((k) => !same(values[k], saved[k]));
  const save = useAction(
    () => admin.put("/settings", { items: changed.map((key) => ({ key, value: values[key] })) }),
    { invalidate: ["/settings"], success: "Settings saved and live on the site." },
  );
  const set = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }));

  if (isLoading || !groups) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Copy, search appearance and features of the public site."
        actions={
          <>
            {changed.length > 0 && (
              <Button type="button" variant="ghost" onClick={() => setValues(saved)}>
                Discard changes
              </Button>
            )}
            <Button
              type="button"
              loading={save.isPending}
              disabled={changed.length === 0}
              onClick={() => save.mutate()}
            >
              Save{changed.length > 0 ? ` ${changed.length} change${changed.length === 1 ? "" : "s"}` : ""}
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 items-start gap-6">
        {groups.map((g) => (
          <FormCard key={g.key} title={g.label} description={g.description || undefined}>
            {g.items.map((f) => (
              <SettingInput key={f.key} field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
            ))}
          </FormCard>
        ))}
      </div>
    </>
  );
}

function SettingInput({
  field,
  value,
  onChange,
}: {
  field: SettingField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const isDefault = same(value, field.default);
  const reset = !isDefault && (
    <button
      type="button"
      onClick={() => onChange(field.default)}
      className="inline-flex items-center gap-1 text-xs text-fg-subtle hover:text-fg"
      title="Reset to default"
    >
      <RotateCcw className="size-3" /> Default
    </button>
  );

  if (field.kind === "bool") {
    return (
      <Switch
        checked={Boolean(value)}
        onChange={onChange}
        label={field.label}
        description={field.description || undefined}
      />
    );
  }

  if (field.kind === "link") {
    const link = (value as LinkSetting | undefined) ?? { label: "", href: "" };
    return (
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">{field.label}</span>
          {reset}
        </div>
        <div className="grid grid-cols-[1fr_1.4fr] gap-3">
          <Input
            value={link.label}
            maxLength={40}
            placeholder="Button text"
            onChange={(e) => onChange({ ...link, label: e.target.value })}
          />
          <Input
            value={link.href}
            placeholder="/contact or https://…"
            onChange={(e) => onChange({ ...link, href: e.target.value })}
          />
        </div>
        {field.description && <p className="mt-1.5 text-xs text-fg-subtle">{field.description}</p>}
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";
  const counter = field.maxLength ? `${text.length}/${field.maxLength}` : undefined;
  return (
    <div>
      <Field label={field.label} hint={counter}>
        {field.kind === "list" ? (
          <LinesInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} rows={4} />
        ) : field.kind === "text" ? (
          <Textarea
            rows={3}
            value={text}
            maxLength={field.maxLength}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <Input
            type={field.kind === "url" ? "url" : "text"}
            value={text}
            maxLength={field.maxLength}
            placeholder={field.kind === "url" ? "https://" : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </Field>
      {(field.description || reset) && (
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <p className="text-xs text-fg-subtle">{field.description}</p>
          {reset}
        </div>
      )}
    </div>
  );
}
