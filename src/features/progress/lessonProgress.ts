/**
 * Lesson/module status helpers, derived purely from progress data.
 */

import type { ContentLesson } from "@/content/schema";
import { modules } from "@/content/roadmap";
import { allLessons, isLessonUnlocked, moduleLessons } from "@/content/lessons";
import { percentComplete } from "@/lib/utils";
import type { LessonStatus } from "./types";

export interface LessonProgressState {
  completedLessonIds: string[];
  startedLessonIds: string[];
}

export interface ModuleProgress {
  moduleId: string;
  completed: number;
  total: number;
  percent: number;
}

export function lessonStatus(
  lesson: ContentLesson,
  state: LessonProgressState,
): LessonStatus {
  if (state.completedLessonIds.includes(lesson.id)) return "completed";
  if (state.startedLessonIds.includes(lesson.id)) return "started";
  if (isLessonUnlocked(lesson, state.completedLessonIds)) return "available";
  return "locked";
}

export function moduleProgress(
  moduleId: string,
  state: LessonProgressState,
): ModuleProgress {
  const lessons = moduleLessons(moduleId);
  const completed = lessons.filter((l) =>
    state.completedLessonIds.includes(l.id),
  ).length;
  return {
    moduleId,
    completed,
    total: lessons.length,
    percent: percentComplete(completed, lessons.length),
  };
}

/** First lesson the learner should open next (unlocked and not completed). */
export function currentLesson(
  state: LessonProgressState,
): ContentLesson | undefined {
  return allLessons().find(
    (lesson) =>
      isLessonUnlocked(lesson, state.completedLessonIds) &&
      !state.completedLessonIds.includes(lesson.id),
  );
}

/** Every module with its progress. */
export function allModuleProgress(
  state: LessonProgressState,
): ModuleProgress[] {
  return modules.map((module) => moduleProgress(module.id, state));
}
