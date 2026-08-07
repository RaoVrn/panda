import type { ContentLesson } from "@/content/schema";
import { placeholderLesson } from "@/content/lessons/placeholder";

/**
 * Tags — placeholder. Authored lesson coming soon.
 */
export const lessonPlaceholder_tags: ContentLesson = placeholderLesson({
  id: "tags",
  slug: "tags",
  title: "Tags",
  module: "advanced-git",
  order: 7,
  description: "how to mark special moments in your history",
  difficulty: "advanced",
  preview: [
    "lightweight vs annotated tags",
    "naming a release",
    "sharing tags",
  ],
});
