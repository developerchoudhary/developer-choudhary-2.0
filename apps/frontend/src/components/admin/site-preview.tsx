"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const DEVICES = {
  desktop: { width: 1280, height: 860 },
  mobile: { width: 390, height: 844 },
} as const;

export type PreviewDevice = keyof typeof DEVICES;
export type PreviewMode = "light" | "dark";

/**
 * The public site in a frame, scaled to fit, with a theme applied on top without saving it.
 * Pages in the frame receive the CSS through components/site/theme-preview.tsx, and ask for it
 * again after every reload, so browsing inside the frame keeps the preview.
 */
export function SitePreview({
  path,
  css,
  mode,
  device,
  maxHeight = 640,
  className,
}: {
  path: string;
  css: string;
  mode: PreviewMode;
  device: PreviewDevice;
  maxHeight?: number;
  className?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const latest = useRef({ css, mode });
  latest.current = { css, mode };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { type: "dc:theme-preview", ...latest.current },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent<{ type?: string }>) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type !== "dc:theme-preview-ready") return;
      send();
      setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resend whenever the theme or mode changes
  useEffect(send, [css, mode, send]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new page loads when the path changes
  useEffect(() => setReady(false), [path]);

  const d = DEVICES[device];
  const scale = width ? Math.min(1, width / d.width, maxHeight / d.height) : 0;
  const left = Math.max(0, (width - d.width * scale) / 2);

  return (
    <div
      ref={box}
      className={cn("relative overflow-hidden", className)}
      style={{ height: Math.round(d.height * scale) || maxHeight }}
    >
      <iframe
        ref={frame}
        src={path}
        title="Site preview"
        className={cn(
          "absolute top-0 border-0 bg-bg transition-opacity duration-300",
          device === "mobile" && "rounded-[28px] ring-1 ring-line-strong",
          ready ? "opacity-100" : "opacity-0",
        )}
        style={{
          left,
          width: d.width,
          height: d.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-fg-muted">
          <Spinner className="size-5" />
        </div>
      )}
    </div>
  );
}
