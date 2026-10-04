"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmButton, StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Switch } from "@/components/ui/field";
import { useAll, useRemove, useSave } from "@/lib/admin/hooks";
import { SKILL_CATEGORY_LABELS } from "@/lib/site";
import type { Skill } from "@/lib/types";

type Draft = Omit<Skill, "id"> & { id?: string };
const blank: Draft = {
  name: "",
  category: "frontend",
  proficiency: 80,
  years: 1,
  icon: "",
  color: "",
  description: "",
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
};

export default function SkillsPage() {
  const { data, isLoading } = useAll<Skill>("/skills");
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useSave<Omit<Draft, "id">>({
    path: "/skills",
    id: draft?.id,
    invalidate: ["/skills"],
    onSuccess: () => setDraft(null),
  });
  const remove = useRemove("/skills");

  const columns: Column<Skill>[] = [
    { key: "name", header: "Skill", render: (s) => <span className="font-medium">{s.name}</span> },
    {
      key: "category",
      header: "Category",
      render: (s) => <span className="text-fg-muted">{SKILL_CATEGORY_LABELS[s.category]}</span>,
    },
    {
      key: "prof",
      header: "Proficiency",
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-muted">
            <div className="h-full bg-accent" style={{ width: `${s.proficiency}%` }} />
          </div>
          <span className="font-mono text-xs text-fg-muted">{s.proficiency}</span>
        </div>
      ),
    },
    { key: "years", header: "Years", render: (s) => <span className="text-fg-muted">{s.years}</span> },
    {
      key: "flags",
      header: "",
      render: (s) => (
        <div className="flex gap-1">
          {s.isFeatured && <StatusBadge value="high" />}
          {!s.isPublished && <StatusBadge value="draft" />}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Skills"
        description="Grouped by category on the site and in the resume. Featured skills scroll across the home page."
        actions={
          <Button onClick={() => setDraft(blank)}>
            <Plus className="size-4" /> New skill
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        loading={isLoading}
        rowKey={(s) => s.id}
        onRowClick={(s) => setDraft(s)}
      />
      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit skill" : "New skill"}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                  autoFocus
                />
              </Field>
              <Field label="Category">
                <Select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  {Object.entries(SKILL_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={`Proficiency · ${draft.proficiency}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={draft.proficiency}
                  onChange={(e) => setDraft({ ...draft, proficiency: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
              <Field label="Years">
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  value={draft.years}
                  onChange={(e) => setDraft({ ...draft, years: Number(e.target.value) })}
                />
              </Field>
              <Field label="Icon slug" hint="simple-icons">
                <Input
                  value={draft.icon}
                  onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                  placeholder="nextdotjs"
                />
              </Field>
              <Field label="Sort order">
                <Input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Description" hint="optional">
              <Input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            <div className="flex gap-6">
              <Switch
                checked={draft.isFeatured}
                onChange={(v) => setDraft({ ...draft, isFeatured: v })}
                label="Featured"
              />
              <Switch
                checked={draft.isPublished}
                onChange={(v) => setDraft({ ...draft, isPublished: v })}
                label="Published"
              />
            </div>
            <div className="flex items-center justify-between">
              {draft.id ? (
                <ConfirmButton
                  onConfirm={() => remove.mutate(draft.id as string, { onSuccess: () => setDraft(null) })}
                  pending={remove.isPending}
                />
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={save.isPending}>
                  Save
                </Button>
              </div>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
