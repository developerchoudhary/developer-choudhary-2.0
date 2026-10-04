import type { ApiEnvelope, Paginated } from "@/lib/types";

const API_URL = (process.env.API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface Options {
  tags?: string[];
  revalidate?: number;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: Options["query"]) {
  const url = new URL(`${API_URL}/api/v1/public${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function request<T>(path: string, opts: Options = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(buildUrl(path, opts.query), {
    headers: { Accept: "application/json" },
    next: { tags: opts.tags ?? [], revalidate: opts.revalidate ?? 300 },
  });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body?.success) {
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function apiGet<T>(path: string, opts?: Options): Promise<T> {
  return (await request<T>(path, opts)).data;
}

export async function apiGetOrNull<T>(path: string, opts?: Options): Promise<T | null> {
  try {
    return await apiGet<T>(path, opts);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function apiList<T>(path: string, opts?: Options): Promise<Paginated<T>> {
  const body = await request<T[]>(path, opts);
  return {
    items: body.data ?? [],
    meta: body.meta ?? {
      currentPage: 1,
      pageSize: body.data?.length ?? 0,
      totalItems: body.data?.length ?? 0,
      totalPages: 1,
    },
  };
}

/** Safe variant for optional sections: never throws, returns the fallback when the API is unavailable. */
export async function apiGetSafe<T>(path: string, fallback: T, opts?: Options): Promise<T> {
  try {
    return await apiGet<T>(path, opts);
  } catch {
    return fallback;
  }
}
