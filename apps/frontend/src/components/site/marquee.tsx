export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const list = [
    ...items.map((label) => ({ key: `a-${label}`, label })),
    ...items.map((label) => ({ key: `b-${label}`, label })),
  ];
  return (
    <div className="marquee-mask overflow-hidden border-y border-line py-5">
      <div className="flex w-max animate-marquee gap-10 pr-10 hover:[animation-play-state:paused]">
        {list.map((item) => (
          <span
            key={item.key}
            className="flex items-center gap-10 whitespace-nowrap font-mono text-sm uppercase tracking-[0.18em] text-fg-muted"
          >
            {item.label}
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
