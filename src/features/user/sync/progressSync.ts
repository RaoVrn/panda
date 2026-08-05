/**
 * progressSync — bridges the local learning engine with the user's persisted
 * learning profile in Supabase.
 *
 *  · push  — snapshot the zustand progress store into a `learning_profiles` row
 *  · pull  — hydrate the local stores from a fetched `learning_profile`
 *
 * When a user signs in, Supabase is the source of truth: the profile is pulled
 * and the local engine is hydrated, then every change is pushed back (debounced
 * by the auth provider).
 */

import { modules } from "@/content/curriculum";
import { moduleLessons } from "@/content/lessons";
import { useProgressStore } from "@/features/progress/progressStore";
import { levelInfo } from "@/features/progress/xp";
import { upsertLearningProfile } from "@/features/user/services/profileService";
import type {
  LearningProfile,
  LearningProfileRow,
  QuizStat,
  UserPreferences,
} from "@/features/user/types";

export function buildLearningProfileRow(
  userId: string,
  preferences?: UserPreferences,
): LearningProfileRow {
  const state = useProgressStore.getState();

  const completedModules: Record<string, boolean> = {};
  for (const module of modules) {
    const lessons = moduleLessons(module.id);
    completedModules[module.id] =
      lessons.length > 0 &&
      lessons.every((lesson) => state.completedLessonIds.includes(lesson.id));
  }

  const quizStats: Record<string, QuizStat> = {};
  for (const [lessonId, record] of Object.entries(state.quizStats)) {
    quizStats[lessonId] = { correct: record.correct, total: record.total };
  }

  return {
    user_id: userId,
    level: levelInfo(state.xp).level,
    xp: state.xp,
    total_xp: state.xp,
    completed_lessons: state.completedLessonIds,
    completed_modules: completedModules,
    streak: state.streakCurrent,
    last_lesson: state.completedLessonIds.at(-1) ?? null,
    last_opened_lesson: state.startedLessonIds.at(-1) ?? null,
    quiz_stats: quizStats,
    badges: state.achievements,
    preferences: preferences ?? {},
  };
}

/** Push the current local state to Supabase. */
export async function pushProgressToSupabase(
  userId: string,
  preferences?: UserPreferences,
): Promise<void> {
  await upsertLearningProfile(buildLearningProfileRow(userId, preferences));
}

/** Hydrate the local engine from a fetched learning profile. */
export function hydrateFromLearningProfile(profile: LearningProfile): void {
  const quizStats: Record<string, { correct: number; total: number; perfect: boolean }> = {};
  for (const [lessonId, stat] of Object.entries(profile.quizStats)) {
    quizStats[lessonId] = {
      correct: stat.correct,
      total: stat.total,
      perfect: stat.total > 0 && stat.correct === stat.total,
    };
  }

  useProgressStore.setState({
    xp: profile.xp,
    completedLessonIds: profile.completedLessons,
    achievements: profile.badges,
    streakCurrent: profile.streak,
    quizStats,
  });
}
