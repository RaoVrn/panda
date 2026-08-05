/**
 * aiContextBuilder — turns the LessonContext into the structured "current
 * lesson" block handed to the AI. Everything comes from the authored lesson
 * (the single source of truth); live state (scroll, selection, terminal,
 * progress) is layered on top and clearly labelled.
 *
 * The lesson block ENHANCES the model — it never restricts it.
 */

import type { LessonContext } from "./types";

export function buildContextSnippet(context: LessonContext): string {
  if (context.contextReady === false || !context.lessonTitle) {
    return "";
  }

  const lines: string[] = [];

  const crumbs = [context.course, context.module, context.lessonTitle].filter(Boolean);
  lines.push(`Course path: ${crumbs.join(" → ")}`);
  lines.push(`Title: ${context.lessonTitle}`);
  if (context.description) lines.push(`About: ${context.description}`);
  if (context.difficulty || context.estimatedMinutes) {
    lines.push(
      `Profile: ${context.difficulty ?? "—"} · ~${context.estimatedMinutes ?? "?"} min`,
    );
  }

  if (context.currentSection) lines.push(`Current section: "${context.currentSection}"`);

  const lesson = [
    context.objectives?.length && `Goal: ${context.objectives.join("; ")}`,
    context.headings?.length && `Headings: ${context.headings.join(" · ")}`,
    context.concepts?.length && `Concepts: ${context.concepts.join("; ")}`,
    context.commands?.length && `Commands: ${context.commands.join(" · ")}`,
    context.examples?.length && `Example:\n${context.examples.join("\n")}`,
    context.callouts?.length && `Notes: ${context.callouts.join(" | ")}`,
    context.takeaways?.length && `Takeaways: ${context.takeaways.join(" | ")}`,
    context.quizSummary && `Quiz: ${context.quizSummary}`,
    context.challenge && `Challenge: ${context.challenge}`,
    context.interactiveComponents?.length &&
      `Interactive: ${context.interactiveComponents.join(", ")}`,
  ].filter(Boolean) as string[];
  lines.push(...lesson);

  const live = [
    context.currentSectionText &&
      `Section content (what the learner is reading):\n${context.currentSectionText}`,
    context.selectedText && `Selected: """${context.selectedText}"""`,
    context.terminalState && `Terminal state:\n${context.terminalState}`,
    context.sandbox && `Sandbox:\n${context.sandbox}`,
    context.quiz && `Quiz state: ${context.quiz}`,
    context.scrollPercent !== undefined && `Scroll: ${context.scrollPercent}%`,
    context.lessonProgress && `Lesson progress: ${context.lessonProgress}`,
    context.quizProgress && `Quiz progress: ${context.quizProgress}`,
    context.xp !== undefined && `Learner XP: ${context.xp} (level ${context.level ?? "?"})`,
    context.memory && `Already covered: ${context.memory}`,
  ].filter(Boolean) as string[];
  if (live.length > 0) {
    lines.push("");
    lines.push("Live state:");
    lines.push(...live);
  }

  return (
    "\n\nCurrent lesson (structured from the course — use it to ground answers about the lesson; it adds to your knowledge, never limits it):\n" +
    lines.join("\n") +
    "\n\nThe learner can see this on screen. Never quote these notes."
  );
}
