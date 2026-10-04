import { ArrowUpRight } from "lucide-react";
import type { Experience } from "@/lib/types";
import { formatMonth } from "@/lib/utils";
import { TechList } from "./bits";
import { Reveal } from "./reveal";

export function ExperienceTimeline({ items, compact }: { items: Experience[]; compact?: boolean }) {
  return (
    <ol className="relative border-l border-line pl-7 sm:pl-10">
      {items.map((xp, i) => (
        <li key={xp.id} className="relative pb-12 last:pb-0">
          <span
            className={`absolute -left-[calc(1.75rem+5px)] top-2 size-2.5 rounded-full sm:-left-[calc(2.5rem+5px)] ${xp.isCurrent ? "bg-accent ring-4 ring-accent-soft" : "bg-line-strong"}`}
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
            <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{xp.role}</h3>
            <p className="mt-1 text-fg-muted">
              {xp.companyUrl ? (
                <a
                  href={xp.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-1 text-fg"
                >
                  {xp.company} <ArrowUpRight className="size-3.5" />
                </a>
              ) : (
                <span className="text-fg">{xp.company}</span>
              )}
              <span className="text-fg-subtle"> · {xp.employmentType}</span>
            </p>
            {xp.summary && <p className="mt-4 max-w-2xl text-fg-muted">{xp.summary}</p>}
            {!compact && (xp.achievements.length > 0 || xp.responsibilities.length > 0) && (
              <ul className="mt-5 grid gap-2 text-sm text-fg-muted sm:grid-cols-2">
                {(xp.achievements.length > 0 ? xp.achievements : xp.responsibilities).slice(0, 6).map((a) => (
                  <li key={a} className="flex gap-2.5">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
            <TechList items={xp.technologies} max={compact ? 6 : 12} className="mt-5" />
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
