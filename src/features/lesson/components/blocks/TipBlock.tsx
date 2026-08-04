import type { ContentTipBlock } from "@/content/schema";
import { ToneBox } from "@/features/lesson/components/blocks/ToneBox";

export function TipBlock({ block }: { block: ContentTipBlock }) {
  return (
    <ToneBox tone="tip" title={block.title ?? "Tip"}>
      {block.text}
    </ToneBox>
  );
}