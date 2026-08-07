import type { ContentLesson } from "@/content/schema";

/**
 * Placeholder lesson builder.
 *
 * New modules are authored one at a time. Until a lesson is written, a
 * placeholder registers it in the course so the structure stays visible and
 * progress stays consistent. Each placeholder follows the same 12-part lesson
 * template so the final authored lesson slots straight in.
 */
export interface PlaceholderConfig {
  id: string;
  slug: string;
  title: string;
  module: string;
  order: number;
  description: string;
  /** What this lesson will teach (shown in the placeholder body). */
  preview: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}

export function placeholderLesson(config: PlaceholderConfig): ContentLesson {
  return {
    id: config.id,
    slug: config.slug,
    title: config.title,
    description: config.description,
    meta: {
      module: config.module,
      order: config.order,
      difficulty: config.difficulty ?? "intermediate",
      durationMinutes: 7,
      tags: config.tags ?? [],
      summary: [],
    },
    learningGoals: config.preview,
    xpReward: 50,
    blocks: [
      {
        type: "learningGoal",
        id: "goal",
        text: `By the end of this lesson you'll understand ${config.description.toLowerCase()}`,
      },
      {
        type: "callout",
        id: "coming-soon",
        tone: "info",
        title: "This lesson is coming soon",
        text: `We're writing this lesson right now. When it's ready, it will cover: ${config.preview.join(", ")}. Check back soon!`,
      },
      {
        type: "paragraph",
        id: "what-you-will-learn",
        text: `Here's a quick preview of what's coming. ${config.preview
          .map((item) => `\u2022 ${item}`)
          .join(" ")}`,
      },
      {
        type: "keyTakeaways",
        id: "takeaways",
        items: config.preview.slice(0, 3),
      },
      {
        type: "paragraph",
        id: "close",
        text: "This lesson is part of the Panda curriculum and is being built now.",
      },
    ],
  };
}
