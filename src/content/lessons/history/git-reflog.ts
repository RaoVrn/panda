import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git reflog — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_git_reflog: ContentLesson = placeholderLesson({
  id: "git-reflog",
  slug: "git-reflog",
  title: "git reflog",
  module: "history",
  order: 6,
  description: "your safety net of every move you've made",
  difficulty: "intermediate",
  preview: [
    "what reflog records",
    "finding lost commits",
    "recovering from mistakes",
  ],
});
