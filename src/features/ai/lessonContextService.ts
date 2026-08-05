/**
 * lessonContextService — merges the STRUCTURED lesson context (built from the
 * authored lesson data) with the learner's live state.
 *
 * The structured lesson (title, goal, headings, concepts, commands, examples,
 * quiz, challenge, …) is the source of truth and always exists before the AI
 * is called. Live hints (current section via scroll, selection, terminal,
 * progress) are layered on top. If no lesson is open the AI still works —
 * context only enhances.
 */

import type { LessonContext } from "@/lib/ai/types";
import type { QuizRecord } from "@/features/progress/types";
import type { LessonReading } from "@/stores/readingStore";
import { getLesson } from "@/content/lessons";
import { useProgressStore } from "@/features/progress/progressStore";
import { useReadingStore } from "@/stores/readingStore";
import {
  quizPassed,
  readPercent,
  nextLessonToStudy,
  unlockedLessonIds,
} from "@/features/progress/progressService";
import { memorySummary } from "@/features/ai/memory/conversationMemory";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { levelInfo } from "@/features/progress/xp";
import {
  buildLessonStructure,
  type LessonStructure,
} from "@/features/ai/context/LessonContextBuilder";
import { allLessons } from "@/content/lessons";

/** Optional progress snapshot (the hook passes live subscriptions). */
export interface ContextSnapshot {
  xp: number;
  completedLessonIds: string[];
  quizStats: Record<string, QuizRecord>;
  startedLessonIds: string[];
  interactiveTouched: Record<string, boolean>;
  readings: Record<string, LessonReading>;
}

const structureCache = new Map<string, LessonStructure>();

function structureFor(lessonId: string): LessonStructure | null {
  const cached = structureCache.get(lessonId);
  if (cached) return cached;
  const lesson = getLesson(lessonId);
  if (!lesson) return null;
  const structure = buildLessonStructure(lesson);
  structureCache.set(lessonId, structure);
  return structure;
}

/**
 * Merge the structured lesson context with live state. Snapshot-based (reads
 * stores via getState), so it's safe to call at send time from anywhere.
 */
export function buildLessonContext(
  live: LessonContext,
  snapshot?: ContextSnapshot,
): LessonContext {
  const lessonId = live.lessonId;
  const structure = lessonId ? structureFor(lessonId) : null;

  if (!lessonId || !structure) {
    return { ...live, contextReady: false };
  }

  const progress = snapshot ?? useProgressStore.getState();
  const reading =
    snapshot?.readings[lessonId] ??
    useReadingStore.getState().readings[lessonId];
  const lesson = getLesson(lessonId);

  const completed = progress.completedLessonIds.includes(lessonId);
  const started = progress.startedLessonIds.includes(lessonId);
  const pct = lesson
    ? Math.round(readPercent(lesson, reading?.visited) * 100)
    : 0;

  const lessonProgress = completed
    ? "lesson complete"
    : started
      ? `${pct}% read${progress.interactiveTouched[lessonId] ? " · interactive explored" : ""}`
      : "not started yet";

  const quiz = progress.quizStats[lessonId];
  const quizProgress = quiz
    ? quizPassed(quiz)
      ? `passed (${quiz.correct}/${quiz.total})`
      : `attempted ${quiz.correct}/${quiz.total} — needs 80%`
    : "not attempted yet";

  const unlocked = unlockedLessonIds(progress.completedLessonIds);
  const next = nextLessonToStudy(progress.completedLessonIds);
  const completedNames = allLessons()
    .filter((item) => progress.completedLessonIds.includes(item.id))
    .map((item) => item.title)
    .slice(-8);
  const unlockedNames = allLessons()
    .filter((item) => unlocked.has(item.id))
    .map((item) => item.title)
    .slice(0, 8);

  // The section the learner is in: live hint wins, else derive from scroll.
  const section = live.currentSection ?? structure.sectionAtProgress(live.scrollPercent);

  return {
    ...live,
    ...structure.base,
    contextReady: true,
    currentSection: section,
    currentHeading: section,
    currentSectionText: structure.sectionText(section) || undefined,
    lessonProgress,
    quizProgress,
    completedLessons: completedNames.length > 0 ? completedNames.join(" · ") : "none",
    unlockedLessons: unlockedNames.length > 0 ? unlockedNames.join(" · ") : "none",
    recommendedNext: next?.title,
    xp: progress.xp,
    level: levelInfo(progress.xp).level,
    memory: memorySummary() || undefined,
    explanationStyle: usePreferencesStore.getState().snapshot().aiExplanationStyle,
  };
}
