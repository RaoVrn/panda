import type { ContentCalloutBlock } from "@/content/schema";
import { ToneBox } from "@/features/lesson/components/blocks/ToneBox";

export function CalloutBlock({ block }: { block: ContentCalloutBlock }) {
  return (
    <ToneBox tone={block.tone} title={block.title}>
      {block.text}
    </ToneBox>
  );
}