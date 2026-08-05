/**
 * Suggested prompts shown as quick chips when the chat is empty. Lesson-
 * specific suggestions keep learners focused; a generic fallback covers every
 * other screen. Add a new lesson's prompts here. No UI change needed.
 */

import type { ContentLesson } from "@/content/schema";

/** Lesson 1 · What is Git? */
const WHAT_IS_GIT: string[] = [
  "Explain Git like I'm 10",
  "Why is Git called a time machine?",
  "Give me another example",
  "Show another analogy",
  "Explain visually",
  "How would this work in real life?",
];

const FALLBACK: string[] = [
  "What is a commit?",
  "What is a branch?",
  "What is HEAD?",
  "What is staging?",
  "What's the difference between Git and GitHub?",
];

export const SUGGESTIONS_BY_SLUG: Record<string, string[]> = {
  "what-is-git": WHAT_IS_GIT,
};

export function suggestionsFor(lesson?: ContentLesson): string[] {
  if (lesson && lesson.slug in SUGGESTIONS_BY_SLUG) {
    return SUGGESTIONS_BY_SLUG[lesson.slug]!;
  }
  return FALLBACK;
}
