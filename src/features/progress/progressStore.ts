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
import { modules } from "@/content/curriculum";
import {
  ACHIEVEMENTS,
  buildAchievementContext,
  evaluateAchievements,
} from "./achievements";
import { useAchievementCelebration } from "@/features/progress/components/achievementCelebrationStore";
import { useNotificationCenter } from "@/features/notifications/notificationCenterStore";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { toZustandStorage, userScopedAdapter } from "./localStorage";
import { clearStreak, recordActivity, readStreak, todayKey } from "./streak";
import { levelInfo, lessonXp, XP_REWARDS } from "./xp";
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
  /** Lessons the learner has explored in Interactive mode (completion gate). */
  interactiveTouched: Record<string, boolean>;
  aiQuestions: number;
  practiceCount: number;
  totalQuizCorrect: number;
  totalQuizQuestions: number;
  /** Total Git commands executed across all terminals/playgrounds. */
  commandsExecuted: number;
  /** Total playground missions fully completed. */
  missionsCompleted: number;
  /** Lessons whose playground mission has been completed (idempotence). */
  missionsDone: Record<string, boolean>;
  /** Seconds actively spent per lesson (accumulated in the lesson player). */
  lessonTimeSpent: Record<string, number>;
  toasts: ProgressToast[];

  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, xpReward?: number) => void;
  toggleCompleted: (lessonId: string) => void;
  markInteractive: (lessonId: string) => void;
  recordQuizResult: (lessonId: string, correct: number, total: number) => void;
  recordPractice: (lessonId: string) => void;
  recordAiQuestion: () => void;
  recordCommand: () => void;
  recordMissionComplete: (lessonId: string) => void;
  recordLessonTime: (lessonId: string, seconds: number) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

const initialStreak: StreakInfo = readStreak(userScopedAdapter);

