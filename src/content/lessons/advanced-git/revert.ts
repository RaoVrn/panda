import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git revert — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_revert: ContentLesson = placeholderLesson({
  id: "revert",
  slug: "revert",
  title: "git revert",
  module: "advanced-git",
  order: 4,
  description: "how to undo a commit without erasing history",
  difficulty: "advanced",
  preview: [
    "making a new undo commit",
    "why revert is safe",
    "reverting old commits",
  ],
});
