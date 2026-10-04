"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { errorMessage, useAction, useAll } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { Setting } from "@/lib/types";

interface Row {
  key: string;
  raw: string;
  isPublic: boolean;
  description: string;
  isNew?: boolean;
}

export default function SettingsPage() {
  const { data, isLoading } = useAll<Setting>("/settings");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (data)
      setRows(
        data.map((s) => ({
          key: s.key,
          raw: JSON.stringify(s.value, null, typeof s.value === "object" ? 2 : 0),
          isPublic: s.isPublic,
          description: s.description,
        })),
      );
  }, [data]);

  const save = useAction(
    async (items: Row[]) => {
      const payload = items.map((r) => {
        let value: unknown;
        try {
          value = JSON.parse(r.raw);
        } catch {
          value = r.raw;
        }
        return { key: r.key.trim(), value, isPublic: r.isPublic, description: r.description };
      });
      return admin.put("/settings", { items: payload });
    },
    { invalidate: ["/settings"], success: "Settings saved" },
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Key–value configuration used by the site: SEO defaults, hero copy, feature flags. Values are JSON (strings need quotes)."
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setRows((rs) => [...rs, { key: "", raw: '""', isPublic: true, description: "", isNew: true }])
              }
            >
              <Plus className="size-4" /> Add setting
            </Button>
            <Button
              type="button"
              loading={save.isPending}
              onClick={() => {
                const invalid = rows.find((r) => !/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)*$/.test(r.key.trim()));
                if (invalid)
                  return toast.error(`Invalid key "${invalid.key}". Use dotted camelCase like hero.eyebrow`);
                save.mutate(rows);
              }}
            >
              Save all
            </Button>
          </>
        }
      />
      <div className="card divide-y divide-line">
        {rows.map((row, i) => (
          <div
            key={row.isNew ? `new-${i}` : row.key}
            className="grid gap-3 p-4 lg:grid-cols-[220px_1fr_220px_auto]"
          >
            <div>
              <Input
                value={row.key}
                onChange={(e) => update(i, { key: e.target.value })}
                disabled={!row.isNew}
                className="font-mono text-xs"
                placeholder="group.key"
              />
            </div>
            <Textarea
              rows={row.raw.includes("\n") ? 4 : 1}
              value={row.raw}
              onChange={(e) => update(i, { raw: e.target.value })}
              className="min-h-10 font-mono text-xs"
              spellCheck={false}
            />
            <Input
              value={row.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              className="text-xs"
            />
            <Switch checked={row.isPublic} onChange={(v) => update(i, { isPublic: v })} label="Public" />
          </div>
        ))}
      </div>
      {save.isError && <p className="mt-3 text-sm text-danger">{errorMessage(save.error)}</p>}
    </>
  );
}
