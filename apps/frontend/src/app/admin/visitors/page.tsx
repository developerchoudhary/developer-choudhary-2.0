"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { StatCard } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/misc";
import { useList, useOne } from "@/lib/admin/hooks";
import type { CountItem, Visit, VisitStats } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function TopList({ title, items }: { title: string; items: CountItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-fg-muted">No data yet</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.label}>
              <div className="flex justify-between gap-3">
                <span className="truncate text-fg-muted">{i.label}</span>
                <span className="font-mono text-xs">{i.count}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-muted">
                <div className="h-full bg-accent/70" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function VisitorsPage() {
  const { data: stats, isLoading } = useOne<VisitStats>("/visits/stats");
  const [page, setPage] = useState(1);
  const visits = useList<Visit>("/visits", { page, pageSize: 25 });
  if (isLoading || !stats) return <Skeleton className="h-96" />;
  const max = Math.max(1, ...stats.daily.map((d) => d.views));

  const columns: Column<Visit>[] = [
    {
      key: "time",
      header: "Time",
      render: (v) => (
        <span className="text-fg-muted">
          {formatDate(v.createdAt, { dateStyle: "short", timeStyle: "short" })}
        </span>
      ),
    },
    { key: "path", header: "Page", render: (v) => <span className="font-mono text-xs">{v.path}</span> },
    {
      key: "loc",
      header: "Location",
      render: (v) => (
        <span className="text-fg-muted">
          {[v.city, v.country].filter(Boolean).join(", ") || "—"}
          {v.consentLocation && <span className="ml-1 text-xs text-success">●</span>}
        </span>
      ),
    },
    {
      key: "device",
      header: "Device",
      render: (v) => <span className="text-fg-muted">{v.device || "—"}</span>,
    },
    {
      key: "ref",
      header: "Referrer",
      render: (v) => (
        <span className="block max-w-48 truncate text-xs text-fg-muted" title={v.referrer}>
          {v.referrer || "direct"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Visitors"
        description="Privacy-friendly analytics: anonymous visitor ids, hashed IPs, and locations only when visitors agree to share them."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Views · 30 days" value={stats.views30d} />
        <StatCard label="Unique visitors · 30 days" value={stats.visitors30d} />
        <StatCard label="Views today" value={stats.viewsToday} />
        <StatCard
          label="Shared location"
          value={`${Math.round(stats.consentRate * 100)}%`}
          hint="of views in the last 30 days"
        />
      </div>
      <section className="card mt-6 p-5">
        <h2 className="mb-4 text-sm font-semibold">Daily views</h2>
        <div className="flex h-40 items-end gap-1">
          {stats.daily.map((d) => (
            <div key={d.day} className="group relative flex-1">
              <div
                className="rounded-t bg-accent/70 transition group-hover:bg-accent"
                style={{ height: `${Math.max(3, (d.views / max) * 150)}px` }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-fg px-1.5 py-0.5 text-[10px] text-bg group-hover:block">
                {d.day}: {d.views} views · {d.visitors} visitors
              </span>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TopList title="Top pages" items={stats.topPages} />
        <TopList title="Countries" items={stats.topCountries} />
        <TopList title="Referrers" items={stats.topReferrers} />
        <TopList title="Devices" items={stats.devices} />
      </div>
      {stats.locationPoints.length > 0 && (
        <section className="card mt-6 p-5">
          <h2 className="mb-3 text-sm font-semibold">Shared locations</h2>
          <div className="flex flex-wrap gap-2">
            {stats.locationPoints.slice(0, 60).map((p) => (
              <a
                key={`${p.latitude}-${p.longitude}`}
                href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-fg-muted hover:text-fg"
              >
                {[p.city, p.country].filter(Boolean).join(", ") || `${p.latitude}, ${p.longitude}`}{" "}
                <span className="font-mono">{p.count}</span> <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        </section>
      )}
      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={visits.data?.items}
          loading={visits.isLoading}
          rowKey={(v) => v.id}
          meta={visits.data?.meta}
          onPage={setPage}
          empty="No visits recorded yet"
        />
      </div>
    </>
  );
}
