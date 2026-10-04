import { ChevronDown } from "lucide-react";

export function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  if (!items.length) return null;
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold tracking-tight text-fg [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown className="size-5 shrink-0 text-fg-subtle transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
