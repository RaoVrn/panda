import type { ContentLesson } from "@/content/schema";
import { modules } from "@/content/curriculum";
import { lesson01 } from "@/content/lessons/introduction/lesson-01";
import { lesson02 } from "@/content/lessons/introduction/lesson-02";
import { lesson03 } from "@/content/lessons/introduction/lesson-03";
import { lesson04 } from "@/content/lessons/introduction/lesson-04";
import { lesson05 } from "@/content/lessons/introduction/lesson-05";
import { lesson06 } from "@/content/lessons/git-basics/lesson-06";
import { lesson07 } from "@/content/lessons/git-basics/lesson-07";
import { lesson08 } from "@/content/lessons/git-basics/lesson-08";
import { lesson09 } from "@/content/lessons/git-basics/lesson-09";
import { lesson10 } from "@/content/lessons/git-basics/lesson-10";
import { lesson11 } from "@/content/lessons/git-basics/lesson-11";
import { lesson12 } from "@/content/lessons/git-basics/lesson-12";
import { lesson13 } from "@/content/lessons/git-basics/lesson-13";
import { lesson14 } from "@/content/lessons/git-basics/lesson-14";
import { lesson15 } from "@/content/lessons/git-basics/lesson-15";

/**
 * Registry of all authored lessons. Adding lesson-16.ts to this array is the
 * entire integration step. Nothing else needs to change.
 */
export const lessons: ContentLesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
  lesson15,
];

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
