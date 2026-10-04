"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

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
        <p className="eyebrow mb-5">Something broke</p>
        <h1 className="display text-balance text-4xl sm:text-6xl">
          That wasn&apos;t supposed to <span className="text-accent">happen.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-fg-muted">
          The error has been logged. Try again, or head back to the home page.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-fg-subtle">ref {error.digest}</p>}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-fg px-6 text-sm font-medium text-bg"
          >
            <RotateCcw className="size-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-xl border border-line-strong px-6 text-sm font-medium"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
