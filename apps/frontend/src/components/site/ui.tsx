import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PROJECT_STATUS_LABELS } from "@/lib/site";
import type { PageMeta, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors duration-200 select-none";
const buttonVariants: Record<Variant, string> = {
  // Colours come from the --btn-* tokens in globals.css.
  primary: "btn-primary",
  secondary: "border border-line-strong bg-bg-elevated/70 text-fg hover:border-fg/30 hover:bg-bg-elevated",
  ghost: "text-fg-muted hover:bg-bg-muted hover:text-fg",
};
const buttonSizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "lg", className?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/** A link styled as a button. External, mailto: and tel: links render a plain anchor. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "lg",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  const cls = buttonClass(variant, size, className);
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** "All projects →" style text link. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {children}
    </Link>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-line bg-bg-elevated px-2.5 py-1 text-[0.8rem] text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TagList({ items, max, className }: { items: string[]; max?: number; className?: string }) {
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {shown.map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
      {rest > 0 && (
        <li>
          <Tag className="text-fg-subtle">+{rest}</Tag>
        </li>
      )}
    </ul>
  );
}

const statusTone: Record<ProjectStatus, string> = {
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "in-progress": "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  upcoming: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusTone[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

/** Title + optional lede, with an optional link aligned to the right (moved below on mobile). */
export function Section({
  id,
  title,
  lede,
  action,
  children,
  className,
}: {
  id?: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20", className)}>
      <div className="container-dc">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <div>
            <h2 className="display text-balance text-[1.75rem] sm:text-[2.25rem]">{title}</h2>
            {lede && <p className="mt-3 max-w-xl text-pretty text-fg-muted">{lede}</p>}
          </div>
          {action && <div className="hidden shrink-0 pb-1 sm:block">{action}</div>}
        </div>
        {children}
        {action && <div className="mt-8 sm:hidden">{action}</div>}
      </div>
    </section>
  );
}

/** The heading block at the top of every inner page. */
export function PageHeader({
  title,
  lede,
  back,
  children,
}: {
  title: ReactNode;
  lede?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header className="container-dc pt-12 pb-10 sm:pt-20 sm:pb-12">
      {back && (
        <div className="mb-8">
          <BackLink href={back.href}>{back.label}</BackLink>
        </div>
      )}
      <h1 className="display rise max-w-3xl text-balance text-[2.5rem] sm:text-[3.25rem]">{title}</h1>
      {lede && (
        <p
          className="rise mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-fg-muted"
          style={{ "--delay": "80ms" } as React.CSSProperties}
        >
          {lede}
        </p>
      )}
      {children && (
        <div className="rise mt-8" style={{ "--delay": "140ms" } as React.CSSProperties}>
          {children}
        </div>
      )}
    </header>
  );
}

/** Text tabs used as filters (work types, blog categories). */
export function FilterTabs({
  items,
  label,
}: {
  items: Array<{ href: string; label: string; active: boolean; count?: number }>;
  label: string;
}) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex gap-1.5 sm:flex-wrap">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                item.active
                  ? "border-transparent bg-fg text-bg"
                  : "border-line bg-bg-elevated/60 text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className={cn("tabular text-xs", item.active ? "text-bg/70" : "text-fg-subtle")}>
                  {item.count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Pagination({ meta, hrefFor }: { meta: PageMeta; hrefFor: (page: number) => string }) {
  if (meta.totalPages <= 1) return null;
  const { currentPage: page, totalPages: total } = meta;
  const item =
    "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl border border-line bg-bg-elevated px-3 text-sm font-medium transition-colors hover:border-line-strong";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={item} rel="prev">
          <ChevronLeft className="size-4" /> Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-fg-subtle tabular">
        Page {page} of {total}
      </span>
      {page < total ? (
        <Link href={hrefFor(page + 1)} className={item} rel="next">
          Older <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">{children}</div>}
    </div>
  );
}
