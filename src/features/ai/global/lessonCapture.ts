/**
 * Lightweight lesson-context capture for the global Panda AI assistant.
 *
 * Kept in its own tiny module (no lesson-content imports) so the app header can
 * snapshot the current lesson before navigating to /panda-ai without pulling
 * the whole course registry into the initial bundle. `buildGlobalContext` (the
 * heavy builder) lives in `globalContext.ts` and is only loaded by the global
 * AI page.
 */

import { useAiContextStore } from "@/stores/aiContextStore";
import type { LessonContext } from "@/lib/ai/types";

/** The most recent lesson context, captured just before navigating to /panda-ai. */
let capturedLesson: LessonContext | null = null;

/**
 * Snapshot the current lesson context (called right before leaving a lesson
 * for the global assistant) so the /panda-ai turn still knows the lesson.
 */
export function captureLessonContextForGlobal(): void {
  const live = useAiContextStore.getState().context;
  capturedLesson = live.lessonId || live.lessonTitle ? live : null;
}

/** Consume the captured lesson context (applies to one /panda-ai turn only). */
export function takeCapturedLesson(): LessonContext | null {
  const lesson = capturedLesson;
  capturedLesson = null;
  return lesson;
}
