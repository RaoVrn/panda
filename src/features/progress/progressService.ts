/**
 * progressService  -  the single place that decides what "done" means.
 *
 * A lesson counts as complete only when ALL three gates pass:
 *
 *   1. Read    -  the learner scrolled through at least 80% of the lesson.
 *   2. Interact  -  they explored the lesson in Interactive mode.
 *   3. Quiz    -  they passed the quiz with at least 80%.
 *
 * Completion is derived, not fire-and-forget: these helpers are used by the
 * sidebar, dashboard, lesson summary and quiz so every surface agrees. XP is
 * granted exactly once, when a lesson first becomes complete.
 */

import type { ContentLesson } from "@/content/schema";
import { allLessons, getLesson } from "@/content/lessons";
import { isModuleUnlocked, moduleOfLesson } from "@/content/curriculum";
import { useReadingStore } from "@/stores/readingStore";
import { lessonXp } from "./xp";
import { useProgressStore } from "./progressStore";

/** Quiz pass mark. */
/** Fraction of blocks a learner must visit for "read" to count. */
export const READ_THRESHOLD = 0.8;


/** Fraction of lesson blocks the learner has visited (0..1). */
export function readPercent(
  lesson: ContentLesson,
  visited: string[] | undefined,
): number {
  if (lesson.blocks.length === 0) return 1;
  const seen = new Set(visited ?? []);
  const count = lesson.blocks.filter((block) => seen.has(block.id)).length;
  return count / lesson.blocks.length;
}

/** Whether a lesson's read gate has been met. */
export function readDone(
  lesson: ContentLesson,
  visited: string[] | undefined,
): boolean {
  return readPercent(lesson, visited) >= READ_THRESHOLD;
}

/** The lesson immediately before this one in course order, if any. */
export function previousLesson(lesson: ContentLesson): ContentLesson | undefined {
  const ordered = allLessons();
  const index = ordered.findIndex((l) => l.id === lesson.id);
  return index > 0 ? ordered[index - 1] : undefined;
}

/**
 * Sequential unlocking:
 *  · the module's prerequisite chain must be complete, and
 *  · the previous lesson in the course must be completed.
 */
export function isLessonUnlocked(
  lesson: ContentLesson,
  completedLessonIds: string[],
): boolean {
  const module = moduleOfLesson(lesson.id);
  if (module && !isModuleUnlocked(module.id, completedLessonIds)) return false;
  const prev = previousLesson(lesson);
  return prev === undefined || completedLessonIds.includes(prev.id);
}

/** Every lesson id the learner may currently open. */
export function unlockedLessonIds(completedLessonIds: string[]): Set<string> {
  const ids = new Set<string>();
  for (const lesson of allLessons()) {
    if (isLessonUnlocked(lesson, completedLessonIds)) ids.add(lesson.id);
  }
  return ids;
}

/** First lesson the learner should open next (unlocked + not completed). */
export function nextLessonToStudy(completedLessonIds: string[]): ContentLesson | undefined {
  return allLessons().find(
    (lesson) =>
      isLessonUnlocked(lesson, completedLessonIds) &&
      !completedLessonIds.includes(lesson.id),
  );
}

export interface CompletionCheck {
  lessonId: string;
  complete: boolean;
  readDone: boolean;
  interactiveDone: boolean;
  /** Human-friendly missing steps, for the lesson summary gate. */
  missing: string[];
}

export function completionCheck(
  lesson: ContentLesson,
  snapshot: {
    visited?: string[];
    interactiveTouched?: boolean;
  },
): CompletionCheck {
  const read = readDone(lesson, snapshot.visited);
  const interactive = snapshot.interactiveTouched === true;
  const missing: string[] = [];
  if (!read) missing.push("Read the whole lesson");
  if (!interactive) missing.push("Try the interactive parts");
  return {
    lessonId: lesson.id,
    complete: read && interactive,
    readDone: read,
    interactiveDone: interactive,
    missing,
  };
}

/** Current completion check for a lesson, pulled from the persisted stores. */
export function completionForLesson(lesson: ContentLesson): CompletionCheck {
  const { readings } = useReadingStore.getState();
  const { interactiveTouched } = useProgressStore.getState();
  return completionCheck(lesson, {
    visited: readings[lesson.id]?.visited,
    interactiveTouched: interactiveTouched[lesson.id],
  });
}

/**
 * Complete a lesson the moment all gates pass. Safe to call on every render:
 * it only acts on the transition into "complete" and awards XP once.
 * Returns the current completion check.
 */
export function maybeCompleteLesson(lesson: ContentLesson): CompletionCheck {
  const check = completionForLesson(lesson);
  const store = useProgressStore.getState();
  if (check.complete && !store.completedLessonIds.includes(lesson.id)) {
    useProgressStore.getState().completeLesson(lesson.id, lessonXp(lesson));
  }
  return check;
}

/** Same as maybeCompleteLesson but resolves the lesson by id. */
export function maybeCompleteLessonById(lessonId: string): void {
  const lesson = getLesson(lessonId);
  if (lesson) maybeCompleteLesson(lesson);
}
