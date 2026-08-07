import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * HEAD — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_head: ContentLesson = placeholderLesson({
  id: "head",
  slug: "head",
  title: "HEAD",
  module: "history",
  order: 2,
  description: "the marker that says where you are right now",
  difficulty: "intermediate",
  preview: [
    "what HEAD points at",
    "why it matters for every command",
    "moving your position safely",
  ],
});
