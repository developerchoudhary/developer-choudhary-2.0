import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "accent" | "warning" | "success" | "danger" | "info" | "muted";

const tones: Record<Tone, string> = {
  neutral: "border-line text-fg-muted bg-bg-elevated",
  accent: "border-transparent bg-accent-soft text-accent",
  warning: "border-transparent bg-warning/12 text-warning",
  success: "border-transparent bg-success/12 text-success",
  danger: "border-transparent bg-danger/12 text-danger",
  info: "border-transparent bg-info/12 text-info",
  muted: "border-transparent bg-bg-muted text-fg-muted",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-bg-muted/60 px-2 py-0.5 font-mono text-[0.7rem] text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
