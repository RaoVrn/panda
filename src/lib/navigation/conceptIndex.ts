/**
 * Course content index for Panda AI navigation.
 *
 * Gives the assistant an authoritative, data-driven list of every lesson and
 * module with its real slug/id, so it can attach precise navigation actions
 * (route:lesson:<slug>, route:module:<id>) without inventing URLs. The AI
 * decides WHICH destination fits the user's intent; the app resolves it.
 */

import { modules } from "@/content/curriculum";
import { moduleLessons } from "@/content/lessons";

/**
 * Compact, token-efficient description of the whole course: modules and their
 * lessons (slug + title). Injected into the assistant context so it always
 * references real identifiers.
 */
export function describeCourseContent(): string {
  const lines: string[] = [];
  for (const module of modules) {
    const lessons = moduleLessons(module.id);
    const lessonList = lessons
      .map((lesson) => `${lesson.slug} (${lesson.title})`)
      .join(", ");
    lines.push(`  module ${module.id}: "${module.title}" (${lessonList || "coming soon"})`);
  }
  return [
    "Course content, use these EXACT identifiers for navigation (never invent ids):",
    ...lines,
  ].join("\n");
}
