import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git reset — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_reset: ContentLesson = placeholderLesson({
  id: "reset",
  slug: "reset",
  title: "git reset",
  module: "advanced-git",
  order: 3,
  description: "how to move your branch pointer and undo work",
  difficulty: "advanced",
  preview: [
    "soft vs mixed vs hard",
    "unstaging",
    "undoing commits carefully",
  ],
});
