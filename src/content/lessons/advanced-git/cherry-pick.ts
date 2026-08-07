import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git cherry-pick — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_cherry_pick: ContentLesson = placeholderLesson({
  id: "cherry-pick",
  slug: "cherry-pick",
  title: "git cherry-pick",
  module: "advanced-git",
  order: 2,
  description: "how to copy a single commit onto another branch",
  difficulty: "advanced",
  preview: [
    "choosing one commit",
    "applying it elsewhere",
    "when cherry-pick shines",
  ],
});
