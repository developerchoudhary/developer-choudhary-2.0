import { ArrowUpRight } from "lucide-react";
import type { Experience } from "@/lib/types";
import { formatMonth } from "@/lib/utils";
import { Reveal } from "./reveal";

export function ExperienceTimeline({ items, compact }: { items: Experience[]; compact?: boolean }) {
  return (
    <ol className="relative border-l border-line pl-8 sm:pl-12">
      {items.map((xp, i) => (
        <li key={xp.id} className="relative pb-12 last:pb-0">
          <span
            className={`absolute -left-[calc(2rem+5px)] sm:-left-[calc(3rem+5px)] top-2 size-2.5 rounded-full ${xp.isCurrent ? "bg-accent ring-4 ring-accent-soft" : "bg-line-strong"}`}
          />
          <Reveal delay={Math.min(i * 0.05, 0.3)}>
            <p className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
              {formatMonth(xp.startedAt)} — {xp.isCurrent ? "Present" : formatMonth(xp.endedAt)}
              {xp.location && (
                <span>
                  {" "}
                  · {xp.location}
                  {xp.isRemote ? " · Remote" : ""}
                </span>
              )}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{xp.role}</h3>
            <p className="mt-1 text-fg-muted">
              {xp.companyUrl ? (
                <a
                  href={xp.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 link-underline"
                >
                  {xp.company} <ArrowUpRight className="size-3.5" />
                </a>
              ) : (
                xp.company
              )}
              <span className="text-fg-subtle"> · {xp.employmentType}</span>
            </p>
            {xp.summary && <p className="mt-4 max-w-2xl text-fg-muted">{xp.summary}</p>}
            {!compact && (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {xp.responsibilities.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">What I did</p>
                    <ul className="space-y-2 text-sm text-fg-muted">
                      {xp.responsibilities.map((r) => (
                        <li key={r} className="flex gap-2">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {xp.achievements.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Outcomes</p>
                    <ul className="space-y-2 text-sm text-fg-muted">
                      {xp.achievements.map((a) => (
                        <li key={a} className="flex gap-2">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-highlight" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {xp.technologies.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {xp.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-line px-2 py-0.5 font-mono text-[0.68rem] text-fg-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
