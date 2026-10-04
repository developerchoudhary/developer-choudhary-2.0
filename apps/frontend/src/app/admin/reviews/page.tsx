"use client";

import { Check, Plus, Star, X } from "lucide-react";
import { useState } from "react";
import { ConfirmButton, StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Stars } from "@/components/ui/misc";
import { useAction, useList, useRemove, useSave } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Draft = {
  id?: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorEmail: string;
  authorWebsite: string;
  authorAvatarUrl: string;
  rating: number;
  title: string;
  body: string;
  serviceSlug: string;
  source: string;
  status: string;
  isFeatured: boolean;
  reviewedAt: string;
};
const blank: Draft = {
  authorName: "",
  authorRole: "",
  authorCompany: "",
  authorEmail: "",
  authorWebsite: "",
  authorAvatarUrl: "",
  rating: 5,
  title: "",
  body: "",
  serviceSlug: "",
  source: "manual",
  status: "approved",
  isFeatured: false,
  reviewedAt: "",
};

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const { data, isLoading } = useList<Review>("/reviews", {
    page,
    pageSize: 20,
    status: status || undefined,
    search: search || undefined,
  });
  const save = useSave<Record<string, unknown>>({
    path: "/reviews",
    id: draft?.id,
    onSuccess: () => setDraft(null),
  });
  const remove = useRemove("/reviews");
  const moderate = useAction(
    ({ id, status, isFeatured }: { id: string; status: string; isFeatured?: boolean }) =>
      admin.patch(`/reviews/${id}/status`, { status, isFeatured }),
    { invalidate: ["/reviews"], success: "Updated" },
  );

  const columns: Column<Review>[] = [
    {
      key: "author",
      header: "Author",
      render: (r) => (
        <div>
          <p className="font-medium">{r.authorName}</p>
          <p className="text-xs text-fg-muted">
            {[r.authorRole, r.authorCompany].filter(Boolean).join(", ")}
          </p>
        </div>
      ),
    },
    { key: "rating", header: "Rating", render: (r) => <Stars rating={r.rating} size="size-3.5" /> },
    {
      key: "body",
      header: "Review",
      render: (r) => (
        <p className="max-w-md truncate text-fg-muted" title={r.body}>
          {r.title ? <strong className="text-fg">{r.title} · </strong> : null}
          {r.body}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <div className="flex gap-1">
          <StatusBadge value={r.status ?? "pending"} />
          {r.isFeatured && <StatusBadge value="high" />}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="text-fg-muted">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div
          role="toolbar"
          aria-label="Moderation"
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {r.status !== "approved" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => moderate.mutate({ id: r.id, status: "approved" })}
              aria-label="Approve"
            >
              <Check className="size-4 text-success" />
            </Button>
          )}
          {r.status !== "rejected" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => moderate.mutate({ id: r.id, status: "rejected" })}
              aria-label="Reject"
            >
              <X className="size-4 text-danger" />
            </Button>
          )}
          {r.status === "approved" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => moderate.mutate({ id: r.id, status: "approved", isFeatured: !r.isFeatured })}
              aria-label="Toggle featured"
            >
              <Star className={`size-4 ${r.isFeatured ? "fill-highlight text-highlight" : ""}`} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Approve what visitors submit, or add reviews you received elsewhere."
        actions={
          <Button onClick={() => setDraft(blank)}>
            <Plus className="size-4" /> Add review
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items}
        loading={isLoading}
        rowKey={(r) => r.id}
        meta={data?.meta}
        onPage={setPage}
        search={{
          value: search,
          onChange: (v) => {
            setSearch(v);
            setPage(1);
          },
        }}
        filters={
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-40"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        }
        onRowClick={(r) =>
          setDraft({
            ...blank,
            ...r,
            authorEmail: r.authorEmail ?? "",
            status: r.status ?? "pending",
            reviewedAt: r.reviewedAt ?? "",
          })
        }
        empty={status === "pending" ? "Nothing waiting for approval" : "No reviews"}
      />
      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit review" : "Add review"}
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { id: _id, ...body } = draft;
              save.mutate({
                ...body,
                reviewedAt: body.reviewedAt || null,
                authorWebsite: body.authorWebsite || undefined,
              });
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author name" required>
                <Input
                  value={draft.authorName}
                  onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                  required
                />
              </Field>
              <Field label="Role">
                <Input
                  value={draft.authorRole}
                  onChange={(e) => setDraft({ ...draft, authorRole: e.target.value })}
                />
              </Field>
              <Field label="Company">
                <Input
                  value={draft.authorCompany}
                  onChange={(e) => setDraft({ ...draft, authorCompany: e.target.value })}
                />
              </Field>
              <Field label="Email" hint="private">
                <Input
                  type="email"
                  value={draft.authorEmail}
                  onChange={(e) => setDraft({ ...draft, authorEmail: e.target.value })}
                />
              </Field>
              <Field label="Rating">
                <Select
                  value={draft.rating}
                  onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Source">
                <Select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
                  {["website", "google", "linkedin", "upwork", "whatsapp", "manual"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </Field>
              <Field label="Reviewed on">
                <Input
                  type="date"
                  value={draft.reviewedAt}
                  onChange={(e) => setDraft({ ...draft, reviewedAt: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Headline">
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Review" required>
              <Textarea
                rows={5}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                required
              />
            </Field>
            <Switch
              checked={draft.isFeatured}
              onChange={(v) => setDraft({ ...draft, isFeatured: v })}
              label="Featured on home page"
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
