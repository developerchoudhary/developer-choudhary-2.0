import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Home">
      <span className="relative inline-flex size-8 items-center justify-center overflow-hidden rounded-lg bg-accent text-accent-fg shadow-glow">
        <span className="font-display text-[0.95rem] font-bold tracking-tight">DC</span>
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
      </span>
      {!compact && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-fg">
          Developer <span className="text-fg-muted group-hover:text-fg transition-colors">Choudhary</span>
        </span>
      )}
    </Link>
  );
}
