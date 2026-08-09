/**
 * QuickActions  -  generates the AI panel's chips from the current context.
 *
 * Chips adapt to the lesson (title-derived prompts), to live state (selection,
 * terminal, quiz) and always include the teaching set. Nothing is hardcoded to
 * a course, so Python/Docker/React lessons get matching chips automatically.
 */

import type { LessonContext } from "@/lib/ai/types";

export interface Recommendation {
  label: string;
  prompt: string;
}

const TEACHING: Recommendation[] = [
  { label: "Explain like I'm 10", prompt: "Explain like I'm 10" },
  { label: "Common mistakes", prompt: "Common mistakes" },
  { label: "Real project example", prompt: "Real project example" },
  { label: "Give analogy", prompt: "Give analogy" },
  { label: "Quiz me", prompt: "Quiz me" },
  { label: "Go deeper", prompt: "Go deeper" },
  { label: "Challenge me", prompt: "Give me a challenge" },
  { label: "Interview question", prompt: "Interview question" },
];

/** Dynamic quick actions, up to `limit` chips. */
export function buildQuickActions(
  ctx: LessonContext,
  limit = 8,
): Recommendation[] {
  const items: Recommendation[] = [];

  if (ctx.selectedText) {
    items.push({
      label: "Explain selection",
      prompt: `Explain this: ${ctx.selectedText.slice(0, 140)}`,
    });
  }
  // In the Playground, coach the mission instead of generic chips.
  if (ctx.mode === "interactive" && (ctx.objective || ctx.terminalState)) {
    items.push({ label: "What should I do next?", prompt: "What should I do next?" });
    items.push({ label: "Explain my terminal", prompt: "Explain my terminal" });
  }
  if (ctx.terminalState) {
    items.push({ label: "What did I do wrong?", prompt: "What did I do wrong?" });
  }
  if (ctx.practice && ctx.practice.includes("not answered yet")) {
    items.push({ label: "Hint", prompt: "Hint" });
  }
  if (ctx.lessonTitle) {
    items.push({ label: `Explain ${ctx.lessonTitle}`, prompt: `Explain ${ctx.lessonTitle}` });
    items.push({ label: "Summarize this lesson", prompt: "Summarize this lesson" });
  }

  const seen = new Set(items.map((item) => item.prompt));
  for (const action of TEACHING) {
    if (!seen.has(action.prompt)) {
      items.push(action);
      seen.add(action.prompt);
    }
  }

  return items.slice(0, limit);
}

/** Empty-state example prompts  -  "ask anything about this lesson". */
export function buildEmptyState(ctx: LessonContext): Recommendation[] {
  const title = ctx.lessonTitle ?? "this lesson";
  // In the Playground, lead with mission coaching.
  if (ctx.mode === "interactive" && ctx.objective) {
    return [
      { label: "What should I do next?", prompt: "What should I do next?" },
      { label: "Give me a hint", prompt: "Hint" },
      { label: "Explain my terminal", prompt: "Explain my terminal" },
      { label: "What did I do wrong?", prompt: "What did I do wrong?" },
    ];
  }
  return [
    { label: `Why does ${title} exist?`, prompt: `Why does ${title} exist?` },
    { label: "Explain like I'm 10", prompt: "Explain like I'm 10" },
    { label: "Quiz me", prompt: "Quiz me" },
    { label: "Show a real project example", prompt: "Real project example" },
  ];
}

/** A single proactive nudge, or null when the learner is fine. */
export function buildNotice(ctx: LessonContext): string | null {
  // In the Playground: nudge toward the next objective when the learner
  // seems quiet or has been on the same mission for a while.
  if (
    ctx.mode === "interactive" &&
    ctx.objective &&
    ctx.timeOnSectionSeconds &&
    ctx.timeOnSectionSeconds >= 90
  ) {
    return `Stuck on "${ctx.objective}"? I can give you a hint.`;
  }
  if (
    ctx.timeOnSectionSeconds &&
    ctx.timeOnSectionSeconds >= 300 &&
    ctx.practice &&
    ctx.practice.includes("not answered yet")
  ) {
    return "You've been on this section for a bit. Want to work through this checkpoint together?";
  }
  if (
    ctx.lessonProgress &&
    ctx.lessonProgress.includes("read") &&
    ctx.scrollPercent &&
    ctx.scrollPercent > 75 &&
    !ctx.practice
  ) {
    return "You're almost at the end. There's a checkpoint waiting when you're ready.";
  }
  return null;
}
