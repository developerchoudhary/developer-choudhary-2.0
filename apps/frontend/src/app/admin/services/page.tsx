"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/button";
import { useAll } from "@/lib/admin/hooks";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  const router = useRouter();
  const { data, isLoading } = useAll<Service>("/services");
  const columns: Column<Service>[] = [
    {
      key: "title",
      header: "Service",
      render: (s) => (
        <div>
          <p className="font-medium">{s.title}</p>
          <p className="text-xs text-fg-muted">{s.tagline}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "From",
      render: (s) => <span className="text-fg-muted">{s.startingPriceLabel || "—"}</span>,
    },
    {
      key: "timeline",
      header: "Timeline",
      render: (s) => <span className="text-fg-muted">{s.timelineLabel || "—"}</span>,
    },
    {
      key: "flags",
      header: "Status",
      render: (s) => (
        <div className="flex gap-1">
          <StatusBadge value={s.isPublished ? "published" : "draft"} />
          {s.isFeatured && <StatusBadge value="high" />}
        </div>
      ),
    },
    {
      key: "order",
      header: "#",
      render: (s) => <span className="font-mono text-xs text-fg-subtle">{s.sortOrder}</span>,
      className: "w-12",
    },
  ];
  return (
    <>
      <PageHeader
        title="Services"
        description="What you sell. Featured services appear on the home page."
        actions={
          <LinkButton href="/admin/services/new">
            <Plus className="size-4" /> New service
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        loading={isLoading}
        rowKey={(s) => s.id}
        onRowClick={(s) => router.push(`/admin/services/${s.id}`)}
      />
    </>
  );
}
