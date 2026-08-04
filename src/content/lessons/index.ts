import type { ContentLesson } from "@/content/schema";
import { lesson01 } from "@/content/lessons/lesson-01";

/**
 * Registry of all authored lessons. Adding lesson-57.ts to this array is the
 * entire integration step — nothing else needs to change.
 */
export const lessons: ContentLesson[] = [lesson01];

export function getLesson(slug: string): ContentLesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}