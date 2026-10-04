"use client";

import { Clock, ExternalLink, Eye, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { StatCard } from "@/components/admin/bits";
import {
  AreaChart,
  BarList,
  ChartCard,
  ColumnChart,
  fillDays,
  percentDelta,
  SegmentBar,
} from "@/components/admin/charts";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Segmented } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useList, useOne } from "@/lib/admin/hooks";
import type { Visit, VisitStats } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

type Range = "7" | "30" | "90" | "365";

function referrerLabel(r: string) {
  try {
    return new URL(r).hostname.replace(/^www\./, "");
  } catch {
    return r;
  }
}

function duration(ms: number) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function VisitorsPage() {
  const [range, setRange] = useState<Range>("30");
  const days = Number(range);
  const { data: stats, isLoading } = useOne<VisitStats>(`/visits/stats?days=${days}`);
  const [page, setPage] = useState(1);
  const visits = useList<Visit>("/visits", { page, pageSize: 25, sortBy: "createdAt", sortOrder: "desc" });

  const header = (
    <PageHeader
      title="Analytics"
      description="Privacy-friendly: anonymous visitor ids, hashed IPs, locations only when visitors agree to share them."
      actions={
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
            { value: "365", label: "1 year" },
          ]}
        />
      }
    />
  );

  if (isLoading && !stats) {
    return (
      <>
        {header}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-28" />
          ))}
          <Skeleton className="col-span-4 h-80" />
        </div>
      </>
    );
  }
  if (!stats) return header;

  const traffic = fillDays(stats.daily, stats.rangeDays, (r) => [r?.views ?? 0, r?.visitors ?? 0]);
  const hourly = Array.from({ length: 24 }, (_, h) => stats.hourly.find((x) => x.hour === h)?.views ?? 0);

  const columns: Column<Visit>[] = [
    {
      key: "time",
      header: "Time",
      width: "170px",
      render: (v) => (
        <span className="tabular text-fg-muted">
          {formatDate(v.createdAt, { dateStyle: "medium", timeStyle: "short" })}
        </span>
      ),
    },
    { key: "path", header: "Page", render: (v) => <span className="font-mono text-xs">{v.path}</span> },
    {
      key: "loc",
      header: "Location",
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-fg-muted">
          {[v.city, v.country].filter(Boolean).join(", ") || "—"}
          {v.consentLocation && <MapPin className="size-3 text-success" aria-label="Shared location" />}
        </span>
      ),
    },
    {
      key: "device",
      header: "Device",
      width: "110px",
      render: (v) => <span className="capitalize text-fg-muted">{v.device || "—"}</span>,
    },
    {
      key: "ref",
      header: "Referrer",
      render: (v) => (
        <span className="block max-w-56 truncate text-xs text-fg-muted" title={v.referrer}>
          {v.referrer ? referrerLabel(v.referrer) : "direct"}
        </span>
      ),
    },
    {
      key: "dur",
      header: "Time on page",
      width: "120px",
      render: (v) => <span className="tabular text-fg-muted">{duration(v.durationMs ?? 0)}</span>,
    },
  ];

  return (
    <>
      {header}
      <div className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label={`Page views · ${days}d`}
            value={formatNumber(stats.views)}
            delta={percentDelta(stats.views, stats.prevViews)}
            hint="vs previous period"
            icon={<Eye className="size-4" />}
          />
          <StatCard
            label={`Unique visitors · ${days}d`}
            value={formatNumber(stats.visitors)}
            delta={percentDelta(stats.visitors, stats.prevVisitors)}
            hint="vs previous period"
            icon={<Users className="size-4" />}
          />
          <StatCard
            label="Today"
            value={formatNumber(stats.viewsToday)}
            hint={`${stats.visitorsToday} unique visitors`}
            icon={<Clock className="size-4" />}
          />
          <StatCard
            label="Shared location"
            value={`${Math.round(stats.consentRate * 100)}%`}
            hint={`avg time on page ${duration(stats.avgDurationMs)}`}
            icon={<MapPin className="size-4" />}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <ChartCard
            title="Views and visitors"
            description={`Daily totals for the last ${days} days.`}
            className="col-span-2"
          >
            <AreaChart
              labels={traffic.labels}
              series={[
                { name: "Views", values: traffic.values.map((r) => r[0] ?? 0), color: "var(--chart-1)" },
                { name: "Visitors", values: traffic.values.map((r) => r[1] ?? 0), color: "var(--chart-2)" },
              ]}
              height={280}
            />
          </ChartCard>
          <ChartCard title="Time of day" description="Page views by hour (UTC).">
            <ColumnChart
              labels={Array.from({ length: 24 }, (_, h) => String(h))}
              values={hourly}
              height={280}
              formatLabel={(l) => `${l.padStart(2, "0")}h`}
            />
          </ChartCard>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <ChartCard title="Top pages">
            <BarList items={stats.topPages} limit={10} />
          </ChartCard>
          <ChartCard title="Referrers" description="Where visitors came from.">
            <BarList
              items={stats.topReferrers}
              format={referrerLabel}
              limit={10}
              color="var(--chart-2)"
              empty="Only direct traffic so far"
            />
          </ChartCard>
          <div className="grid gap-4">
            <ChartCard title="Devices">
              <SegmentBar
                items={stats.devices}
                colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]}
              />
            </ChartCard>
            <ChartCard title="Countries">
              <BarList items={stats.topCountries} limit={6} color="var(--chart-3)" />
            </ChartCard>
          </div>
        </div>

        {(stats.topCities.length > 0 || stats.locationPoints.length > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <ChartCard title="Cities" description="From consented locations.">
              <BarList items={stats.topCities} limit={8} color="var(--chart-3)" />
            </ChartCard>
            <ChartCard
              title="Shared locations"
              description="Approximate points, rounded to ~1 km."
              className="col-span-2"
            >
              <div className="flex flex-wrap gap-2">
                {stats.locationPoints.slice(0, 60).map((p) => (
                  <a
                    key={`${p.latitude}-${p.longitude}`}
                    href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-fg-muted transition hover:border-line-strong hover:text-fg"
                  >
                    {[p.city, p.country].filter(Boolean).join(", ") || `${p.latitude}, ${p.longitude}`}
                    <span className="font-mono text-fg">{p.count}</span> <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={visits.data?.items}
            loading={visits.isLoading}
            rowKey={(v) => v.id}
            meta={visits.data?.meta}
            onPage={setPage}
            empty="No visits recorded yet"
            dense
          />
        </div>
      </div>
    </>
  );
}
