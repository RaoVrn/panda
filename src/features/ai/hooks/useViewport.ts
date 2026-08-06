import { useAiContextStore } from "@/stores/aiContextStore";

export interface ViewportState {
  currentSection?: string;
  currentBlock?: string;
  currentBlockId?: string;
  currentBlockType?: string;
  scrollPercent?: number;
  selectedText?: string;
}

/**
 * useViewport — subscribe to the live viewport slice (what's on screen now).
 * Selects stable primitives so it never causes re-render loops. Mostly for
 * future UI; the AI reads the full context at send time instead of
 * re-rendering on every scroll.
 */
export function useViewport(): ViewportState {
  const currentSection = useAiContextStore((s) => s.context.currentSection);
  const currentBlock = useAiContextStore((s) => s.context.currentBlock);
  const currentBlockId = useAiContextStore((s) => s.context.currentBlockId);
  const currentBlockType = useAiContextStore((s) => s.context.currentBlockType);
  const scrollPercent = useAiContextStore((s) => s.context.scrollPercent);
  const selectedText = useAiContextStore((s) => s.context.selectedText);

  return {
    currentSection,
    currentBlock,
    currentBlockId,
    currentBlockType,
    scrollPercent,
    selectedText,
  };
}
