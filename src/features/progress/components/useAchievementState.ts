import { useMemo } from "react";
import {
  ACHIEVEMENTS,
  buildAchievementContext,
  type AchievementContext,
} from "../achievements";
import { useProgressStore } from "../progressStore";

/**
 * Single source of achievement state for the UI: the learner's unlocked map
 * (id -> earnedAt) plus a progress context derived from the real progress
 * store. Every achievement surface (dashboard, all-achievements page, detail
 * modal) reads from here, so nothing is hard-coded or duplicated.
 */
export function useAchievementState(): {
  unlocked: Record<string, number>;
  ctx: AchievementContext;
  isEarned: (id: string) => boolean;
  earnedAt: (id: string) => number | undefined;
  earned: typeof ACHIEVEMENTS;
  earnedCount: number;
  total: number;
} {
  const state = useProgressStore();
  const ctx = useMemo(() => buildAchievementContext(state), [state]);
  const unlocked = state.achievements;
  const earned = useMemo(
    () => ACHIEVEMENTS.filter((a) => Boolean(state.achievements[a.id])),
    [state.achievements],
  );
  return {
    unlocked,
    ctx,
    isEarned: (id) => Boolean(unlocked[id]),
    earnedAt: (id) => unlocked[id],
    earned,
    earnedCount: Object.keys(unlocked).length,
    total: ACHIEVEMENTS.length,
  };
}
