/**
 * Lesson duration estimation.
 *
 * The completion screen shows the ESTIMATED reading time from lesson metadata.
 * When metadata is missing, it's derived from the lesson's word count so a tiny
 * lesson never claims to take an hour:
 *
 *   300–500 words   → 3–5 min
 *   500–800 words   → 5–8 min
 *   800–1200 words  → 8–12 min
 *
 * Roughly words ÷ 100, clamped to a sane range.
 */

import type { ContentLesson } from "@/content/schema";

/** Count "speaking words" across a lesson's text-bearing blocks. */
export function countLessonWords(lesson: ContentLesson): number {
  let words = 0;
  const add = (value?: string) => {
    if (!value) return;
    words += value.split(/\s+/).filter(Boolean).length;
  };

  for (const block of lesson.blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "learningGoal":
        add(block.text);
        break;
      case "callout":
      case "tip":
      case "warning":
        add(block.title);
        add(block.text);
        break;
      case "code":
      case "editor":
        add(block.code);
        break;
      case "terminalSteps":
        for (const step of block.steps) {
          add(step.command);
          add(step.output);
          add(step.note);
        }
        break;
      case "directoryTree":
        add(block.title);
        break;
      case "gitGraph":
        for (const commit of block.commits) add(commit.message);
        break;
      case "storyboard":
        for (const node of block.nodes) add(node.text);
        break;
      case "gitVsGithub":
      case "branchGraph":
        break;
      case "stageArea":
        for (const file of block.readFiles ?? []) add(file.name);
        add(block.title);
        break;
      case "diffViewer":
        for (const row of block.rows) {
          add(row.left);
          add(row.right);
        }
        break;
      case "practice":
        add(block.title);
        add(block.description);
        add(block.hint);
        add(block.exampleAnswer);
        break;
      case "keyTakeaways":
        for (const item of block.items) add(item);
        break;
      case "image":
      case "divider":
      case "spacer":
        break;
    }
  }
  return words;
}

/** Estimated reading time in minutes (metadata wins, word count fallback). */
export function estimateMinutes(lesson: ContentLesson): number {
  if (lesson.meta.durationMinutes && lesson.meta.durationMinutes > 0) {
    return lesson.meta.durationMinutes;
  }
  const words = countLessonWords(lesson);
  return Math.max(1, Math.min(30, Math.round(words / 100)));
}
