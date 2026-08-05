import { useEffect, useRef, type ReactNode } from "react";
import type { ContentBlock } from "@/content/schema";
import { useAiContextStore } from "@/stores/aiContextStore";

export interface BlockTrackerProps {
  block: ContentBlock;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps every rendered block. For headings it also spies on scroll position
 * and reports the section currently on screen to Panda AI, so the assistant
 * always knows where in the lesson the learner is.
 */
export function BlockTracker({
  block,
  className,
  children,
}: BlockTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHeading = block.type === "heading";
  const headingText = isHeading ? block.text : "";

  useEffect(() => {
    if (!isHeading) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          useAiContextStore.getState().report({ currentSection: headingText });
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHeading, headingText, block.id]);

  return (
    <div ref={ref} data-block-id={block.id} className={className}>
      {children}
    </div>
  );
}
