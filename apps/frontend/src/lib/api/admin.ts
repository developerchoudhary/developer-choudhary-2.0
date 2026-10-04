"use client";

import type { ApiEnvelope, Paginated } from "@/lib/types";

const BASE = "/api/v1/admin";

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string,
  ) {
    super(message);
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refresh(): Promise<string | null> {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return null;
        const body = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
        return body.data?.accessToken ?? null;
      })
      .catch(() => null)
      .then((token) => {
        accessToken = token;
        return token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function ensureSession(): Promise<boolean> {
  if (accessToken) return true;
  return (await refresh()) !== null;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  formData?: FormData;
  retry?: boolean;
}

function withQuery(path: string, query?: RequestOptions["query"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
}

export async function adminRequest<T>(path: string, opts: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(withQuery(path, opts.query), {
    method: opts.method ?? (opts.body !== undefined || opts.formData ? "POST" : "GET"),
    headers,
    credentials: "include",
    body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });

  if (res.status === 401 && opts.retry !== false && !path.startsWith("/auth/login")) {
    const token = await refresh();
    if (token) return adminRequest<T>(path, { ...opts, retry: false });
  }

  if (res.status === 204) return { success: true, message: "", data: undefined as T };

  const body = (await res.json().catch(() => null)) as (ApiEnvelope<T> & { error?: string }) | null;
  if (!res.ok || !body?.success) {
    throw new AdminApiError(res.status, body?.message ?? `Request failed (${res.status})`, body?.error);
  }
  return body;
}

export const admin = {
  get: <T>(path: string, query?: RequestOptions["query"]) =>
    adminRequest<T>(path, { query }).then((r) => r.data),
  list: async <T>(path: string, query?: RequestOptions["query"]): Promise<Paginated<T>> => {
    const r = await adminRequest<T[]>(path, { query });
    return {
      items: r.data ?? [],
      meta: r.meta ?? { currentPage: 1, pageSize: 0, totalItems: r.data?.length ?? 0, totalPages: 1 },
    };
  },
  post: <T>(path: string, body?: unknown) =>
    adminRequest<T>(path, { method: "POST", body: body ?? {} }).then((r) => r.data),
  put: <T>(path: string, body: unknown) => adminRequest<T>(path, { method: "PUT", body }).then((r) => r.data),
  patch: <T>(path: string, body: unknown) =>
    adminRequest<T>(path, { method: "PATCH", body }).then((r) => r.data),
  delete: <T>(path: string) => adminRequest<T>(path, { method: "DELETE" }).then((r) => r.data),
  upload: <T>(path: string, formData: FormData) =>
    adminRequest<T>(path, { method: "POST", formData }).then((r) => r.data),
  download: async (path: string, query?: RequestOptions["query"]) => {
    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(withQuery(path, query), { headers, credentials: "include" });
    if (!res.ok) throw new AdminApiError(res.status, "Download failed");
    return res.blob();
  },
  previewHtml: async (path: string, body: unknown) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(withQuery(path), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new AdminApiError(res.status, "Preview failed");
    return res.text();
  },
};
