"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { useList } from "@/lib/admin/hooks";
import { PROJECT_TYPE_LABELS } from "@/lib/site";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const { data, isLoading } = useList<Project>("/projects", {
    page,
    pageSize: 20,
    search: search || undefined,
    projectType: type || undefined,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });
  const columns: Column<Project>[] = [
    {
      key: "title",
      header: "Project",
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg-muted font-mono text-xs text-fg-subtle">
            {p.coverUrl ? (
              // biome-ignore lint/performance/noImgElement: tiny admin thumbnail
              <img src={p.coverUrl} alt="" loading="lazy" className="size-full object-cover" />
            ) : (
              p.title.slice(0, 1)
            )}
          </span>
          <div>
            <p className="font-medium">{p.title}</p>
            <p className="text-xs text-fg-muted">{p.clientName || p.subtitle}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (p) => <span className="text-fg-muted">{PROJECT_TYPE_LABELS[p.projectType]}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <div className="flex gap-1">
          <StatusBadge value={p.status} />
          <StatusBadge value={p.isPublished ? "published" : "draft"} />
          {p.isFeatured && <StatusBadge value="featured" />}
        </div>
      ),
    },
    {
      key: "date",
      header: "Completed",
      render: (p) => <span className="text-fg-muted">{formatDate(p.completedAt) || "—"}</span>,
    },
  ];
  return (
    <>
      <PageHeader
        title="Projects"
        description="Case studies shown under Work."
        actions={
          <LinkButton href="/admin/projects/new">
            <Plus className="size-4" /> New project
          </LinkButton>
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
          placeholder: "Search projects",
        }}
        filters={
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-40"
          >
            <option value="">All types</option>
            {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        }
        onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
      />
    </>
  );
}
