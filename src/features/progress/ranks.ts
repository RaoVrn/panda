/**
 * Learner ranks, derived purely from XP.
 *
 * Ranks give progress a fun identity. The tier thresholds overlap the level
 * curve on purpose, so a rank upgrade often lands right after a level-up.
 */

export interface Rank {
  id: string;
  emoji: string;
  title: string;
  minXp: number;
}

export const RANKS: Rank[] = [
  { id: "beginner", emoji: "🌱", title: "Beginner Panda", minXp: 0 },
  { id: "explorer", emoji: "🐼", title: "Git Explorer", minXp: 100 },
  { id: "apprentice", emoji: "🌿", title: "Commit Apprentice", minXp: 250 },
  { id: "navigator", emoji: "🌳", title: "Branch Navigator", minXp: 500 },
  { id: "master", emoji: "🚀", title: "Git Master", minXp: 1000 },
];

/** The learner's current rank for a given XP total. */
export function rankForXp(xp: number): Rank {
  let current = RANKS[0]!;
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
}

/** The next rank to reach, if any. */
export function nextRank(xp: number): Rank | undefined {
  return RANKS.find((rank) => rank.minXp > xp);
}
