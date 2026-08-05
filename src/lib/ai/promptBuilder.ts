/**
 * Prompt construction for Panda AI.
 *
 * The system prompt is intentionally short. Every character counts as an
 * input token, and the free-tier quota is easy to exhaust. Context is trimmed
 * to only facts the learner needs. Tokens are estimated before each request
 * and logged via `buildTokenReport`.
 */

import { buildTrimmedContext } from "./ContextManager";
import type { LessonContext, StyleAction } from "./types";

export const SYSTEM_PROMPT = `You are Panda AI, a patient Git tutor.
Teach beginners. Explain like they're 10.
Prefer stories and analogies over definitions.
Use simple ASCII diagrams when helpful (commits, branches, HEAD, staging).
Avoid jargon; explain any technical word you use.
Keep answers warm, short, and encouraging.
Write in short, natural sentences. Avoid long dashes and dramatic punctuation.
If unsure, say so. Never invent commands.`;

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
  if (text === "quiz me") {
    return "\n\nQuiz me: ask 3 quick multiple-choice questions about this lesson, one at a time. After each answer, say if it was right and explain in one line, then ask the next. End with a score.";
  }
  if (text === "give me a challenge") {
    return "\n\nGive me a challenge: one tiny hands-on task I can do in a terminal (or in my head) based on this lesson. Then a hint, and the solution hidden behind a spoiler.";
  }
  if (text === "explain like i'm 10" || text === "explain this again" || text === "i still don't understand") {
    return "\n\nExplain this as if I'm 10 years old. Use one analogy. Under 6 sentences.";
  }
  if (text === "give another example" || text === "give me another example") {
    return "\n\nGive me a DIFFERENT example than the lesson used. Pick something from daily life (games, school, photos, cooking).";
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
  const parts = [
    buildActionInstruction(action),
    buildTutorIntent(message),
    buildTrimmedContext(context),
    message.trim(),
  ];
  return parts.filter(Boolean).join("\n\n").trim();
}
