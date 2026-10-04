import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-bg-muted", className)} />;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center dot-bg",
        className,
      )}
    >
      {icon && (
        <span className="mb-2 inline-flex size-12 items-center justify-center rounded-2xl border border-line bg-bg-elevated text-fg-muted">
          {icon}
        </span>
      )}
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Stars({
  rating,
  size = "size-4",
  className,
}: {
  rating: number;
  size?: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={cn(size, n <= rating ? "fill-accent" : "fill-line-strong")}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function Avatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return src ? (
    // biome-ignore lint/performance/noImgElement: avatars are tiny remote images with unknown dimensions
    <img src={src} alt={name} className={cn("size-10 rounded-full object-cover", className)} loading="lazy" />
  ) : (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent",
        className,
      )}
    >
      {letters}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-fg-muted border-t-transparent",
        className,
      )}
    />
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-muted">
      {children}
    </kbd>
  );
}
