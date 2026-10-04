"use client";

import { Plus, Tags } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { useList } from "@/lib/admin/hooks";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useList<Post>("/posts", {
    page,
    pageSize: 20,
    search: search || undefined,
    status: status || undefined,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const columns: Column<Post>[] = [
    {
      key: "title",
      header: "Post",
      render: (p) => (
        <div>
          <p className="font-medium">{p.title}</p>
          <p className="text-xs text-fg-muted">
            /blog/{p.slug}
            {p.category ? ` · ${p.category.name}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <div className="flex items-center gap-1">
          <StatusBadge value={p.status} />
          {p.isFeatured && <StatusBadge value="high" />}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (p) => (
        <span className="text-fg-muted">
          {p.status === "scheduled"
            ? `Scheduled ${formatDate(p.scheduledFor)}`
            : formatDate(p.publishedAt ?? p.updatedAt)}
        </span>
      ),
    },
    {
      key: "views",
      header: "Views",
      render: (p) => <span className="font-mono text-xs text-fg-muted">{p.viewCount}</span>,
      className: "text-right",
    },
  ];
  return (
    <>
      <PageHeader
        title="Blog"
        description="Write, schedule and publish articles."
        actions={
          <>
            <LinkButton href="/admin/blog/taxonomy" variant="secondary">
              <Tags className="size-4" /> Categories & tags
            </LinkButton>
            <LinkButton href="/admin/blog/new">
              <Plus className="size-4" /> New post
            </LinkButton>
          </>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items}
        loading={isLoading}
        rowKey={(p) => p.id}
        meta={data?.meta}
        onPage={setPage}
        search={{
          value: search,
          onChange: (v) => {
            setSearch(v);
            setPage(1);
          },
          placeholder: "Search posts",
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
            <option value="">All statuses</option>
            {["draft", "scheduled", "published", "archived"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
        onRowClick={(p) => router.push(`/admin/blog/${p.id}`)}
        empty="No posts yet. Write your first article."
      />
    </>
  );
}
