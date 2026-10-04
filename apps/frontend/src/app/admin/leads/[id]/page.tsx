"use client";

import { ArrowLeft, ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmButton, StatusBadge } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAction, useItem, useRemove } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statuses = ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"];

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: lead, isLoading } = useItem<Lead>("/leads", id);
  const [note, setNote] = useState("");
  const update = useAction((body: { status: string; priority: string }) => admin.put(`/leads/${id}`, body), {
    invalidate: ["/leads"],
    success: "Lead updated",
  });
  const addNote = useAction((body: string) => admin.post(`/leads/${id}/notes`, { body }), {
    invalidate: ["/leads"],
    success: "Note added",
    onSuccess: () => setNote(""),
  });
  const remove = useRemove("/leads");

  if (isLoading || !lead) return <Skeleton className="h-96" />;
  const name = `${lead.firstName} ${lead.lastName}`.trim();
  const whatsapp = lead.phone.replace(/\D/g, "");
  const maps =
    lead.latitude && lead.longitude
      ? `https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`
      : null;

  return (
    <>
      <Link
        href="/admin/leads"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> All leads
      </Link>
      <PageHeader
        title={name}
        description={`Received ${formatDate(lead.createdAt, { dateStyle: "medium", timeStyle: "short" })}${lead.sourcePage ? ` from ${lead.sourcePage}` : ""}`}
        actions={
          <ConfirmButton
            onConfirm={() => remove.mutate(id, { onSuccess: () => router.replace("/admin/leads") })}
            pending={remove.isPending}
          />
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="card p-6">
            <p className="eyebrow mb-3">Message</p>
            <p className="whitespace-pre-wrap leading-relaxed">{lead.message}</p>
            <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-3">
              {[
                ["Looking for", lead.serviceInterest],
                ["Budget", lead.budgetRange],
                ["Timeline", lead.timeline],
                ["Company", lead.company],
                ["Website", lead.website],
                ["Project type", lead.projectType],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-fg-subtle">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="card p-6">
            <p className="eyebrow mb-3">Notes</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (note.trim()) addNote.mutate(note.trim());
              }}
              className="flex gap-2"
            >
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Called, sent proposal, follow up Monday…"
                className="min-h-0"
              />
              <Button type="submit" loading={addNote.isPending} className="self-end">
                Add
              </Button>
            </form>
            <ul className="mt-5 space-y-3">
              {(lead.notes ?? []).map((n) => (
                <li key={n.id} className="rounded-xl bg-bg-muted/60 px-4 py-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <p className="mt-1 text-xs text-fg-subtle">
                    {formatDate(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
              {(lead.notes ?? []).length === 0 && <li className="text-sm text-fg-muted">No notes yet.</li>}
            </ul>
          </section>
        </div>
        <div className="space-y-6">
          <section className="card p-6">
            <p className="eyebrow mb-4">Pipeline</p>
            <div className="grid gap-4">
              <Field label="Status">
                <Select
                  value={lead.status}
                  onChange={(e) => update.mutate({ status: e.target.value, priority: lead.priority })}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority">
                <Select
                  value={lead.priority}
                  onChange={(e) => update.mutate({ status: lead.status, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </Select>
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-1 text-xs text-fg-muted">
              <StatusBadge value={lead.status} />
              {lead.contactedAt && <span>contacted {formatDate(lead.contactedAt)}</span>}
              {lead.closedAt && <span>· closed {formatDate(lead.closedAt)}</span>}
            </div>
          </section>
          <section className="card p-6">
            <p className="eyebrow mb-4">Reach out</p>
            <div className="space-y-2 text-sm">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-accent">
                  <Mail className="size-4" /> {lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-accent">
                  <Phone className="size-4" /> {lead.phone}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
            </div>
          </section>
          <section className="card p-6">
            <p className="eyebrow mb-4">Location & device</p>
            <div className="space-y-2 text-sm text-fg-muted">
              <p className="flex items-center gap-2">
                <MapPin className="size-4" />{" "}
                {[lead.city, lead.region, lead.country].filter(Boolean).join(", ") || "Not shared"}
                {lead.consentLocation && <span className="text-xs text-success">· consented</span>}
              </p>
              {lead.timezone && <p>Timezone: {lead.timezone}</p>}
              {maps && (
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Open in Google Maps <ExternalLink className="size-3.5" />
                </a>
              )}
              {lead.referrer && <p className="truncate">Referrer: {lead.referrer}</p>}
              {Object.keys(lead.utm).length > 0 && (
                <p>
                  UTM:{" "}
                  {Object.entries(lead.utm)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ")}
                </p>
              )}
              <p className="truncate text-xs" title={lead.userAgent}>
                {lead.userAgent}
              </p>
              <p className="text-xs">IP {lead.ipAddress}</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
