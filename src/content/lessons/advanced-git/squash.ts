import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * Squashing Commits — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_squash: ContentLesson = placeholderLesson({
  id: "squash",
  slug: "squash",
  title: "Squashing Commits",
  module: "advanced-git",
  order: 6,
  description: "how to combine many commits into one clean commit",
  difficulty: "advanced",
  preview: [
    "squashing with rebase",
    "writing a single message",
    "clean history before sharing",
  ],
});
