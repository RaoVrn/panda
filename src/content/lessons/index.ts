import type { ContentLesson } from "@/content/schema";
import { modules } from "@/content/roadmap";
import { lesson01 } from "@/content/lessons/lesson-01";

/**
 * Registry of all authored lessons. Adding lesson-57.ts to this array is the
 * entire integration step. Nothing else needs to change.
 */
export const lessons: ContentLesson[] = [lesson01];

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));

export function getLesson(id: string): ContentLesson | undefined {
  return byId.get(id);
}

export function getLessonBySlug(slug: string): ContentLesson | undefined {
  return bySlug.get(slug);
}

/** Lessons in a module, in authored order. */
export function moduleLessons(moduleId: string): ContentLesson[] {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return [];
  return module.lessons
    .map((id) => getLesson(id))
    .filter((lesson): lesson is ContentLesson => Boolean(lesson));
}

/** Every authored lesson in course order. */
export function allLessons(): ContentLesson[] {
  return modules.flatMap((module) => moduleLessons(module.id));
}

export function nextLesson(currentId: string): ContentLesson | undefined {
  const lessonsList = allLessons();
  const index = lessonsList.findIndex((lesson) => lesson.id === currentId);
  return index >= 0 ? lessonsList[index + 1] : undefined;
}

export function previousLesson(currentId: string): ContentLesson | undefined {
  const lessonsList = allLessons();
  const index = lessonsList.findIndex((lesson) => lesson.id === currentId);
  return index > 0 ? lessonsList[index - 1] : undefined;
}

export function isLessonUnlocked(
  lesson: ContentLesson,
  completedLessonIds: string[],
): boolean {
  return (lesson.meta.prerequisites ?? []).every((id) =>
    completedLessonIds.includes(id),
  );
}
