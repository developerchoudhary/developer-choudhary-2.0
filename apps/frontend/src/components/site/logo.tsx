import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-baseline gap-2 text-fg", className)}
      aria-label="Developer Choudhary, home"
    >
      <span className="display text-2xl italic leading-none">
        DC<span className="text-accent">.</span>
      </span>
      {!compact && (
        <span className="hidden text-sm font-medium tracking-tight text-fg-muted group-hover:text-fg transition-colors sm:inline">
          Developer Choudhary
        </span>
      )}
    </Link>
  );
}