/** Module ids that are fully completed for a set of completed lessons. */
function completedModuleIds(completedLessonIds: string[]): Set<string> {
  const set = new Set<string>();
  for (const module of modules) {
    const lessonIds = module.lessons;
    if (lessonIds.length > 0 && lessonIds.every((id) => completedLessonIds.includes(id))) {
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
        const streak = recordActivity(userScopedAdapter);
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
        const ctx = buildAchievementContext(get());
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
        // Badges carry a small one-time XP reward.
        for (const achievement of newly) grantXp(achievement.rewardXp);
        // Queue a one-time centered celebration for each genuine new unlock.
        for (const achievement of newly) {
          useAchievementCelebration.getState().enqueue(achievement);
          if (usePreferencesStore.getState().notifyAchievements !== false) {
            useNotificationCenter.getState().notify({
              type: "achievement",
              reference: `achievement:${achievement.id}`,
              title: "Achievement unlocked",
              message: achievement.title,
              metadata: { achievementId: achievement.id },
            });
          }
        }
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
        interactiveTouched: {},
        aiQuestions: 0,
        practiceCount: 0,
        totalQuizCorrect: 0,
        totalQuizQuestions: 0,
        commandsExecuted: 0,
        missionsCompleted: 0,
        missionsDone: {},
        lessonTimeSpent: {},
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

        completeLesson: (lessonId, xpReward) => {
          if (get().completedLessonIds.includes(lessonId)) return;
          const before = completedModuleIds(get().completedLessonIds);
          const next = [...get().completedLessonIds, lessonId];
          set({ completedLessonIds: next });
          // A lesson's XP reward overrides the default read + finish rewards.
          const reward =
            xpReward ??
            XP_REWARDS["read-lesson"] + XP_REWARDS["finish-lesson"];
          grantXp(reward);

          // A real lesson completion is worth a notification.
          if (usePreferencesStore.getState().notifyLessons !== false) {
            // Loaded lazily so the progress store never pulls the whole lesson
            // registry into the initial bundle.
            void import("@/content/lessons").then(({ getLesson }) => {
              const completedLesson = getLesson(lessonId);
              if (!completedLesson) return;
              useNotificationCenter.getState().notify({
                type: "lesson",
                reference: `lesson:${lessonId}`,
                title: "Lesson completed",
                message: completedLesson.title,
                metadata: { lessonSlug: completedLesson.slug },
              });
            });
          }

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
              if (usePreferencesStore.getState().notifyModules !== false) {
                useNotificationCenter.getState().notify({
                  type: "module",
                  reference: `module:${module.id}`,
                  title: "Module completed",
                  message: module.title,
                  metadata: { moduleId: module.id },
                });
              }
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

        markInteractive: (lessonId) =>
          set((state) =>
            state.interactiveTouched[lessonId]
              ? state
              : {
                  interactiveTouched: {
                    ...state.interactiveTouched,
                    [lessonId]: true,
                  },
                },
          ),

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

        recordCommand: () => {
          set((state) => ({ commandsExecuted: state.commandsExecuted + 1 }));
        },

        recordMissionComplete: (lessonId) => {
          if (get().missionsDone[lessonId]) return;
          set((state) => ({
            missionsCompleted: state.missionsCompleted + 1,
            missionsDone: { ...state.missionsDone, [lessonId]: true },
          }));
        },

        recordLessonTime: (lessonId, seconds) => {
          if (seconds <= 0) return;
          set((state) => ({
            lessonTimeSpent: {
              ...state.lessonTimeSpent,
              [lessonId]: (state.lessonTimeSpent[lessonId] ?? 0) + seconds,
            },
          }));
        },

        dismissToast: (id) =>
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

        reset: () => {
          // The streak also lives in its own localStorage key; clear it too so
          // a reset can't be resurrected by the next XP action.
          clearStreak(userScopedAdapter);
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
            interactiveTouched: {},
            aiQuestions: 0,
            practiceCount: 0,
            totalQuizCorrect: 0,
            totalQuizQuestions: 0,
            commandsExecuted: 0,
            missionsCompleted: 0,
            missionsDone: {},
            lessonTimeSpent: {},
            toasts: [],
            streakCurrent: 0,
            lastStudyDate: null,
          });
        },
      };
    },
    {
      name: "panda-progress",
      version: 4,
      storage: createJSONStorage(() => toZustandStorage(userScopedAdapter)),
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
        interactiveTouched: state.interactiveTouched,
        aiQuestions: state.aiQuestions,
        practiceCount: state.practiceCount,
        totalQuizCorrect: state.totalQuizCorrect,
        totalQuizQuestions: state.totalQuizQuestions,
        commandsExecuted: state.commandsExecuted,
        missionsCompleted: state.missionsCompleted,
        missionsDone: state.missionsDone,
        lessonTimeSpent: state.lessonTimeSpent,
      }),
      migrate: (persisted) => {
        const prev = (persisted ?? {}) as Partial<ProgressState>;
        // Rename legacy achievement ids to their new equivalents so existing
        // users keep their earned milestones. Legacy ids with no mapping (the
        // removed quiz/interaction achievements) are dropped entirely.
        const remap = (achievements: Record<string, number>) => {
          const map: Record<string, string> = {
            "first-lesson": "git-beginner",
            "finished-first-module": "git-foundations",
            "history-master": "history-explorer",
            "merge-master": "merge-point",
            "first-remote": "remote-explorer",
            "finished-course": "git-master",
          };
          const valid = new Set(ACHIEVEMENTS.map((a) => a.id));
          const out: Record<string, number> = {};
          for (const [id, ts] of Object.entries(achievements)) {
            const target = map[id] ?? id;
            if (valid.has(target)) out[target] = ts;
          }
          return out;
        };

        const migrated: Partial<ProgressState> = {
          ...prev,
          completedLessonIds: prev.completedLessonIds ?? [],
          achievements: prev.achievements ? remap(prev.achievements) : {},
          commandsExecuted: prev.commandsExecuted ?? 0,
          missionsCompleted: prev.missionsCompleted ?? 0,
          missionsDone: prev.missionsDone ?? {},
          lessonTimeSpent: prev.lessonTimeSpent ?? {},
        };
        return migrated as ProgressState;
      },
    },
  ),
);

/**
 * One-time repair so "lessons completed" never disagrees with XP. Learners who
 * completed lessons before XP existed keep their earned XP (difficulty-based
 * reward per completed lesson). Runs after hydration settles; silent, no toasts.
 */
window.setTimeout(() => {
  const state = useProgressStore.getState();
  if (state.completedLessonIds.length > 0 && state.xp === 0) {
    // Lessons are lazy-loaded so the progress store stays out of the initial
    // bundle; the repair runs once shortly after hydration anyway.
    void import("@/content/lessons").then(({ allLessons }) => {
      const reward = allLessons()
        .filter((lesson) => state.completedLessonIds.includes(lesson.id))
        .reduce((sum, lesson) => sum + lessonXp(lesson), 0);
      useProgressStore.setState({ xp: reward });
    });
  }
}, 0);
