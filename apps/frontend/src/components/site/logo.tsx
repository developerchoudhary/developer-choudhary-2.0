import Link from "next/link";
import { useId } from "react";
import { DEFAULT_BRAND, LOGO_C_PATH, LOGO_D_PATH } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The DC mark on its gradient tile (geometry in lib/brand.ts). The colours are the theme's
 * --brand-from/--brand-to, so the logo follows the theme chosen in the admin; `colors` draws it
 * in other colours (theme swatches in the admin).
 */
export function LogoMark({
  className,
  title = "Developer Choudhary",
  colors,
}: {
  className?: string;
  title?: string;
  colors?: { from: string; to: string };
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop
            offset="0"
            style={{ stopColor: colors?.from ?? `var(--brand-from, ${DEFAULT_BRAND.from})` }}
          />
          <stop offset="1" style={{ stopColor: colors?.to ?? `var(--brand-to, ${DEFAULT_BRAND.to})` }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d={LOGO_D_PATH} fill="#fff" />
      <path d={LOGO_C_PATH} fill="none" stroke={`url(#${id})`} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ name = "Developer Choudhary", className }: { name?: string; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${name}, home`}>
      <LogoMark className="size-8 shrink-0" title={name} />
      <span className="text-[0.95rem] font-semibold tracking-tight text-fg">{name}</span>
    </Link>
  );
}
