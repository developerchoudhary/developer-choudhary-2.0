"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-dc flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="eyebrow mb-4">Something broke</p>
      <h1 className="display text-5xl">Let&apos;s try that again.</h1>
      <p className="mt-4 max-w-md text-fg-muted">A temporary error stopped this page from loading.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-bg"
      >
        Reload
      </button>
    </main>
  );
}
