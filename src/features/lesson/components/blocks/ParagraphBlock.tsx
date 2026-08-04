import type { ContentParagraphBlock } from "@/content/schema";

export function ParagraphBlock({ block }: { block: ContentParagraphBlock }) {
  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-text-secondary">
      {block.text}
    </p>
  );
}