import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-dc flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="eyebrow mb-4">404</p>
      <h1 className="display text-5xl sm:text-7xl">
        This page wandered <em className="text-accent">off the map.</em>
      </h1>
      <p className="mt-6 max-w-md text-lg text-fg-muted">
        The link may be old, or the page moved. The home page has everything you need.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg"
      >
        <ArrowLeft className="size-4" /> Back home
      </Link>
    </main>
  );
}
