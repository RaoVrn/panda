/**
 * Daily learning streak.
 *
 * A learner with activity today extends the streak if their last study day was
 * yesterday, resets to 1 after a gap, and keeps it if they already studied
 * today. Everything lives in localStorage (via the storage adapter).
 */

import type { StreakInfo } from "./types";

const STREAK_KEY = "panda-streak";

interface StoredStreak {
  current: number;
  lastStudyDate: string;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function readStreak(adapter: {
  get: (key: string) => string | null;
}): StreakInfo {
  const raw = adapter.get(STREAK_KEY);
  const today = todayKey();
  if (!raw) {
    return { current: 0, lastStudyDate: null, studiedToday: false };
  }
  try {
    const stored = JSON.parse(raw) as StoredStreak;
    return {
      current: stored.current,
      lastStudyDate: stored.lastStudyDate,
      studiedToday: stored.lastStudyDate === today,
    };
  } catch {
    return { current: 0, lastStudyDate: null, studiedToday: false };
  }
}

/** Records activity for today and returns the updated streak. Idempotent. */
export function recordActivity(adapter: {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
}): StreakInfo {
  const today = todayKey();
  const current = readStreak(adapter);

  if (current.studiedToday) return current;

  const next = current.lastStudyDate === yesterdayKey() ? current.current + 1 : 1;
  const stored: StoredStreak = { current: next, lastStudyDate: today };
  adapter.set(STREAK_KEY, JSON.stringify(stored));
  return { current: next, lastStudyDate: today, studiedToday: true };
}

/** Forgets the stored streak (used when the learner resets their progress). */
export function clearStreak(adapter: { remove: (key: string) => void }): void {
  adapter.remove(STREAK_KEY);
}
