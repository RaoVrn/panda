/**
 * XP + level math.
 *
 * Lesson rewards are difficulty-based:
 *   Easy     25 XP
 *   Medium   50 XP
 *   Hard     75 XP
 *   Project  150 XP
 *
 * Smaller action rewards (quizzes, practice, asking Panda AI) sit on top.
 *
 * Levels follow a growing curve:
 *   Level 1       0–100 XP
 *   Level 2     101–250 XP
 *   Level 3     251–450 XP
 *   Level 4     451–700 XP
 *   Level 5     701–1000 XP
 *   (gap grows by 50 each level)
 */

import type { LevelInfo, XpAction } from "./types";

/** Base reward for completing a lesson, by difficulty. */
export const LESSON_XP: Record<"beginner" | "intermediate" | "advanced", number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
};

/** Reward for a hands-on "project" style lesson. */
export const PROJECT_XP = 150;

/**
 * The lesson's XP reward: an authored override wins, otherwise the
 * difficulty-based default applies.
 */
export function lessonXp(
  lesson: { xpReward?: number; meta: { difficulty?: string } },
): number {
  if (lesson.xpReward && lesson.xpReward > 0) return lesson.xpReward;
  if (lesson.meta.difficulty === "intermediate") return LESSON_XP.intermediate;
  if (lesson.meta.difficulty === "advanced") return LESSON_XP.advanced;
  return LESSON_XP.beginner;
}

export const XP_REWARDS: Record<XpAction, number> = {
  "read-lesson": 0,
  "finish-lesson": 0,
  "quiz-complete": 25,
  practice: 30,
  "ask-ai": 5,
  "first-correct": 10,
  "perfect-quiz": 20,
};

/**
 * Returns the level, its XP window and progress for a cumulative XP value.
 * Thresholds: 100, 250, 450, 700, 1000 … (gap grows by 50 per level).
 */
export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  let floor = 0;
  let gap = 100;

  while (xp >= floor + gap) {
    floor += gap;
    level += 1;
    gap = 100 + (level - 1) * 50;
  }

  const max = floor + gap;
  const progress = Math.min(1, Math.max(0, (xp - floor) / gap));
  return {
    level,
    xp,
    min: floor,
    max,
    progress,
    remaining: Math.max(0, max - xp),
  };
}

/** Human label like "Level 3". */
export function levelLabel(level: number): string {
  return `Level ${level}`;
}
