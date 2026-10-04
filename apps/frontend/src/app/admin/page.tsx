"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { StatCard, StatusBadge } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/misc";
import { useOne } from "@/lib/admin/hooks";
import type { Dashboard } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useOne<Dashboard>("/dashboard");
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  const maxViews = Math.max(1, ...data.visits.daily.map((d) => d.views));
  return (
    <>
      <PageHeader title="Dashboard" description="What happened on the site recently." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New leads"
          value={data.leads.byStatus.new ?? 0}
          hint={`${data.leads.last7Days} in the last 7 days`}
        />
        <StatCard label="Reviews pending" value={data.reviewsPending} hint="awaiting moderation" />
        <StatCard
          label="Views (30d)"
          value={data.visits.views30d}
          hint={`${data.visits.visitors30d} unique visitors`}
        />
        <StatCard
          label="Today"
          value={data.visits.viewsToday}
          hint={`${Math.round(data.visits.consentRate * 100)}% shared location`}
        />
        <StatCard
          label="Published posts"
          value={data.content.postsPublished}
          hint={`${data.content.postsDraft} drafts · ${data.content.postsScheduled} scheduled`}
        />
        <StatCard label="Projects live" value={data.content.projectsPublished} />
        <StatCard
          label="Emails sent (24h)"
          value={data.outbox.sent24h}
          hint={`${data.outbox.pending} pending · ${data.outbox.failed} failed`}
        />
        <StatCard
          label="Won deals"
          value={data.leads.byStatus.won ?? 0}
          hint={`${data.leads.total} leads total`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent leads</h2>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
            >
              All leads <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-muted">
              No leads yet. Share the site and they will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentLeads.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:text-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {l.firstName} {l.lastName}{" "}
                        {l.company && <span className="text-fg-muted">· {l.company}</span>}
                      </p>
                      <p className="truncate text-xs text-fg-muted">{l.serviceInterest || l.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-fg-muted">
                      <StatusBadge value={l.status} />
                      {formatDate(l.createdAt)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Views · last 30 days</h2>
          <div className="flex h-32 items-end gap-0.5">
            {data.visits.daily.map((d) => (
              <div
                key={d.day}
                title={`${d.day}: ${d.views} views`}
                className="flex-1 rounded-t bg-accent/70 hover:bg-accent"
                style={{ height: `${Math.max(4, (d.views / maxViews) * 100)}%` }}
              />
            ))}
          </div>
          <h3 className="mt-6 mb-2 text-xs uppercase tracking-wider text-fg-subtle">Top pages</h3>
          <ul className="space-y-1.5 text-sm">
            {data.visits.topPages.slice(0, 5).map((p) => (
              <li key={p.label} className="flex justify-between gap-3">
                <span className="truncate text-fg-muted">{p.label}</span>
                <span className="font-mono text-xs">{p.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
