import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * Detached HEAD — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_detached_head: ContentLesson = placeholderLesson({
  id: "detached-head",
  slug: "detached-head",
  title: "Detached HEAD",
  module: "history",
  order: 3,
  description: "what happens when HEAD isn't on a branch",
  difficulty: "intermediate",
  preview: [
    "when HEAD detaches",
    "how to avoid losing work",
    "getting back to a branch",
  ],
});
