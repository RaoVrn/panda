import type { ContentLesson } from "@/content/schema";
import { renderBlock } from "@/content/renderer";

export interface LessonRendererProps {
  lesson: ContentLesson;
  className?: string;
}

/**
 * Renders a lesson from its block array. The engine is fully data-driven:
 * this component never knows what a specific lesson contains — the schema
 * union plus the renderer registry decide everything.
 */
export function LessonRenderer({ lesson, className }: LessonRendererProps) {
  return (
    <article
      id={lesson.id}
      aria-label={lesson.title}
      className={className}
    >
      {lesson.blocks.map((block) => (
        <div key={block.id} className="mb-6 last:mb-0">
          {renderBlock(block)}
        </div>
      ))}
    </article>
  );
}