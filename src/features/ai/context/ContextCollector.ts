/**
 * ContextCollector  -  the heart of the Panda AI Context Engine.
 *
 *   Application state (stores + live reports)
 *              │
 *              ▼
 *   ContextCollector.collectContext()
 *              │  LessonContext · ViewportContext · SandboxContext
 *              │  QuizContext · UserContext
 *              ▼
 *   A complete LessonContext handed to the PromptBuilder
 *
 * The LLM is never called without a collected context. Everything is derived
 * from the AUTHORED lesson (the source of truth) + live state; no DOM content
 * is scraped. The structured lesson is memoized per lesson id.
 */

import type { LessonContext } from "@/lib/ai/types";
import type { LessonReading } from "@/stores/readingStore";
import { getLesson, allLessons } from "@/content/lessons";
import { useProgressStore } from "@/features/progress/progressStore";
import { useReadingStore } from "@/stores/readingStore";
import {
  readPercent,
  nextLessonToStudy,
} from "@/features/progress/progressService";
import { memorySummary } from "@/features/ai/memory/conversationMemory";
import {
  buildLessonStructure,
  type LessonStructure,
} from "@/features/ai/context/LessonContextBuilder";
import { collectSandboxContext } from "@/features/ai/context/SandboxContext";
import { collectUserContext } from "@/features/ai/context/UserContext";

/** Progress snapshot the hook passes from live subscriptions. */
export interface ContextSnapshot {
  xp: number;
  completedLessonIds: string[];
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
 * Assemble the full context. Snapshot-based (reads stores via getState), so
 * it's safe to call at send time from anywhere; the hook passes live
 * subscriptions for reactive display.
 */
export function collectContext(
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

  /* ---------------- viewport ---------------- */
  const visibleBlock = live.currentBlockId
    ? structure.blockById(live.currentBlockId)
    : undefined;
  const section =
    live.currentSection ??
    (live.currentBlockId
      ? structure.headingsOf(live.currentBlockId).heading
      : undefined) ??
    structure.sectionAtProgress(live.scrollPercent);

  /* ---------------- code awareness ---------------- */
  const visibleCode =
    visibleBlock && (visibleBlock.type === "code" || visibleBlock.type === "editor")
      ? { code: visibleBlock.code, language: visibleBlock.language, filename: visibleBlock.filename }
      : undefined;
  const visibleCommand =
    visibleBlock?.type === "terminalSteps" ? live.terminal : undefined;

  /* ---------------- progress ---------------- */
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

  const user = collectUserContext(progress);

  const next = nextLessonToStudy(progress.completedLessonIds);
  const completedNames = allLessons()
    .filter((item) => progress.completedLessonIds.includes(item.id))
    .map((item) => item.title)
    .slice(-8);

  const sandbox = collectSandboxContext(live);

  return {
    ...live,
    ...structure.base,
    contextReady: true,
    currentSection: section,
    currentHeading: section,
    currentSectionText: structure.sectionText(section) || undefined,
    visibleBlock,
    visibleCode,
    visibleCommand,
    lessonProgress,
    terminal: sandbox.terminal,
    terminalState: sandbox.terminalState,
    sandbox: sandbox.sandbox,
    completedLessons: completedNames.length > 0 ? completedNames.join(" · ") : "none",
    recommendedNext: next?.title,
    memory: memorySummary() || undefined,
    explanationStyle: user.explanationStyle as LessonContext["explanationStyle"],
    theme: user.theme,
    lessonMode: user.lessonMode,
    animationSpeed: user.animationSpeed,
    xp: user.xp,
    level: user.level,
    completedCount: user.completedLessons,
    totalCount: user.totalLessons,
  };
}
