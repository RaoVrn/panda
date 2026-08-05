import { useEffect } from "react";
import { create } from "zustand";
import type { LessonContext, PartialLessonContext } from "@/lib/ai/types";

interface AiContextState {
  /**
   * The current lesson snapshot, assembled from reports pushed by the lesson
   * tree (headings, visualizations, terminal, editor, quiz, practice). Panda
   * AI reads this before every request so the learner never repeats context.
   */
  context: LessonContext;
  report: (partial: PartialLessonContext) => void;
  reset: () => void;
}

export const useAiContextStore = create<AiContextState>()((set) => ({
  context: {},
  report: (partial) =>
    set((state) => ({ context: { ...state.context, ...partial } })),
  reset: () => set({ context: {} }),
}));

/**
 * Tiny bridge for lesson components: call it with a slice of context and it
 * merges it into the store. Pass the values that should trigger a re-report as
 * `deps`.
 *
 * @example
 *   useReportAi({ gitGraph: active?.message }, [active?.message]);
 */
export function useReportAi(
  partial: PartialLessonContext,
  deps: readonly unknown[],
): void {
  useEffect(() => {
    useAiContextStore.getState().report(partial);
    // `partial` is a fresh object every render; callers declare intent via deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
