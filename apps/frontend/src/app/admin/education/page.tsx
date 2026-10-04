"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmButton, StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { useAll, useRemove, useSave } from "@/lib/admin/hooks";
import type { Education } from "@/lib/types";
import { formatMonth } from "@/lib/utils";

type Draft = {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startedAt: string;
  endedAt: string;
  grade: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
};
const blank: Draft = {
  institution: "",
  degree: "",
  field: "",
  location: "",
  startedAt: "",
  endedAt: "",
  grade: "",
  description: "",
  sortOrder: 0,
  isPublished: true,
};

export default function EducationPage() {
  const { data, isLoading } = useAll<Education>("/education");
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useSave<Record<string, unknown>>({
    path: "/education",
    id: draft?.id,
    onSuccess: () => setDraft(null),
  });
  const remove = useRemove("/education");
  const columns: Column<Education>[] = [
    {
      key: "degree",
      header: "Degree",
      render: (e) => (
        <div>
          <p className="font-medium">{e.degree}</p>
          <p className="text-xs text-fg-muted">{e.institution}</p>
        </div>
      ),
    },
    { key: "field", header: "Field", render: (e) => <span className="text-fg-muted">{e.field}</span> },
    {
      key: "period",
      header: "Period",
      render: (e) => (
        <span className="text-fg-muted">
          {[formatMonth(e.startedAt), formatMonth(e.endedAt)].filter(Boolean).join(" — ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "",
      render: (e) => <StatusBadge value={e.isPublished ? "published" : "draft"} />,
    },
  ];
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    draft && setDraft({ ...draft, [k]: e.target.value });
  return (
    <>
      <PageHeader
        title="Education"
        actions={
          <Button onClick={() => setDraft(blank)}>
            <Plus className="size-4" /> Add
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        loading={isLoading}
        rowKey={(e) => e.id}
        onRowClick={(e) =>
          setDraft({ ...blank, ...e, startedAt: e.startedAt ?? "", endedAt: e.endedAt ?? "" })
        }
      />
      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit education" : "Add education"}
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { id: _id, ...body } = draft;
              save.mutate({ ...body, startedAt: body.startedAt || null, endedAt: body.endedAt || null });
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Institution" required>
                <Input value={draft.institution} onChange={set("institution")} required />
              </Field>
              <Field label="Degree" required>
                <Input value={draft.degree} onChange={set("degree")} required />
              </Field>
              <Field label="Field of study">
                <Input value={draft.field} onChange={set("field")} />
              </Field>
              <Field label="Location">
                <Input value={draft.location} onChange={set("location")} />
              </Field>
              <Field label="Started">
                <Input type="date" value={draft.startedAt} onChange={set("startedAt")} />
              </Field>
              <Field label="Ended">
                <Input type="date" value={draft.endedAt} onChange={set("endedAt")} />
              </Field>
              <Field label="Grade">
                <Input value={draft.grade} onChange={set("grade")} />
              </Field>
              <Field label="Sort order">
                <Input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={3} value={draft.description} onChange={set("description")} />
            </Field>
            <Switch
              checked={draft.isPublished}
              onChange={(v) => setDraft({ ...draft, isPublished: v })}
              label="Published"
            />
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
