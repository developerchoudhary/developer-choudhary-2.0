import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "default" | "tight";
}

/** A page section with a consistent header: eyebrow, display title, optional lede and a right-aligned action. */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  action,
  children,
  className,
  size = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("container-dc", size === "tight" ? "py-12 sm:py-16" : "py-16 sm:py-24", className)}
    >
      {(title || eyebrow) && (
        <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && <h2 className="display text-balance text-3xl sm:text-5xl">{title}</h2>}
            {lede && <p className="mt-4 max-w-xl text-pretty text-base text-fg-muted sm:text-lg">{lede}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Inner-page header: sits directly below the site header. */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px] dark:bg-accent/10"
        aria-hidden="true"
      />
      <div
        className={cn(
          "container-dc relative pt-14 pb-10 sm:pt-24 sm:pb-16",
          align === "center" && "flex flex-col items-center text-center",
        )}
      >
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-balance text-4xl sm:text-6xl lg:text-7xl">{title}</h1>
        {lede && (
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-fg-muted sm:text-xl">
            {lede}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
