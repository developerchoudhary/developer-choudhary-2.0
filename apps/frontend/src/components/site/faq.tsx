import { Plus } from "lucide-react";

export function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  if (!items.length) return null;
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-bg-elevated">
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-fg [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus className="size-4 shrink-0 text-fg-subtle transition group-open:rotate-45" />
          </summary>
          <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
