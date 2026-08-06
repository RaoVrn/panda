/**
 * Lesson/module status helpers, derived purely from progress data.
 *
 * Lessons are NEVER locked: every lesson is available, and status only reflects
 * progress (completed / started / available).
 */

import type { ContentLesson } from "@/content/schema";
import { modules } from "@/content/curriculum";
import { allLessons, moduleLessons } from "@/content/lessons";
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
  };
}

/** First lesson the learner should open next (first incomplete one). */
export function currentLesson(
  state: LessonProgressState,
): ContentLesson | undefined {
  return allLessons().find(
    (lesson) => !state.completedLessonIds.includes(lesson.id),
  );
}

/** Every module with its progress. */
export function allModuleProgress(
  state: LessonProgressState,
): ModuleProgress[] {
  return modules.map((module) => moduleProgress(module.id, state));
}
