"use client";

import {
  ArrowUpRight,
  Eye,
  FileText,
  FolderKanban,
  Inbox,
  Mail,
  MessageSquareQuote,
  Newspaper,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { StatCard, StatusBadge } from "@/components/admin/bits";
import {
  AreaChart,
  BarList,
  ChartCard,
  fillDays,
  percentDelta,
  SegmentBar,
  Sparkline,
} from "@/components/admin/charts";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/admin/auth";
import { useOne } from "@/lib/admin/hooks";
import type { Dashboard } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

const LEAD_ORDER = ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useOne<Dashboard>("/dashboard");

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-28" />
          ))}
          <Skeleton className="col-span-3 h-80" />
          <Skeleton className="h-80" />
        </div>
      </>
    );
  }

  const v = data.visits;
  const traffic = fillDays(v.daily, v.rangeDays, (r) => [r?.views ?? 0, r?.visitors ?? 0]);
  const leadsDaily = fillDays(data.leads.daily, 30, (r) => [r?.count ?? 0]);
  const pipeline = LEAD_ORDER.filter((s) => s !== "spam").map((s) => ({
    label: s,
    count: data.leads.byStatus[s] ?? 0,
  }));
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  );

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`${greeting()}, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Here is what happened on developerchoudhary.com recently."
        actions={
          <>
            <LinkButton href="/admin/projects/new" variant="secondary" size="sm">
              <Plus className="size-4" /> Project
            </LinkButton>
            <LinkButton href="/admin/blog/new" variant="secondary" size="sm">
              <Plus className="size-4" /> Post
            </LinkButton>
            <LinkButton href="/admin/leads" size="sm">
              <Inbox className="size-4" /> Inbox
              {(data.leads.byStatus.new ?? 0) > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 text-[0.65rem] font-semibold text-accent-fg">
                  {data.leads.byStatus.new}
                </span>
              )}
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Page views · 30d"
          value={formatNumber(v.views)}
          delta={percentDelta(v.views, v.prevViews)}
          hint="vs previous 30 days"
          icon={<Eye className="size-4" />}
          trend={<Sparkline values={traffic.values.map((r) => r[0] ?? 0)} />}
        />
        <StatCard
          label="Unique visitors · 30d"
          value={formatNumber(v.visitors)}
          delta={percentDelta(v.visitors, v.prevVisitors)}
          hint={`${v.viewsToday} views today`}
          icon={<Users className="size-4" />}
          trend={<Sparkline values={traffic.values.map((r) => r[1] ?? 0)} color="var(--chart-2)" />}
        />
        <StatCard
          label="Leads · 30d"
          value={formatNumber(data.leads.last30Days)}
          hint={`${data.leads.byStatus.new ?? 0} new · ${data.leads.byStatus.won ?? 0} won all-time`}
          icon={<Inbox className="size-4" />}
          trend={<Sparkline values={leadsDaily.values.map((r) => r[0] ?? 0)} color="var(--chart-3)" />}
        />
        <StatCard
          label="Needs attention"
          value={data.reviewsPending + data.outbox.failed}
          hint={`${data.reviewsPending} reviews pending · ${data.outbox.failed} emails failed`}
          icon={<MessageSquareQuote className="size-4" />}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <ChartCard
          title="Traffic"
          description="Daily page views and unique visitors for the last 30 days."
          className="col-span-2"
          action={
            <Link
              href="/admin/visitors"
              className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
            >
              Full analytics <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          <AreaChart
            labels={traffic.labels}
            series={[
              { name: "Views", values: traffic.values.map((r) => r[0] ?? 0), color: "var(--chart-1)" },
              { name: "Visitors", values: traffic.values.map((r) => r[1] ?? 0), color: "var(--chart-2)" },
            ]}
            height={260}
          />
        </ChartCard>
        <ChartCard title="Lead pipeline" description={`${data.leads.total} leads all-time`}>
          <BarList
            items={pipeline}
            format={(l) => l.charAt(0).toUpperCase() + l.slice(1)}
            max={Math.max(1, ...pipeline.map((p) => p.count))}
          />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <ChartCard title="Top pages" description="Most viewed in the last 30 days.">
          <BarList items={v.topPages} limit={6} />
        </ChartCard>
        <ChartCard title="Countries" description="Based on consented location or network hints.">
          <BarList items={v.topCountries} limit={6} color="var(--chart-2)" />
        </ChartCard>
        <ChartCard title="Devices" description="Share of page views by device class.">
          <SegmentBar items={v.devices} colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <section className="card col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent leads</h2>
              <p className="mt-0.5 text-xs text-fg-muted">The last six enquiries from the contact form.</p>
            </div>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
            >
              All leads <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <p className="dot-bg rounded-xl py-10 text-center text-sm text-fg-muted">
              No leads yet. Share the site and they will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentLeads.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition hover:text-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {l.firstName} {l.lastName}
                        {l.company && <span className="text-fg-muted"> · {l.company}</span>}
                      </p>
                      <p className="truncate text-xs text-fg-muted">{l.serviceInterest || l.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-fg-muted">
                      <StatusBadge value={l.status} />
                      <span className="tabular">{formatDate(l.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="text-sm font-semibold">Content & system</h2>
          <p className="mt-0.5 text-xs text-fg-muted">What is live and what is queued.</p>
          <ul className="mt-4 space-y-3 text-sm">
            <Row
              icon={<Newspaper className="size-4" />}
              label="Published posts"
              value={data.content.postsPublished}
              hint={`${data.content.postsDraft} drafts · ${data.content.postsScheduled} scheduled`}
              href="/admin/blog"
            />
            <Row
              icon={<FolderKanban className="size-4" />}
              label="Live projects"
              value={data.content.projectsPublished}
              href="/admin/projects"
            />
            <Row
              icon={<MessageSquareQuote className="size-4" />}
              label="Reviews pending"
              value={data.reviewsPending}
              href="/admin/reviews"
            />
            <Row
              icon={<Mail className="size-4" />}
              label="Emails sent · 24h"
              value={data.outbox.sent24h}
              hint={`${data.outbox.pending} pending · ${data.outbox.failed} failed`}
            />
            <Row
              icon={<FileText className="size-4" />}
              label="Resume"
              value="Generate"
              href="/admin/resume"
            />
          </ul>
        </section>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-muted text-fg-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block truncate text-xs text-fg-muted">{hint}</span>}
      </span>
      <span className="font-semibold tabular">{value}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <Link
          href={href}
          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-bg-muted/60"
        >
          {inner}
        </Link>
      ) : (
        <div className="-mx-2 flex items-center gap-3 px-2 py-1.5">{inner}</div>
      )}
    </li>
  );
}
