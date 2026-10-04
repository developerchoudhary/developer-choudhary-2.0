import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The DC mark: a solid D with a lowercase c cut out of its counter.
 * `tile` draws it on the orange rounded square (app icon / favicon);
 * `glyph` draws only the letterform in currentColor for use on any background.
 */
export const LOGO_D_PATH = "M18 14h9a18 18 0 0 1 0 36h-9z";
export const LOGO_C_PATH = "M38.36 27.4a6 6 0 1 0 0 9.2";

export function LogoMark({
  className,
  variant = "tile",
  title = "Developer Choudhary",
}: {
  className?: string;
  variant?: "tile" | "glyph";
  title?: string;
}) {
  const id = useId();
  if (variant === "glyph") {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
        <title>{title}</title>
        <mask id={id}>
          <rect width="64" height="64" fill="#fff" />
          <path d={LOGO_C_PATH} fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" />
        </mask>
        <path d={LOGO_D_PATH} fill="currentColor" mask={`url(#${id})`} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="64" height="64" rx="16" className="fill-accent" />
      <path d={LOGO_D_PATH} className="fill-accent-fg" />
      <path d={LOGO_C_PATH} fill="none" className="stroke-accent" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Home">
      <LogoMark className="size-8 shrink-0 drop-shadow-[0_6px_16px_rgba(249,115,22,0.35)]" />
      {!compact && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-fg">
          Developer <span className="text-fg-muted transition-colors group-hover:text-fg">Choudhary</span>
        </span>
      )}
    </Link>
  );
}
