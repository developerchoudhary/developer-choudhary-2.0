import { cn } from "@/lib/utils";

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  const unique = Array.from(new Set(items));
  const Row = ({ suffix }: { suffix: string }) =>
    unique.map((item) => (
      <span
        key={`${item}-${suffix}`}
        className="inline-flex items-center gap-10 text-sm font-medium text-fg-muted"
      >
        {item}
        <span className="size-1 rounded-full bg-accent/70" />
      </span>
    ));
  return (
    <div
      className={cn("marquee-mask overflow-hidden border-y border-line py-5", className)}
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        <Row suffix="a" />
        <Row suffix="b" />
      </div>
    </div>
  );
}
