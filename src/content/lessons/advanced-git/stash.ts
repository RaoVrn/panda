import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git stash — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_stash: ContentLesson = placeholderLesson({
  id: "stash",
  slug: "stash",
  title: "git stash",
  module: "advanced-git",
  order: 1,
  description: "how to set your work aside and pick it up later",
  difficulty: "advanced",
  preview: [
    "stashing changes",
    "listing stashes",
    "restoring work safely",
  ],
});
