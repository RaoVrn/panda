/**
 * XP + level math.
 *
 * Rewards are single-source constants. Levels follow a growing curve:
 *   Level 1   0 XP
 *   Level 2   100 XP
 *   Level 3   250 XP
 *   Level 4   500 XP
 *   Level 5   850 XP
 *   Level 6   1300 XP  (gap grows by 100 each level)
 */

import type { LevelInfo, XpAction } from "./types";

export const XP_REWARDS: Record<XpAction, number> = {
  "read-lesson": 10,
  "finish-lesson": 40,
  "quiz-complete": 25,
  practice: 30,
  "ask-ai": 5,
  "first-correct": 10,
  "perfect-quiz": 20,
};

/**
 * Returns the level, its XP window and progress for a cumulative XP value.
 */
export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  let floor = 0;
  let gap = 100;

  while (xp >= floor + gap) {
    floor += gap;
    level += 1;
    // Gap to advance from the (new) level: 100, 150, then 100*n - 50.
    gap = level === 1 ? 100 : 100 * level - 50;
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
