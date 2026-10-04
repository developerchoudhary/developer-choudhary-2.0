"use client";

import { Check, Link2, Linkedin, MessageCircle, Twitter } from "lucide-react";
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
  const icon =
    "inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg";
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className={icon}
        aria-label={copied ? "Link copied" : "Copy link"}
        title="Copy link"
      >
        {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}
      </button>
      <a
        className={icon}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="LinkedIn"
      >
        <Linkedin className="size-4" />
      </a>
      <a
        className={icon}
        href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        title="X"
      >
        <Twitter className="size-4" />
      </a>
      <a
        className={icon}
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle className="size-4" />
      </a>
    </div>
  );
}
