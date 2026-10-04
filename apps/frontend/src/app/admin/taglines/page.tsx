"use client";

import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmButton } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Switch } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAll, useRemove, useReorder, useSave } from "@/lib/admin/hooks";
import type { Tagline } from "@/lib/types";

const contexts = ["hero", "cta", "footer", "about"] as const;
const labels: Record<string, string> = {
  hero: "Hero (rotating headline)",
  cta: "Call to action",
  footer: "Footer",
  about: "About page headline",
};

type Draft = { id?: string; text: string; context: Tagline["context"]; isActive: boolean; sortOrder: number };

export default function TaglinesPage() {
  const { data, isLoading } = useAll<Tagline>("/taglines");
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useSave<Omit<Draft, "id">>({
    path: "/taglines",
    id: draft?.id,
    onSuccess: () => setDraft(null),
  });
  const remove = useRemove("/taglines");
  const reorder = useReorder("/taglines");

  if (isLoading) return <Skeleton className="h-64" />;

  const move = (list: Tagline[], index: number, dir: -1 | 1) => {
    const ids = list.map((t) => t.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    const [id] = ids.splice(index, 1);
    if (id) ids.splice(target, 0, id);
    reorder.mutate(ids);
  };

  return (
    <>
      <PageHeader
        title="Taglines"
        description="Short lines used across the site. Hero taglines rotate on the home page."
        actions={
          <Button onClick={() => setDraft({ text: "", context: "hero", isActive: true, sortOrder: 0 })}>
            <Plus className="size-4" /> New tagline
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {contexts.map((ctx) => {
          const list = (data ?? []).filter((t) => t.context === ctx);
          return (
            <section key={ctx} className="card">
              <div className="border-b border-line px-5 py-3">
                <h2 className="text-sm font-semibold">{labels[ctx]}</h2>
              </div>
              {list.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-fg-muted">None yet</p>
              ) : (
                <ul className="divide-y divide-line">
                  {list.map((t, i) => (
                    <li key={t.id} className="flex items-center gap-2 px-4 py-3">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(list, i, -1)}
                          disabled={i === 0}
                          className="text-fg-subtle hover:text-fg disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(list, i, 1)}
                          disabled={i === list.length - 1}
                          className="text-fg-subtle hover:text-fg disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            id: t.id,
                            text: t.text,
                            context: t.context,
                            isActive: t.isActive ?? true,
                            sortOrder: t.sortOrder ?? 0,
                          })
                        }
                        className={`flex-1 text-left text-sm ${t.isActive ? "" : "text-fg-subtle line-through"}`}
                      >
                        {t.text}
                      </button>
                      <ConfirmButton
                        label=""
                        onConfirm={() => remove.mutate(t.id)}
                        pending={remove.isPending}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit tagline" : "New tagline"}
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { id: _id, ...body } = draft;
              save.mutate(body);
            }}
            className="space-y-4"
          >
            <Field label="Text" required>
              <Input
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                autoFocus
                required
                maxLength={200}
              />
            </Field>
            <Field label="Where it appears">
              <Select
                value={draft.context}
                onChange={(e) => setDraft({ ...draft, context: e.target.value as Tagline["context"] })}
              >
                {contexts.map((c) => (
                  <option key={c} value={c}>
                    {labels[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Switch
              checked={draft.isActive}
              onChange={(v) => setDraft({ ...draft, isActive: v })}
              label="Active"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={save.isPending}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
