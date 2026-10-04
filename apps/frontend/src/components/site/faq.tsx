import { ChevronDown } from "lucide-react";

export function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  if (!items.length) return null;
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-fg [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown className="size-4 shrink-0 text-fg-subtle transition group-open:rotate-180" />
          </summary>
          <p className="mt-3 max-w-2xl text-fg-muted leading-relaxed">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
