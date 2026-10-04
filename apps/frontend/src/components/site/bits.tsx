import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PageMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Pagination({ meta, hrefFor }: { meta: PageMeta; hrefFor: (page: number) => string }) {
  if (meta.totalPages <= 1) return null;
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.currentPage) <= 1,
  );
  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PageLink href={meta.currentPage > 1 ? hrefFor(meta.currentPage - 1) : null} label="Previous page">
        <ArrowLeft className="size-4" />
      </PageLink>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-fg-subtle">…</span>}
            <Link
              href={hrefFor(p)}
              aria-current={p === meta.currentPage ? "page" : undefined}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl border text-sm transition",
                p === meta.currentPage
                  ? "border-fg bg-fg text-bg"
                  : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      <PageLink
        href={meta.currentPage < meta.totalPages ? hrefFor(meta.currentPage + 1) : null}
        label="Next page"
      >
        <ArrowRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const cls = "inline-flex size-10 items-center justify-center rounded-xl border border-line text-fg-muted";
  if (!href) return <span className={cn(cls, "opacity-40")}>{children}</span>;
  return (
    <Link href={href} aria-label={label} className={cn(cls, "hover:border-line-strong hover:text-fg")}>
      {children}
    </Link>
  );
}

export function TechList({
  items,
  max = 4,
  className,
}: {
  items: string[];
  max?: number;
  className?: string;
}) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((t) => (
        <li
          key={t}
          className="rounded-md border border-line bg-bg-muted/50 px-2 py-0.5 font-mono text-[0.68rem] text-fg-muted"
        >
          {t}
        </li>
      ))}
      {rest > 0 && <li className="px-1 py-0.5 font-mono text-[0.68rem] text-fg-subtle">+{rest}</li>}
    </ul>
  );
}

export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-fg transition-colors hover:text-accent",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
