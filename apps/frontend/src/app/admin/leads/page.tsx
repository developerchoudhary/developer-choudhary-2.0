"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatCard, StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { useAction, useList, useOne } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { Lead, LeadStats } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statuses = ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"];

export default function LeadsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useList<Lead>("/leads", {
    page,
    pageSize: 20,
    status: status || undefined,
    search: search || undefined,
  });
  const stats = useOne<LeadStats>("/leads/stats");
  const exportCsv = useAction(async () => {
    const blob = await admin.download("/leads/export", {
      status: status || undefined,
      search: search || undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Lead",
      render: (l) => (
        <div>
          <p className="font-medium">
            {l.firstName} {l.lastName}
          </p>
          <p className="text-xs text-fg-muted">
            {l.email || l.phone}
            {l.company ? ` · ${l.company}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "interest",
      header: "Interest",
      render: (l) => (
        <div className="text-fg-muted">
          <p>{l.serviceInterest || "—"}</p>
          <p className="text-xs">{[l.budgetRange, l.timeline].filter(Boolean).join(" · ")}</p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (l) => (
        <span className="text-fg-muted">{[l.city, l.country].filter(Boolean).join(", ") || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (l) => (
        <div className="flex gap-1">
          <StatusBadge value={l.status} />
          {l.priority === "high" && <StatusBadge value="high" />}
        </div>
      ),
    },
    {
      key: "date",
      header: "Received",
      render: (l) => <span className="text-fg-muted">{formatDate(l.createdAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Leads"
        description="Enquiries from the contact form. Click a lead to see the message, location and notes."
        actions={
          <Button variant="secondary" onClick={() => exportCsv.mutate()} loading={exportCsv.isPending}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />
      {stats.data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="New" value={stats.data.byStatus.new ?? 0} />
          <StatCard
            label="In progress"
            value={
              (stats.data.byStatus.contacted ?? 0) +
              (stats.data.byStatus.qualified ?? 0) +
              (stats.data.byStatus.proposal ?? 0)
            }
          />
          <StatCard
            label="Won"
            value={stats.data.byStatus.won ?? 0}
            hint={`${stats.data.byStatus.lost ?? 0} lost`}
          />
          <StatCard label="Last 7 days" value={stats.data.last7Days} hint={`${stats.data.total} total`} />
        </div>
      )}
      <DataTable
        columns={columns}
        rows={data?.items}
        loading={isLoading}
        rowKey={(l) => l.id}
        meta={data?.meta}
        onPage={setPage}
        search={{
          value: search,
          onChange: (v) => {
            setSearch(v);
            setPage(1);
          },
          placeholder: "Name, email, company, message",
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
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
        onRowClick={(l) => router.push(`/admin/leads/${l.id}`)}
        empty="No leads match"
      />
    </>
  );
}
