/**
 * Prompt construction for Panda AI.
 *
 * The system prompt is intentionally short. Every character counts as an
 * input token, and the free-tier quota is easy to exhaust. Context is trimmed
 * to only facts the learner needs. Tokens are estimated before each request
 * and logged via `buildTokenReport`.
 */

import { buildContextSnippet } from "./aiContextBuilder";
import type { LessonContext, StyleAction } from "./types";

export const SYSTEM_PROMPT = `You are Panda, an expert mentor living inside an interactive course. Friendly, occasionally funny, patient, encouraging. Never cringe, never overuse emojis.
Never say "As an AI", never mention LLMs or models. Speak naturally, like a person.
You are given the learner's current lesson as structured context. Use it to ground answers whenever the question is about the lesson — its concepts, commands, examples, quiz and challenge take priority.
You are a GENERAL expert: answer ANY question fully from your own knowledge — Git, Python, Docker, Linux, React, databases, whatever. Lesson context ENHANCES your answers; it never limits them. Never refuse, never say you can't find something.
If the question is not about the lesson, answer normally with your own expertise.
Structure answers: simple explanation, then one real example, then a tiny one-line summary. No essays. Increase depth only when the learner asks.
When explaining a command, put it in a fenced code block first, then explain each part on its own line.
Use simple ASCII diagrams when helpful.
Avoid jargon; explain any technical word you use.
If the learner is stuck on a quiz, give hints first: hint, another hint, an analogy, a tiny example, then the solution. Never dump the answer immediately.
For navigation questions (where should I go, what's next, I skipped something), use the completed/unlocked/recommended lesson facts in context. Never invent a route or claim a lesson is complete when it is not.
If something was already explained in this conversation, build on it briefly instead of repeating the whole explanation.
Write in short, natural sentences. Never invent commands. If unsure, say so.`;

export const ACTION_INSTRUCTIONS: Record<StyleAction, string> = {
  simpler:
    "Make your answer SIMPLER, like you're talking to a 10-year-old. Keep it under 5 sentences.",
  visual:
    "Make it VISUAL. Lead with an ASCII diagram. Keep prose short around it.",
  example:
    "Lead with a CONCRETE EXAMPLE, like homework, a game save point, or a photo folder. Show the steps.",
  challenge:
    "Turn it into a MINI CHALLENGE. One or two tiny steps the learner can do in their head.",
  interview:
    "Answer like an INTERVIEW. Crisp reply plus one follow-up a beginner would ask.",
  replay:
    "Explain again with DIFFERENT words and a fresh analogy. No repeated sentences.",
};

/** Extra behavior for Panda's one-tap tutor actions (the quick chips). */
export function buildTutorIntent(message: string): string {
  const text = message.trim().toLowerCase();

  if (text === "hint" || text === "give me a hint") {
    return "\n\nGive the learner a HINT about what they're stuck on, not the answer. Start small, then offer another hint, then an analogy, then a tiny example. Reveal the solution only if they keep asking.";
  }
  if (text === "what did i do wrong?" || text === "why is this wrong?") {
    return "\n\nLook at the learner's terminal/quiz state. Diagnose the mistake gently, explain WHY it happened, then show the fix. No lecturing.";
  }
  if (text === "explain my terminal" || text === "explain my terminal state") {
    return "\n\nExplain the learner's live terminal state line by line: branch, staged, modified, untracked files, last command and output. Tell them exactly what to do next.";
  }
  if (text === "why did that move?" || text === "why did that happen?") {
    return "\n\nExplain the change the learner just saw on screen. Use the active visualization state to describe what moved and why.";
  }
  if (text === "summarize this section" || text === "summarize this lesson" || text === "summarize this page") {
    return "\n\nSummarize the section the learner is looking at. 3 bullets max. Then ask if they want to go deeper.";
  }
  if (text === "quiz me" || text === "practice question") {
    return "\n\nAsk ONE quick practice question about the current lesson. Wait for the answer, give feedback, then a one-line takeaway.";
  }
  if (text === "give me a challenge") {
    return "\n\nGive a tiny hands-on challenge based on the current lesson. Wait, then offer a hint, then the solution behind a spoiler.";
  }
  if (text === "real project example") {
    return "\n\nShow how this is used in a REAL project by a real developer. One short scenario with the actual commands/steps. Explain each step briefly.";
  }
  if (text === "go deeper" || text === "technical explanation") {
    return "\n\nGo one level DEEPER. Keep it beginner-friendly but add the why behind the what. One new detail the lesson didn't cover.";
  }
  if (text === "eli5" || text === "explain simply" || text === "explain like i'm 10" || text === "explain this again" || text === "i still don't understand") {
    return "\n\nExplain this as if I'm 10 years old. Use one analogy. Under 6 sentences.";
  }
  if (text === "give analogy" || text === "show analogy") {
    return "\n\nExplain with ONE vivid everyday analogy (games, school, photos, cooking). Then map each part back to the topic.";
  }
  if (text === "give example" || text === "give another example" || text === "give me another example") {
    return "\n\nGive me a DIFFERENT example than the lesson used. Pick something from daily life.";
  }
  if (text === "explain line by line" || text === "walk me through it") {
    return "\n\nTake the exact command or code on screen and explain it LINE BY LINE. Put it in a fenced code block, then one short bullet per part: what it does and why.";
  }
  if (text === "why does this matter?") {
    return "\n\nExplain why this concept matters in real projects. One short real-world story, then the payoff in 2 sentences.";
  }
  if (text === "common mistakes") {
    return "\n\nList the 3 most common mistakes beginners make with this, each with a one-line fix.";
  }
  if (text.startsWith("what happens if")) {
    return "\n\nAnswer the 'what happens if' question concretely. Walk through the outcome step by step, then give the safe way to try it.";
  }
  if (text === "visual explanation") {
    return "\n\nExplain with a clear ASCII diagram first, then a short prose explanation.";
  }
  if (text === "interview question") {
    return "\n\nTreat it like a real technical interview question. Give a crisp answer a senior would give, then one follow-up the interviewer might ask.";
  }
  if (text.startsWith("explain ") || text.startsWith("why does ")) {
    return "";
  }
  return "";
}

export function buildActionInstruction(action?: StyleAction): string {
  if (!action) return "";
  return `\n\n${ACTION_INSTRUCTIONS[action]}`;
}

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildUserPrompt(
  message: string,
  context: LessonContext,
  action?: StyleAction,
): string {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // "this"/"that" without a subject → resolve to the learner's selection.
  let selectionHint = "";
  if (context.selectedText && /(this|that)/.test(lower) && !/course|lesson/.test(lower)) {
    selectionHint = `\n\nThe learner selected this text on screen — explain exactly this:\n"""${context.selectedText}"""`;
  }

  // Honor the learner's preferred explanation depth.
  let styleHint = "";
  if (context.explanationStyle === "simple") {
    styleHint = "\n\nThis learner prefers SIMPLE explanations: short sentences, one analogy, beginner level throughout.";
  } else if (context.explanationStyle === "deep") {
    styleHint = "\n\nThis learner prefers DEEP explanations: include the 'why' behind the 'what' and one extra detail, while staying beginner-friendly.";
  }

  const parts = [
    buildActionInstruction(action),
    buildTutorIntent(trimmed),
    styleHint,
    buildContextSnippet(context),
    selectionHint,
    trimmed,
  ];
  return parts.filter(Boolean).join("\n\n").trim();
}
