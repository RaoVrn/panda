/**
 * Lesson/module status helpers, derived purely from progress data.
 */

import type { ContentLesson } from "@/content/schema";
import {
  isModuleUnlocked,
  moduleOfLesson,
  modules,
} from "@/content/curriculum";
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
  /** Whether the module's prerequisite chain has been met. */
  unlocked: boolean;
}

export function lessonStatus(
  lesson: ContentLesson,
  state: LessonProgressState,
): LessonStatus {
  if (state.completedLessonIds.includes(lesson.id)) return "completed";
  if (state.startedLessonIds.includes(lesson.id)) return "started";
  const module = moduleOfLesson(lesson.id);
  if (module && !isModuleUnlocked(module.id, state.completedLessonIds)) return "locked";
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
    unlocked: isModuleUnlocked(moduleId, state.completedLessonIds),
  };
}

/** First lesson the learner should open next (module + lesson unlocked). */
export function currentLesson(
  state: LessonProgressState,
): ContentLesson | undefined {
  return allLessons().find((lesson) => {
    const module = moduleOfLesson(lesson.id);
    const moduleOk = !module || isModuleUnlocked(module.id, state.completedLessonIds);
    return (
      moduleOk &&
      isLessonUnlocked(lesson, state.completedLessonIds) &&
      !state.completedLessonIds.includes(lesson.id)
    );
  });
}

/** Every module with its progress. */
export function allModuleProgress(
  state: LessonProgressState,
): ModuleProgress[] {
  return modules.map((module) => moduleProgress(module.id, state));
}
