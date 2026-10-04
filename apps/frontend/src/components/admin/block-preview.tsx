"use client";

import { BlocksView } from "@/components/site/blocks-view";
import type { Block } from "@/lib/blocks";

export function BlockPreview({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <BlocksView
      blocks={blocks}
      className={className}
      code={({ code, language, filename }) => (
        <figure className="overflow-hidden rounded-xl border border-line bg-[#0c0e12]">
          {filename && (
            <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-xs text-[#9aa0aa]">
              {filename}
            </figcaption>
          )}
          <pre className="overflow-x-auto p-4 text-[0.85rem] leading-relaxed text-[#eceae4]">
            <code data-language={language}>{code}</code>
          </pre>
        </figure>
      )}
    />
  );
}
