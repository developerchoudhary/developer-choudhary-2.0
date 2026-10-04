"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import type { PageMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  rowKey: (row: T) => string;
  meta?: PageMeta;
  onPage?: (page: number) => void;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  filters?: ReactNode;
  toolbar?: ReactNode;
  empty?: string;
  onRowClick?: (row: T) => void;
  dense?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  rowKey,
  meta,
  onPage,
  search,
  filters,
  toolbar,
  empty = "Nothing here yet",
  onRowClick,
  dense,
}: DataTableProps<T>) {
  const pad = dense ? "px-4 py-2.5" : "px-5 py-3.5";
  return (
    <div className="card overflow-hidden">
      {(search || filters || toolbar) && (
        <div className="flex items-center gap-3 border-b border-line p-4">
          {search && (
            <div className="relative w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
              <Input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? "Search"}
                className="h-10 pl-9"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
          {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
        </div>
      )}
      <div className={cn("transition-opacity", loading && rows && "opacity-60")}>
        <table className="w-full text-sm">
          <thead className="bg-bg-muted/50 text-left text-[0.68rem] uppercase tracking-wider text-fg-subtle">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(pad, "font-medium", c.className)}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && !rows
              ? Array.from({ length: 6 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} className={pad}>
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows?.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn("transition hover:bg-bg-muted/40", onRowClick && "cursor-pointer")}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn(pad, "align-middle", c.className)}>
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
            {!loading && rows?.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-fg-muted">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {meta && meta.totalPages > 1 && onPage && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-fg-muted">
          <span className="tabular">
            {meta.totalItems} items · page {meta.currentPage} of {meta.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={meta.currentPage <= 1}
              onClick={() => onPage(meta.currentPage - 1)}
              className="rounded-lg border border-line p-1.5 transition hover:bg-bg-muted disabled:opacity-40"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              disabled={meta.currentPage >= meta.totalPages}
              onClick={() => onPage(meta.currentPage + 1)}
              className="rounded-lg border border-line p-1.5 transition hover:bg-bg-muted disabled:opacity-40"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
