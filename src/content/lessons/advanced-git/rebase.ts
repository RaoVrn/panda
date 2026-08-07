import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git rebase — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_rebase: ContentLesson = placeholderLesson({
  id: "rebase",
  slug: "rebase",
  title: "git rebase",
  module: "advanced-git",
  order: 5,
  description: "how to rewrite and tidy up a branch's history",
  difficulty: "advanced",
  preview: [
    "replaying commits",
    "cleaning up your branch",
    "rebase vs merge",
  ],
});
