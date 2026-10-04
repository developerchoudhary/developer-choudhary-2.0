"use client";

const VISITOR_KEY = "dc_visitor";
const SESSION_KEY = "dc_session";
const LOCATION_KEY = "dc_location";
const DECLINE_DAYS = 30;

export interface StoredLocation {
  granted: boolean;
  at: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  city?: string;
  region?: string;
  country?: string;
}

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function visitorId(): string {
  const existing = read<string>(localStorage, VISITOR_KEY);
  if (existing) return existing;
  const id = randomId();
  write(localStorage, VISITOR_KEY, id);
  return id;
}

export function sessionId(): string {
  const existing = read<string>(sessionStorage, SESSION_KEY);
  if (existing) return existing;
  const id = randomId();
  write(sessionStorage, SESSION_KEY, id);
  return id;
}

export function storedLocation(): StoredLocation | null {
  return read<StoredLocation>(localStorage, LOCATION_KEY);
}

/**
 * True inside the admin's theme preview. The site may only be framed by itself
 * (X-Frame-Options: SAMEORIGIN), so a framed page is never a real visit.
 */
export function inPreview(): boolean {
  return window.self !== window.top;
}

export function shouldAskLocation(): boolean {
  if (inPreview()) return false;
  const stored = storedLocation();
  if (!stored) return true;
  if (stored.granted) return false;
  return Date.now() - stored.at > DECLINE_DAYS * 24 * 60 * 60 * 1000;
}

export function saveLocation(value: StoredLocation) {
  write(localStorage, LOCATION_KEY, value);
}

export function deviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    );
    if (!res.ok) return {};
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    return {
      city: data.city || data.locality || "",
      region: data.principalSubdivision || "",
      country: data.countryName || "",
    };
  } catch {
    return {};
  }
}

export function requestLocation(): Promise<StoredLocation> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        const value: StoredLocation = {
          granted: true,
          at: Date.now(),
          latitude,
          longitude,
          accuracy,
          ...place,
        };
        saveLocation(value);
        resolve(value);
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  });
}

export function track(path: string, extra: Record<string, unknown> = {}) {
  if (inPreview()) return;
  const loc = storedLocation();
  const payload = {
    visitorId: visitorId(),
    sessionId: sessionId(),
    path,
    referrer: document.referrer.slice(0, 500),
    device: deviceType(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    consentLocation: Boolean(loc?.granted),
    ...(loc?.granted
      ? {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          city: loc.city,
          region: loc.region,
          country: loc.country,
        }
      : {}),
    ...extra,
  };
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/v1/public/visits", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/v1/public/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
