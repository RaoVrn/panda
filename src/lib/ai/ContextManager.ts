/**
 * Trims the lesson-context snippet so it never wastes tokens on empty fields.
 * Only facts that actually apply to the learner's screen are included, and
 * labels are kept as short as practical.
 */

import type { LessonContext } from "./types";

export function buildTrimmedContext(context: LessonContext): string {
  const lines: string[] = [];

  if (context.lessonTitle) lines.push(`Lesson: "${context.lessonTitle}"`);
  if (context.currentSection) lines.push(`Section: "${context.currentSection}"`);
  if (context.mode) lines.push(`Mode: ${context.mode}`);
  if (context.visualization) lines.push(`On screen: ${context.visualization}`);
  if (context.gitGraph) lines.push(`Commit: ${context.gitGraph}`);
  if (context.terminal) lines.push(`Terminal: ${context.terminal}`);
  if (context.editor) lines.push(`Editor: ${context.editor}`);
  if (context.quiz) lines.push(`Quiz: ${context.quiz}`);
  if (context.practice) lines.push(`Practice: ${context.practice}`);

  if (lines.length === 0) return "";

  return (
    "\n\n[The learner can see this on screen in a visual Git course. " +
    "Use it so they don't need to repeat it, but never quote these notes.]\n" +
    lines.join("\n")
  );
}
