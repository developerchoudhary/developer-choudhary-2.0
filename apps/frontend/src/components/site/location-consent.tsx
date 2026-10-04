"use client";

import { MapPin, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { requestLocation, saveLocation, shouldAskLocation, track } from "@/lib/visitor";

export function LocationConsent({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enabled || pathname.startsWith("/admin") || !shouldAskLocation()) return;
    const delay = pathname === "/contact" ? 1500 : 9000;
    const id = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(id);
  }, [enabled, pathname]);

  if (!visible) return null;

  const decline = () => {
    saveLocation({ granted: false, at: Date.now() });
    setVisible(false);
  };

  const accept = async () => {
    setBusy(true);
    try {
      const loc = await requestLocation();
      track(pathname, {
        consentLocation: true,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        city: loc.city,
        region: loc.region,
        country: loc.country,
      });
    } catch {
      saveLocation({ granted: false, at: Date.now() });
    } finally {
      setBusy(false);
      setVisible(false);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
      <div className="card relative p-5 shadow-lift">
        <button
          type="button"
          onClick={decline}
          className="absolute top-3 right-3 rounded-full p-1 text-fg-subtle hover:text-fg"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
        <div className="flex gap-3">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <MapPin className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">Share your location?</p>
            <p className="mt-1 text-sm text-fg-muted">
              It helps me understand where visitors come from and reply in your time zone. Nothing is shared
              with third parties, and you can skip.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={accept}
                disabled={busy}
                className="inline-flex h-9 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg disabled:opacity-60"
              >
                {busy ? "Locating…" : "Share location"}
              </button>
              <button
                type="button"
                onClick={decline}
                className="inline-flex h-9 items-center rounded-full px-3 text-sm text-fg-muted hover:text-fg"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
