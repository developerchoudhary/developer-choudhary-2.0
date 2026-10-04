"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/button";
import { useAll } from "@/lib/admin/hooks";
import type { Experience } from "@/lib/types";
import { formatMonth } from "@/lib/utils";

export default function ExperiencePage() {
  const router = useRouter();
  const { data, isLoading } = useAll<Experience>("/experience");
  const columns: Column<Experience>[] = [
    {
      key: "role",
      header: "Role",
      render: (x) => (
        <div>
          <p className="font-medium">{x.role}</p>
          <p className="text-xs text-fg-muted">{x.company}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (x) => <span className="text-fg-muted">{x.employmentType}</span> },
    {
      key: "period",
      header: "Period",
      render: (x) => (
        <span className="text-fg-muted">
          {formatMonth(x.startedAt)} — {x.isCurrent ? "Present" : formatMonth(x.endedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "",
      render: (x) => <StatusBadge value={x.isPublished ? "published" : "draft"} />,
    },
  ];
  return (
    <>
      <PageHeader
        title="Experience"
        description="Work history for the site and the resume."
        actions={
          <LinkButton href="/admin/experience/new">
            <Plus className="size-4" /> Add role
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        loading={isLoading}
        rowKey={(x) => x.id}
        onRowClick={(x) => router.push(`/admin/experience/${x.id}`)}
      />
    </>
  );
}
