import type { ContentLesson } from "@/content/schema";
import { LessonNav, type LessonNavTarget } from "@/features/lesson/components/LessonNav";

export interface PlaygroundCompletionBarProps {
  lesson: ContentLesson;
  previous?: LessonNavTarget;
  next?: LessonNavTarget;
}

/**
 * Minimal footer for the interactive playground: the same clean previous /
 * next lesson navigation as the read mode. No XP, no completion banner.
 */
export function PlaygroundCompletionBar({ previous, next }: PlaygroundCompletionBarProps) {
  return <LessonNav previous={previous} next={next} />;
}
