import { SKILL_CATEGORY_LABELS } from "@/lib/site";
import type { SkillGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SkillsGrid({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, i) => (
        <Reveal key={group.category} delay={Math.min(i * 0.05, 0.3)}>
          <div className="card h-full p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="eyebrow">{SKILL_CATEGORY_LABELS[group.category] ?? group.category}</p>
              <span className="font-mono text-xs text-fg-subtle">{group.skills.length}</span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm",
                    s.isFeatured
                      ? "border-accent/40 bg-accent-soft text-fg"
                      : "border-line bg-bg-muted/40 text-fg-muted",
                  )}
                  title={s.years > 0 ? `${s.years} years` : undefined}
                >
                  {s.name}
                  {s.years > 0 && <span className="font-mono text-[0.65rem] text-fg-subtle">{s.years}y</span>}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
