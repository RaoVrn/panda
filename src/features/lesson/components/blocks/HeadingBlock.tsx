import type { ContentHeadingBlock } from "@/content/schema";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const levelClass: Record<ContentHeadingBlock["level"], string> = {
  1: "text-2xl font-semibold tracking-tight sm:text-3xl",
  2: "text-xl font-semibold tracking-tight sm:text-2xl",
  3: "text-lg font-semibold tracking-tight",
};

export function HeadingBlock({ block }: { block: ContentHeadingBlock }): ReactNode {
  const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
  return (
    <Tag id={block.id} className={cn("text-text", levelClass[block.level])}>
      {block.text}
    </Tag>
  );
}