import Link from "next/link";

export function Breadcrumbs({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-xs text-fg-subtle">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.path} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-fg-subtle/60">
                /
              </span>
            )}
            {i === items.length - 1 ? (
              <span className="text-fg-muted">{item.name}</span>
            ) : (
              <Link href={item.path} className="transition hover:text-fg">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
