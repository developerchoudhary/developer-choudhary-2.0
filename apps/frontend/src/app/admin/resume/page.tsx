"use client";

import { Download, Eye, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmButton, FormCard, StatusBadge } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAction, useAll, useOne, useRemove } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { Resume, ResumeOptions } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";

interface Templates {
  templates: string[];
  defaultOptions: ResumeOptions;
  defaultAccent: string;
}

export default function ResumePage() {
  const meta = useOne<Templates>("/resumes/templates");
  const list = useAll<Resume>("/resumes");
  const [template, setTemplate] = useState("modern");
  const [label, setLabel] = useState("");
  const [accent, setAccent] = useState("#0E7C66");
  const [options, setOptions] = useState<ResumeOptions | null>(null);
  const [preview, setPreview] = useState("");
  const opts = options ?? meta.data?.defaultOptions ?? null;
  const payload = () => ({ template, label, accentColor: accent, options: opts });

  const doPreview = useAction(() => admin.previewHtml("/resumes/preview", payload()), {
    onSuccess: (html) => setPreview(html),
  });
  const generate = useAction(() => admin.post<Resume>("/resumes", payload()), {
    invalidate: ["/resumes"],
    success: "Resume generated and published",
  });
  const setCurrent = useAction((id: string) => admin.post(`/resumes/${id}/current`), {
    invalidate: ["/resumes"],
    success: "This version is now live",
  });
  const remove = useRemove("/resumes");

  if (meta.isLoading || !opts) return <Skeleton className="h-96" />;
  const set = (patch: Partial<ResumeOptions>) => setOptions({ ...opts, ...patch });

  return (
    <>
      <PageHeader
        title="Resume generator"
        description="Builds a PDF from your live profile, experience, skills and projects. Every generation is versioned; the current one is served at /resume."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <FormCard title="Template">
            <div className="grid grid-cols-3 gap-2">
              {(meta.data?.templates ?? []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemplate(t)}
                  className={`rounded-xl border p-3 text-sm capitalize transition ${template === t ? "border-accent bg-accent-soft text-accent" : "border-line hover:bg-bg-muted"}`}
                >
                  <FileText className="mx-auto mb-1 size-5" /> {t}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Accent colour">
                <Input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value.toUpperCase())}
                  className="h-10 p-1"
                />
              </Field>
              <Field label="Version label" hint="optional">
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Backend roles 2026"
                />
              </Field>
            </div>
          </FormCard>
          <FormCard title="Content">
            <Field label="Target role" hint="replaces your headline">
              <Input
                value={opts.targetRole}
                onChange={(e) => set({ targetRole: e.target.value })}
                placeholder="Senior Full-Stack Engineer"
              />
            </Field>
            <Field label="Custom summary" hint="leave blank to use the profile summary">
              <Textarea
                rows={4}
                value={opts.customSummary}
                onChange={(e) => set({ customSummary: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Max experience entries">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={opts.maxExperience}
                  onChange={(e) => set({ maxExperience: Number(e.target.value) })}
                />
              </Field>
              <Field label="Max projects">
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={opts.maxProjects}
                  onChange={(e) => set({ maxProjects: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Switch
                checked={opts.includeProjects}
                onChange={(v) => set({ includeProjects: v })}
                label="Projects"
              />
              <Switch
                checked={opts.includeEducation}
                onChange={(v) => set({ includeEducation: v })}
                label="Education"
              />
              <Switch
                checked={opts.includeCertifications}
                onChange={(v) => set({ includeCertifications: v })}
                label="Certifications"
              />
              <Switch
                checked={opts.includeStats}
                onChange={(v) => set({ includeStats: v })}
                label="Stats sidebar"
              />
              <Switch checked={opts.includePhoto} onChange={(v) => set({ includePhoto: v })} label="Photo" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => doPreview.mutate()}
                loading={doPreview.isPending}
              >
                <Eye className="size-4" /> Preview
              </Button>
              <Button type="button" onClick={() => generate.mutate()} loading={generate.isPending}>
                <Sparkles className="size-4" /> Generate PDF
              </Button>
            </div>
          </FormCard>
        </div>
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-3 text-sm font-semibold">Preview</div>
            {preview ? (
              <iframe
                title="Resume preview"
                srcDoc={preview}
                sandbox=""
                className="h-[80vh] w-full bg-white"
              />
            ) : (
              <div className="flex h-96 items-center justify-center text-sm text-fg-muted">
                Click Preview to render the HTML before generating the PDF.
              </div>
            )}
          </section>
          <section className="card">
            <div className="border-b border-line px-5 py-3 text-sm font-semibold">Versions</div>
            {list.isLoading ? (
              <Skeleton className="m-4 h-24" />
            ) : (list.data ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-fg-muted">No resume generated yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {(list.data ?? []).map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        v{r.version} · <span className="capitalize">{r.template}</span>
                        {r.label ? ` · ${r.label}` : ""}
                      </p>
                      <p className="text-xs text-fg-muted">
                        {formatDate(r.createdAt, { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                        {formatBytes(r.fileSize)} · {r.downloadCount} downloads
                      </p>
                    </div>
                    {r.isCurrent ? (
                      <StatusBadge value="published" />
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setCurrent.mutate(r.id)}>
                        Make current
                      </Button>
                    )}
                    <a
                      href={r.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-8 items-center justify-center rounded-full border border-line text-fg-muted hover:text-fg"
                      aria-label="Download"
                    >
                      <Download className="size-4" />
                    </a>
                    {!r.isCurrent && (
                      <ConfirmButton
                        label=""
                        onConfirm={() =>
                          remove.mutate(r.id, { onError: () => toast.error("Could not delete") })
                        }
                        pending={remove.isPending}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
