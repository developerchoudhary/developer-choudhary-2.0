import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionProps {
  id?: string;
  number?: string;
  eyebrow?: string;
  title: ReactNode;
  lede?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Section({ id, number, eyebrow, title, lede, action, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("container-dc py-16 sm:py-24", className)}>
      <Reveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {(eyebrow || number) && (
              <p className="eyebrow mb-4 flex items-center gap-3">
                {number && <span className="text-accent">{number}</span>}
                {eyebrow}
              </p>
            )}
            <h2 className="display text-4xl sm:text-5xl">{title}</h2>
            {lede && <p className="mt-4 text-lg text-fg-muted">{lede}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </Reveal>
      {children && <div className="mt-10 sm:mt-14">{children}</div>}
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="container-dc pt-14 pb-10 sm:pt-20 sm:pb-14">
      <Reveal>
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {lede && <p className="mt-6 max-w-2xl text-lg text-fg-muted sm:text-xl">{lede}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Reveal>
    </section>
  );
}
