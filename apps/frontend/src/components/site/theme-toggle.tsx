"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-fg-muted transition hover:bg-bg-muted hover:text-fg",
        className,
      )}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {/* Both icons render on the server; CSS shows the right one before hydration. */}
      <Sun className="hidden size-[1.1rem] dark:block" />
      <Moon className="size-[1.1rem] dark:hidden" />
    </button>
  );
}
