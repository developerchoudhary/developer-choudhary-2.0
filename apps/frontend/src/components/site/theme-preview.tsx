"use client";

import { useEffect } from "react";
import { inPreview } from "@/lib/visitor";

type Mode = "light" | "dark";
type PreviewMessage = { type: "dc:theme-preview"; css: string; mode: Mode };

/**
 * Admin → Theme shows the site in a frame and sends the theme being edited here, so it can be tried
 * on real pages before it is saved. Only active when framed by the admin on the same origin.
 */
export function ThemePreview() {
  useEffect(() => {
    if (!inPreview()) return;
    const root = document.documentElement;
    let mode: Mode | null = null;

    // The visitor's own light/dark choice is shared with the admin through storage; keep the
    // mode the preview asked for even when that choice is re-applied.
    const enforce = () => {
      if (!mode) return;
      if (
        root.classList.contains("dark") !== (mode === "dark") ||
        root.classList.contains("light") !== (mode === "light")
      ) {
        root.classList.toggle("dark", mode === "dark");
        root.classList.toggle("light", mode === "light");
      }
      if (root.style.colorScheme !== mode) root.style.colorScheme = mode;
    };
    const observer = new MutationObserver(enforce);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "style"] });

    const onMessage = (e: MessageEvent<PreviewMessage>) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      if (e.data?.type !== "dc:theme-preview") return;
      let style = document.getElementById("dc-theme-preview");
      if (!style) {
        style = document.createElement("style");
        style.id = "dc-theme-preview";
        document.head.append(style);
      }
      style.textContent = e.data.css;
      mode = e.data.mode;
      enforce();
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "dc:theme-preview-ready" }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      observer.disconnect();
    };
  }, []);
  return null;
}
