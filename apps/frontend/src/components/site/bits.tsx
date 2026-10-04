"use client";

import { Check, ChevronLeft, ChevronRight, Link2, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PageMeta } from "@/lib/types";

export function Pagination({ meta, hrefFor }: { meta: PageMeta; hrefFor: (page: number) => string }) {
  if (meta.totalPages <= 1) return null;
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.currentPage) <= 1,
  );
  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <PageLink href={hrefFor(meta.currentPage - 1)} disabled={meta.currentPage <= 1} label="Previous page">
        <ChevronLeft className="size-4" />
      </PageLink>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <span key={p} className="flex items-center gap-2">
            {prev !== undefined && p - prev > 1 && <span className="px-1 text-fg-subtle">…</span>}
            <Link
              href={hrefFor(p)}
              aria-current={p === meta.currentPage ? "page" : undefined}
              className={`inline-flex size-9 items-center justify-center rounded-full text-sm ${p === meta.currentPage ? "bg-fg text-bg" : "border border-line text-fg-muted hover:text-fg"}`}
            >
              {p}
            </Link>
          </span>
        );
      })}
      <PageLink
        href={hrefFor(meta.currentPage + 1)}
        disabled={meta.currentPage >= meta.totalPages}
        label="Next page"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled)
    return (
      <span className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-subtle opacity-50">
        {children}
      </span>
    );
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-muted hover:text-fg"
    >
      {children}
    </Link>
  );
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch {}
    } else copy();
  };
  const cls =
    "inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-fg-muted hover:text-fg";
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copy} className={cls}>
        {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}{" "}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={share} className={cls}>
        <Share2 className="size-4" /> Share
      </button>
      <a
        className={cls}
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className={cls}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        className={cls}
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </div>
  );
}
