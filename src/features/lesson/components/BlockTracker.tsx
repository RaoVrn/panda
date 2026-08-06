import type { ReactNode } from "react";
import type { ContentBlock } from "@/content/schema";

export interface BlockTrackerProps {
  block: ContentBlock;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps every rendered block. ViewportObserver owns the page-level observation;
 * this component only provides stable block anchors for reading progress and
 * scroll-aware context.
 */
export function BlockTracker({
  block,
  className,
  children,
}: BlockTrackerProps) {
  return (
    <div data-block-id={block.id} className={className}>
      {children}
    </div>
  );
}
