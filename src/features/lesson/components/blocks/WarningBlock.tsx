import type { ContentWarningBlock } from "@/content/schema";
import { ToneBox } from "@/features/lesson/components/blocks/ToneBox";

export function WarningBlock({ block }: { block: ContentWarningBlock }) {
  return (
    <ToneBox tone="warning" title={block.title ?? "Heads up"}>
      {block.text}
    </ToneBox>
  );
}