import { SKILL_CATEGORY_LABELS } from "@/lib/site";
import type { SkillGroup } from "@/lib/types";
import { Reveal } from "./reveal";

export function SkillsGrid({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, i) => (
        <Reveal key={group.category} delay={Math.min(i * 0.05, 0.3)}>
          <div className="card h-full p-6">
            <p className="eyebrow mb-4">{SKILL_CATEGORY_LABELS[group.category] ?? group.category}</p>
            <ul className="space-y-3">
              {group.skills.map((s) => (
                <li key={s.id}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono text-xs text-fg-subtle">
                      {s.years > 0 ? `${s.years}y` : ""}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${s.proficiency}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
