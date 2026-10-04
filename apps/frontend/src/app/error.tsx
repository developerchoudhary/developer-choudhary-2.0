"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/site/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-[80vh] items-center">
      <div className="container-dc py-24 text-center">
        <p className="text-sm font-semibold text-accent">Something went wrong</p>
        <h1 className="display mt-3 text-balance text-[2.25rem] sm:text-[3rem]">
          That was not supposed to happen
        </h1>
        <p className="mx-auto mt-4 max-w-md text-fg-muted">
          The error has been logged. Try again, or head back to the home page.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-fg-subtle">ref {error.digest}</p>}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            <RotateCcw className="size-4" /> Try again
          </button>
          <Link href="/" className={buttonClass("secondary")}>
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
