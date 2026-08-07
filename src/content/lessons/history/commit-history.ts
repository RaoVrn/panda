import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * Commit History — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_commit_history: ContentLesson = placeholderLesson({
  id: "commit-history",
  slug: "commit-history",
  title: "Commit History",
  module: "history",
  order: 1,
  description: "how snapshots form a story and how to read it",
  difficulty: "intermediate",
  preview: [
    "reading a chain of commits",
    "how parents connect snapshots",
    "spotting your place in history",
  ],
});
