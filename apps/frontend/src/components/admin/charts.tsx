"use client";

import { useId, useState } from "react";
import type { CountItem } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/* ------------------------------------------------------------------------------------------------
   Small, dependency-free SVG charts for the admin. Marks follow a quiet spec: 2px lines, 10% area
   wash, hairline grid, text in text tokens, a crosshair tooltip on hover, and a legend for >= 2 series.
   ------------------------------------------------------------------------------------------------ */

export interface Series {
  name: string;
  values: number[];
  color: string; // CSS color (use var(--chart-n))
}

export interface AreaChartProps {
  labels: string[];
  series: Series[];
  height?: number;
  formatLabel?: (label: string) => string;
  className?: string;
}

const PAD = { top: 12, right: 12, bottom: 26, left: 40 };

function niceMax(v: number) {
  if (v <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function defaultLabel(label: string) {
  const d = new Date(label.length === 10 ? `${label}T00:00:00Z` : label);
  if (Number.isNaN(d.getTime())) return label;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}

export function AreaChart({
  labels,
  series,
  height = 240,
  formatLabel = defaultLabel,
  className,
}: AreaChartProps) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 800;
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const n = labels.length;
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = Math.max(1, Math.ceil(n / 6));

  const paths = series.map((s) => {
    const line = s.values
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
    const area = `${line} L${x(n - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;
    return { line, area };
  });

  if (n === 0) return <ChartEmpty height={height} />;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div className={cn("relative", className)}>
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-4 text-xs text-fg-muted">
          {series.map((s) => (
            <li key={s.name} className="inline-flex items-center gap-2">
              <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={series.map((s) => s.name).join(", ")}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.name} id={`${id}-g${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 3}
              textAnchor="end"
              className="fill-fg-subtle"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {formatNumber(t)}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text
              key={l}
              x={x(i)}
              y={height - 8}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              className="fill-fg-subtle"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {formatLabel(l)}
            </text>
          ) : null,
        )}
        {series.map((s, i) => (
          <g key={s.name}>
            <path d={paths[i]?.area} fill={`url(#${id}-g${i})`} />
            <path
              d={paths[i]?.line}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        ))}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="var(--line-strong)"
              strokeWidth="1"
            />
            {series.map((s) => (
              <circle
                key={s.name}
                cx={x(hover)}
                cy={y(s.values[hover] ?? 0)}
                r="4.5"
                fill={s.color}
                stroke="var(--bg-elevated)"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
        <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent" />
      </svg>
      {hover !== null && labels[hover] !== undefined && (
        <div
          className="pointer-events-none absolute top-6 z-10 min-w-36 rounded-xl border border-line bg-bg-elevated/95 p-3 text-xs shadow-lift backdrop-blur"
          style={{
            left: `${(x(hover) / width) * 100}%`,
            transform: hover > n / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
          }}
        >
          <p className="mb-1.5 font-medium text-fg">{formatLabel(labels[hover] ?? "")}</p>
          {series.map((s) => (
            <p key={s.name} className="flex items-center justify-between gap-4 text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} /> {s.name}
              </span>
              <span className="font-semibold tabular text-fg">{formatNumber(s.values[hover] ?? 0)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function ColumnChart({
  labels,
  values,
  color = "var(--chart-1)",
  height = 160,
  formatLabel = (l: string) => l,
  className,
}: {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
  formatLabel?: (l: string) => string;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 800;
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const n = labels.length;
  if (n === 0) return <ChartEmpty height={height} />;
  const max = niceMax(Math.max(1, ...values));
  const slot = innerW / n;
  const bar = Math.min(24, slot - 2);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const labelEvery = Math.max(1, Math.ceil(n / 12));
  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Column chart">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t * max)}
              y2={y(t * max)}
              stroke="var(--chart-grid)"
            />
            <text
              x={PAD.left - 8}
              y={y(t * max) + 3}
              textAnchor="end"
              className="fill-fg-subtle"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {formatNumber(t * max)}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const h = Math.max(v > 0 ? 2 : 0, (v / max) * innerH);
          const top = PAD.top + innerH - h;
          return (
            <g key={labels[i]} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <rect x={cx - slot / 2} y={PAD.top} width={slot} height={innerH} fill="transparent" />
              <path
                d={`M${cx - bar / 2},${PAD.top + innerH} V${top + 4} Q${cx - bar / 2},${top} ${cx - bar / 2 + 4},${top} H${cx + bar / 2 - 4} Q${cx + bar / 2},${top} ${cx + bar / 2},${top + 4} V${PAD.top + innerH} Z`}
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.55}
              />
              {i % labelEvery === 0 && (
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-fg-subtle"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {formatLabel(labels[i] ?? "")}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-xl border border-line bg-bg-elevated/95 px-3 py-2 text-xs shadow-lift"
          style={{
            left: `${((PAD.left + slot * hover + slot / 2) / width) * 100}%`,
            transform: hover > n / 2 ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
          }}
        >
          <span className="font-semibold tabular text-fg">{formatNumber(values[hover] ?? 0)}</span>{" "}
          <span className="text-fg-muted">{formatLabel(labels[hover] ?? "")}</span>
        </div>
      )}
    </div>
  );
}

export function BarList({
  items,
  color = "var(--chart-1)",
  format = (l: string) => l,
  max: maxOverride,
  empty = "No data yet",
  limit = 8,
  className,
}: {
  items: CountItem[];
  color?: string;
  format?: (label: string) => string;
  max?: number;
  empty?: string;
  limit?: number;
  className?: string;
}) {
  const list = items.slice(0, limit);
  const total = items.reduce((a, b) => a + b.count, 0);
  const max = maxOverride ?? Math.max(1, ...list.map((i) => i.count));
  if (list.length === 0)
    return <p className={cn("py-6 text-center text-sm text-fg-muted", className)}>{empty}</p>;
  return (
    <ul className={cn("space-y-2.5", className)}>
      {list.map((i) => (
        <li key={i.label} className="group relative text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-fg" title={i.label}>
              {format(i.label)}
            </span>
            <span className="shrink-0 font-medium tabular text-fg">
              {formatNumber(i.count)}
              <span className="ml-1.5 text-xs text-fg-subtle">
                {total ? Math.round((i.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(i.count / max) * 100}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({
  values,
  color = "var(--chart-1)",
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const w = 112;
  const h = 40;
  if (values.length < 2)
    return <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-full w-full", className)} aria-hidden="true" />;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 4 - (v / max) * (h - 8)] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-full w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {last && (
        <circle cx={last[0]} cy={last[1]} r="3" fill={color} stroke="var(--bg-elevated)" strokeWidth="2" />
      )}
    </svg>
  );
}

/** Horizontal segmented bar for part-to-whole with <= 6 parts (e.g. devices). */
export function SegmentBar({ items, colors }: { items: CountItem[]; colors: string[] }) {
  const total = items.reduce((a, b) => a + b.count, 0);
  if (total === 0) return <p className="py-6 text-center text-sm text-fg-muted">No data yet</p>;
  return (
    <div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        {items.map((it, i) => (
          <div
            key={it.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(it.count / total) * 100}%`, background: colors[i % colors.length] }}
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-2 text-sm">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 capitalize text-fg">
              <span className="size-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
              {it.label}
            </span>
            <span className="tabular text-fg-muted">
              {formatNumber(it.count)} · {Math.round((it.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ChartEmpty({ height }: { height: number }) {
  return (
    <div
      className="dot-bg flex items-center justify-center rounded-xl text-sm text-fg-muted"
      style={{ height }}
    >
      No data for this period yet
    </div>
  );
}

/** Fill a day-indexed series so every calendar day in the window has a point. */
export function fillDays<T extends { day: string }>(
  rows: T[],
  days: number,
  pick: (row: T | undefined) => number[],
): { labels: string[]; values: number[][] } {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const labels: string[] = [];
  const values: number[][] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    labels.push(key);
    values.push(pick(byDay.get(key)));
  }
  return { labels, values };
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
