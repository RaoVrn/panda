import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git show — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_git_show: ContentLesson = placeholderLesson({
  id: "git-show",
  slug: "git-show",
  title: "git show",
  module: "history",
  order: 4,
  description: "how to inspect any single commit in detail",
  difficulty: "intermediate",
  preview: [
    "viewing one commit",
    "reading its message and files",
    "using it to explore history",
  ],
});
