import { useMemo } from "react";
import type { LessonContext } from "@/lib/ai/types";
import { useAiContextStore } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useReadingStore } from "@/stores/readingStore";
import { buildLessonContext } from "@/features/ai/lessonContextService";

/**
 * useLessonContext — the live, fully-enriched "where is the learner" object.
 *
 * Subscribes to the lesson reports, progress store and reading store, then
 * merges them with the curriculum. The AI panel uses this for the "Helping
 * with" breadcrumb, and the chat store snapshots it at send time.
 */
export function useLessonContext(): LessonContext {
  const live = useAiContextStore((state) => state.context);
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds);
  const xp = useProgressStore((state) => state.xp);
  const startedLessonIds = useProgressStore((state) => state.startedLessonIds);
  const interactiveTouched = useProgressStore((state) => state.interactiveTouched);
  const readings = useReadingStore((state) => state.readings);

  return useMemo(
    () =>
      buildLessonContext(live, {
        xp,
        completedLessonIds,
        startedLessonIds,
        interactiveTouched,
        readings,
      }),
    [live, xp, completedLessonIds, startedLessonIds, interactiveTouched, readings],
  );
}
