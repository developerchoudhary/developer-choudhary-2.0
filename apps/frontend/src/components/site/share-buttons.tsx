"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
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
    "inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg";
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
