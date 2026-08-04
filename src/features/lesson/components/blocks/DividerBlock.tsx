import type { ContentDividerBlock } from "@/content/schema";
import { Divider } from "@/components/ui/Divider";

export function DividerBlock({ block }: { block: ContentDividerBlock }) {
  return <Divider aria-hidden="false" data-block-id={block.id} />;
}