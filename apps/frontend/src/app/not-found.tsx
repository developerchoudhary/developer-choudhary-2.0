import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-full" aria-hidden="true" />
      <div className="container-dc relative py-24 text-center">
        <p className="eyebrow mb-5">404</p>
        <h1 className="display text-balance text-5xl sm:text-7xl">
          This page went <span className="text-accent">off the map.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-fg-muted">
          The link may be old, or the page moved. Everything else is right where you left it.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-fg px-6 text-sm font-medium text-bg transition hover:bg-fg/90"
          >
            <ArrowLeft className="size-4" /> Back home
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-line-strong px-6 text-sm font-medium transition hover:bg-bg-muted"
          >
            Report a broken link <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
