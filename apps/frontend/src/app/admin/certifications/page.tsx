"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmButton, StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Switch } from "@/components/ui/field";
import { useAll, useRemove, useSave } from "@/lib/admin/hooks";
import type { Certification } from "@/lib/types";
import { formatMonth } from "@/lib/utils";

type Draft = {
  id?: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  credentialId: string;
  credentialUrl: string;
  sortOrder: number;
  isPublished: boolean;
};
const blank: Draft = {
  name: "",
  issuer: "",
  issuedAt: "",
  expiresAt: "",
  credentialId: "",
  credentialUrl: "",
  sortOrder: 0,
  isPublished: true,
};

export default function CertificationsPage() {
  const { data, isLoading } = useAll<Certification>("/certifications");
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useSave<Record<string, unknown>>({
    path: "/certifications",
    id: draft?.id,
    onSuccess: () => setDraft(null),
  });
  const remove = useRemove("/certifications");
  const columns: Column<Certification>[] = [
    {
      key: "name",
      header: "Certification",
      render: (c) => (
        <div>
          <p className="font-medium">{c.name}</p>
          <p className="text-xs text-fg-muted">{c.issuer}</p>
        </div>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      render: (c) => <span className="text-fg-muted">{formatMonth(c.issuedAt) || "—"}</span>,
    },
    {
      key: "status",
      header: "",
      render: (c) => <StatusBadge value={c.isPublished ? "published" : "draft"} />,
    },
  ];
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    draft && setDraft({ ...draft, [k]: e.target.value });
  return (
    <>
      <PageHeader
        title="Certifications"
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
        rowKey={(c) => c.id}
        onRowClick={(c) =>
          setDraft({ ...blank, ...c, issuedAt: c.issuedAt ?? "", expiresAt: c.expiresAt ?? "" })
        }
        empty="No certifications yet. Add any courses or credentials you want on the resume."
      />
      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit certification" : "Add certification"}
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { id: _id, ...body } = draft;
              save.mutate({ ...body, issuedAt: body.issuedAt || null, expiresAt: body.expiresAt || null });
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <Input value={draft.name} onChange={set("name")} required />
              </Field>
              <Field label="Issuer">
                <Input value={draft.issuer} onChange={set("issuer")} />
              </Field>
              <Field label="Issued">
                <Input type="date" value={draft.issuedAt} onChange={set("issuedAt")} />
              </Field>
              <Field label="Expires">
                <Input type="date" value={draft.expiresAt} onChange={set("expiresAt")} />
              </Field>
              <Field label="Credential ID">
                <Input value={draft.credentialId} onChange={set("credentialId")} />
              </Field>
              <Field label="Credential URL">
                <Input value={draft.credentialUrl} onChange={set("credentialUrl")} placeholder="https://" />
              </Field>
            </div>
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
