"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminApiError, admin } from "@/lib/api/admin";

type Query = Record<string, string | number | boolean | undefined | null>;

export function errorMessage(err: unknown): string {
  if (err instanceof AdminApiError) return err.detail || err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export function useList<T>(path: string, query?: Query) {
  return useQuery({
    queryKey: [path, "list", query],
    queryFn: () => admin.list<T>(path, query),
    placeholderData: (prev) => prev,
  });
}

export function useAll<T>(path: string, query?: Query) {
  return useQuery({ queryKey: [path, "all", query], queryFn: () => admin.get<T[]>(path, query) });
}

export function useItem<T>(path: string, id?: string) {
  const enabled = Boolean(id) && id !== "new";
  return useQuery({ queryKey: [path, "item", id], queryFn: () => admin.get<T>(`${path}/${id}`), enabled });
}

export function useOne<T>(path: string) {
  return useQuery({ queryKey: [path, "one"], queryFn: () => admin.get<T>(path) });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (...paths: string[]) => Promise.all(paths.map((p) => qc.invalidateQueries({ queryKey: [p] })));
}

interface SaveOptions<TOut> {
  path: string;
  id?: string;
  successMessage?: string;
  invalidate?: string[];
  onSuccess?: (data: TOut) => void;
}

export function useSave<TIn, TOut = unknown>({
  path,
  id,
  successMessage = "Saved",
  invalidate = [],
  onSuccess,
}: SaveOptions<TOut>) {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: (body: TIn) =>
      id && id !== "new" ? admin.put<TOut>(`${path}/${id}`, body) : admin.post<TOut>(path, body),
    onSuccess: async (data) => {
      await inv(path, ...invalidate);
      toast.success(successMessage);
      onSuccess?.(data);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useAction<TIn = void, TOut = unknown>(
  fn: (input: TIn) => Promise<TOut>,
  opts: { invalidate?: string[]; success?: string; onSuccess?: (data: TOut) => void } = {},
) {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (data) => {
      if (opts.invalidate?.length) await inv(...opts.invalidate);
      if (opts.success) toast.success(opts.success);
      opts.onSuccess?.(data);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useRemove(path: string, invalidate: string[] = []) {
  return useAction((id: string) => admin.delete(`${path}/${id}`), {
    invalidate: [path, ...invalidate],
    success: "Deleted",
  });
}
