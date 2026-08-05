/**
 * Lesson/module status helpers, derived purely from progress data.
 */

import type { ContentLesson } from "@/content/schema";
import {
  isModuleUnlocked,
  modules,
} from "@/content/curriculum";
import { allLessons, moduleLessons } from "@/content/lessons";
import { isLessonUnlocked } from "./progressService";
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
  /** Whether the module's prerequisite chain has been met. */
  unlocked: boolean;
}

export function lessonStatus(
  lesson: ContentLesson,
  state: LessonProgressState,
): LessonStatus {
  if (state.completedLessonIds.includes(lesson.id)) return "completed";
  if (state.startedLessonIds.includes(lesson.id)) return "started";
  if (!isLessonUnlocked(lesson, state.completedLessonIds)) return "locked";
  return "available";
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
    unlocked: isModuleUnlocked(moduleId, state.completedLessonIds),
  };
}

/** First lesson the learner should open next (unlocked + not completed). */
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
