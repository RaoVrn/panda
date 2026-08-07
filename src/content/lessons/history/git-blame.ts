import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * git blame — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_git_blame: ContentLesson = placeholderLesson({
  id: "git-blame",
  slug: "git-blame",
  title: "git blame",
  module: "history",
  order: 5,
  description: "how to find who changed each line and when",
  difficulty: "intermediate",
  preview: [
    "reading blame output",
    "finding who wrote a line",
    "tracking changes to a file",
  ],
});
