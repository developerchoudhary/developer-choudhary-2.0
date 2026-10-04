import type { Block } from "@/lib/blocks";
import { BlocksView } from "./blocks-view";
import { CodeBlock } from "./code-block";

export function BlockRenderer({ blocks, className }: { blocks: Block[] | undefined; className?: string }) {
  return <BlocksView blocks={blocks} className={className} code={(props) => <CodeBlock {...props} />} />;
}
