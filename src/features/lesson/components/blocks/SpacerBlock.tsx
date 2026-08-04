import type { ContentSpacerBlock } from "@/content/schema";

export function SpacerBlock({ block }: { block: ContentSpacerBlock }) {
  const height = block.height ?? 24;
  return (
    <div
      style={{ height }}
      aria-hidden="true"
      data-block-id={block.id}
    />
  );
}