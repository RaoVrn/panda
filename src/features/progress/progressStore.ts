/**
 * Central progress store.
 *
 * Single source of truth for XP, levels, streaks, achievements, lesson
 * completion and quiz stats. Persists through the storage adapter (currently
 * localStorage); swapping to Supabase later means providing a new adapter.
 *
 * The previous store (`panda-progress` v0) only tracked completed lessons; a
 * version bump + migration keeps that progress when this store takes over.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { allLessons, moduleLessons } from "@/content/lessons";
import { modules } from "@/content/roadmap";
import {
  evaluateAchievements,
  type AchievementContext,
} from "./achievements";
import { localStorageAdapter, toZustandStorage } from "./localStorage";
import { recordActivity, readStreak, todayKey } from "./streak";
import { levelInfo, XP_REWARDS } from "./xp";
import type {
  ProgressToast,
  QuizAwardState,
  QuizRecord,
  StreakInfo,
} from "./types";

let toastSeq = 0;

function pushToast(toasts: ProgressToast[], toast: Omit<ProgressToast, "id">): ProgressToast[] {
  return [...toasts.slice(-3), { ...toast, id: ++toastSeq }];
}

interface ProgressState {
  xp: number;
  completedLessonIds: string[];
  startedLessonIds: string[];
  achievements: Record<string, number>;
  streakCurrent: number;
  lastStudyDate: string | null;
  dailyXp: Record<string, number>;
  quizStats: Record<string, QuizRecord>;
  quizAwards: Record<string, QuizAwardState>;
  practiceDone: Record<string, boolean>;
  lessonStartTimes: Record<string, number>;
  aiQuestions: number;
  practiceCount: number;
  totalQuizCorrect: number;
  totalQuizQuestions: number;
  toasts: ProgressToast[];

  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
  toggleCompleted: (lessonId: string) => void;
  recordQuizResult: (lessonId: string, correct: number, total: number) => void;
  recordPractice: (lessonId: string) => void;
  recordAiQuestion: () => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

const initialStreak: StreakInfo = readStreak(localStorageAdapter);

function achievementContext(state: {
  completedLessonIds: string[];
  quizStats: Record<string, QuizRecord>;
  aiQuestions: number;
  practiceCount: number;
}): AchievementContext {
  const modulesComplete: Record<string, boolean> = {};
  for (const module of modules) {
    const lessons = moduleLessons(module.id);
    modulesComplete[module.id] =
      lessons.length > 0 &&
      lessons.every((lesson) => state.completedLessonIds.includes(lesson.id));
  }
  return {
    lessonsCompleted: state.completedLessonIds.length,
    totalLessons: allLessons().length,
    quizCompletedCount: Object.keys(state.quizStats).length,
    quizPerfectCount: Object.values(state.quizStats).filter((q) => q.perfect).length,
    aiQuestionsAsked: state.aiQuestions,
    practiceCount: state.practiceCount,
    modulesComplete,
  };
}

/** Module ids that are fully completed for a set of completed lessons. */
function completedModuleIds(completedLessonIds: string[]): Set<string> {
  const set = new Set<string>();
  for (const module of modules) {
    const lessons = moduleLessons(module.id);
    if (lessons.length > 0 && lessons.every((l) => completedLessonIds.includes(l.id))) {
      set.add(module.id);
    }
  }
  return set;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Adds XP, updates the streak and surfaces toasts (including level-ups). */
      const grantXp = (amount: number) => {
        if (amount <= 0) return;
        const streak = recordActivity(localStorageAdapter);
        const today = todayKey();
        const daily = get().dailyXp;
        const pruned: Record<string, number> = {};
        for (const [date, value] of Object.entries(daily)) {
          if (date === today || Date.now() - new Date(date).getTime() < 14 * 86400_000) {
            pruned[date] = value;
          }
        }
        const before = levelInfo(get().xp);
        const nextXp = get().xp + amount;
        const after = levelInfo(nextXp);
        const leveledUp = after.level > before.level;

        set((state) => ({
          xp: nextXp,
          streakCurrent: streak.current,
          lastStudyDate: streak.lastStudyDate,
          dailyXp: { ...pruned, [today]: (pruned[today] ?? 0) + amount },
          toasts: pushToast(state.toasts, { type: "xp", amount }),
        }));

        if (leveledUp) {
          set((state) => ({
            toasts: pushToast(state.toasts, {
              type: "levelup",
              emoji: "⭐",
              title: `Level ${after.level}`,
            }),
          }));
        }
      };

      /** Re-evaluates achievements and unlocks any that now pass. */
      const unlockAchievements = () => {
        const ctx = achievementContext(get());
        const newly = evaluateAchievements(ctx, get().achievements);
        if (newly.length === 0) return;
        const now = Date.now();
        set((state) => {
          const achievements = { ...state.achievements };
          let toasts = [...state.toasts];
          for (const achievement of newly) {
            achievements[achievement.id] = now;
            toasts = pushToast(toasts, {
              type: "achievement",
              emoji: achievement.emoji,
              title: achievement.title,
            });
          }
          return { achievements, toasts };
        });
      };

      return {
        xp: 0,
        completedLessonIds: [],
        startedLessonIds: [],
        achievements: {},
        streakCurrent: initialStreak.current,
        lastStudyDate: initialStreak.lastStudyDate,
        dailyXp: {},
        quizStats: {},
        quizAwards: {},
        practiceDone: {},
        lessonStartTimes: {},
        aiQuestions: 0,
        practiceCount: 0,
        totalQuizCorrect: 0,
        totalQuizQuestions: 0,
        toasts: [],

        startLesson: (lessonId) =>
          set((state) => ({
            startedLessonIds: state.startedLessonIds.includes(lessonId)
              ? state.startedLessonIds
              : [...state.startedLessonIds, lessonId],
            lessonStartTimes: state.lessonStartTimes[lessonId]
              ? state.lessonStartTimes
              : { ...state.lessonStartTimes, [lessonId]: Date.now() },
          })),

        completeLesson: (lessonId) => {
          if (get().completedLessonIds.includes(lessonId)) return;
          const before = completedModuleIds(get().completedLessonIds);
          const next = [...get().completedLessonIds, lessonId];
          set({ completedLessonIds: next });
          // Reading the lesson (+10) and finishing it (+40).
          grantXp(XP_REWARDS["read-lesson"] + XP_REWARDS["finish-lesson"]);

          // Celebrate any section (module) that just became complete.
          for (const id of completedModuleIds(next)) {
            if (before.has(id)) continue;
            const module = modules.find((m) => m.id === id);
            if (module) {
              set((state) => ({
                toasts: pushToast(state.toasts, {
                  type: "section",
                  emoji: "🏁",
                  title: `Section complete: ${module.title}`,
                }),
              }));
            }
          }

          unlockAchievements();
        },

        toggleCompleted: (lessonId) => {
          const done = get().completedLessonIds.includes(lessonId);
          set((state) => ({
            completedLessonIds: done
              ? state.completedLessonIds.filter((id) => id !== lessonId)
              : [...state.completedLessonIds, lessonId],
          }));
          if (!done) unlockAchievements();
        },

        recordQuizResult: (lessonId, correct, total) => {
          if (total <= 0) return;
          const awards = get().quizAwards[lessonId] ?? {
            base: false,
            firstCorrect: false,
            perfect: false,
          };
          const firstTime = !awards.base;
          const perfect = correct === total;

          let xp = 0;
          if (!awards.base) {
            xp += XP_REWARDS["quiz-complete"];
            awards.base = true;
          }
          if (!awards.firstCorrect && correct > 0) {
            xp += XP_REWARDS["first-correct"];
            awards.firstCorrect = true;
          }
          if (!awards.perfect && perfect) {
            xp += XP_REWARDS["perfect-quiz"];
            awards.perfect = true;
          }

          set((state) => {
            const previous = state.quizStats[lessonId];
            const best = previous && previous.correct >= correct ? previous : { correct, total, perfect };
            return {
              quizStats: { ...state.quizStats, [lessonId]: best },
              quizAwards: { ...state.quizAwards, [lessonId]: awards },
              // Accuracy totals only count the first completion of each quiz.
              totalQuizCorrect: state.totalQuizCorrect + (firstTime ? correct : 0),
              totalQuizQuestions: state.totalQuizQuestions + (firstTime ? total : 0),
            };
          });
          if (xp > 0) grantXp(xp);
          unlockAchievements();
        },

        recordPractice: (lessonId) => {
          if (get().practiceDone[lessonId]) return;
          set((state) => ({
            practiceDone: { ...state.practiceDone, [lessonId]: true },
            practiceCount: state.practiceCount + 1,
          }));
          grantXp(XP_REWARDS.practice);
          unlockAchievements();
        },

        recordAiQuestion: () => {
          set((state) => ({ aiQuestions: state.aiQuestions + 1 }));
          grantXp(XP_REWARDS["ask-ai"]);
          unlockAchievements();
        },

        dismissToast: (id) =>
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

        reset: () =>
          set({
            xp: 0,
            completedLessonIds: [],
            startedLessonIds: [],
            achievements: {},
            dailyXp: {},
            quizStats: {},
            quizAwards: {},
            practiceDone: {},
            lessonStartTimes: {},
            aiQuestions: 0,
            practiceCount: 0,
            totalQuizCorrect: 0,
            totalQuizQuestions: 0,
            toasts: [],
            streakCurrent: 0,
            lastStudyDate: null,
          }),
      };
    },
    {
      name: "panda-progress",
      version: 2,
      storage: createJSONStorage(() => toZustandStorage(localStorageAdapter)),
      partialize: (state) => ({
        xp: state.xp,
        completedLessonIds: state.completedLessonIds,
        startedLessonIds: state.startedLessonIds,
        achievements: state.achievements,
        streakCurrent: state.streakCurrent,
        lastStudyDate: state.lastStudyDate,
        dailyXp: state.dailyXp,
        quizStats: state.quizStats,
        quizAwards: state.quizAwards,
        practiceDone: state.practiceDone,
        lessonStartTimes: state.lessonStartTimes,
        aiQuestions: state.aiQuestions,
        practiceCount: state.practiceCount,
        totalQuizCorrect: state.totalQuizCorrect,
        totalQuizQuestions: state.totalQuizQuestions,
      }),
      migrate: (persisted, version) => {
        if (version >= 2) return persisted as ProgressState;
        const old = persisted as { completedLessonIds?: string[] };
        return { completedLessonIds: old.completedLessonIds ?? [] } as ProgressState;
      },
    },
  ),
);

/**
 * One-time repair so "lessons completed" never disagrees with XP. Learners who
 * completed lessons before XP existed keep their earned XP (read + finish per
 * completed lesson). Runs after hydration settles; silent, no toasts.
 */
window.setTimeout(() => {
  const state = useProgressStore.getState();
  if (state.completedLessonIds.length > 0 && state.xp === 0) {
    const reward = XP_REWARDS["read-lesson"] + XP_REWARDS["finish-lesson"];
    useProgressStore.setState({ xp: state.completedLessonIds.length * reward });
  }
}, 0);
