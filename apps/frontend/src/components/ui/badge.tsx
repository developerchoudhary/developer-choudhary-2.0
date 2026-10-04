import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "highlight" | "success" | "danger" | "muted";

const tones: Record<Tone, string> = {
  neutral: "border-line text-fg-muted",
  accent: "border-transparent bg-accent-soft text-accent",
  highlight: "border-transparent bg-highlight/20 text-fg",
  success: "border-transparent bg-success/15 text-success",
  danger: "border-transparent bg-danger/15 text-danger",
  muted: "border-transparent bg-bg-muted text-fg-muted",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-bg-elevated px-2 py-0.5 font-mono text-[0.7rem] text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
