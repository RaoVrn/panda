/**
 * React hooks over the progress store for derived, memo-friendly values.
 *
 * Selectors must return stable references (primitives or existing state
 * references), never freshly-built objects or arrays. Returning a new object
 * each render makes `useSyncExternalStore` see a changed snapshot every frame
 * and loop ("Maximum update depth exceeded"). Derived objects are therefore
 * built with `useMemo` over the selected primitives.
 */

import { useMemo } from "react";
import type { ContentLesson } from "@/content/schema";
import { levelInfo } from "./xp";
import {
  lessonStatus,
  moduleProgress,
  type ModuleProgress,
} from "./lessonProgress";
import { useProgressStore } from "./progressStore";
import { todayKey } from "./streak";
import type {
  LevelInfo,
  ProfileStats,
  QuizRecord,
  StreakInfo,
} from "./types";

export function useXp(): number {
  return useProgressStore((state) => state.xp);
}

/** XP earned today (drives the "Today's goal" panel). */
export function useTodayXp(): number {
  return useProgressStore((state) => state.dailyXp[todayKey()] ?? 0);
}

export function useLevel(): LevelInfo {
  const xp = useXp();
  return useMemo(() => levelInfo(xp), [xp]);
}

export function useStreak(): StreakInfo {
  const current = useProgressStore((state) => state.streakCurrent);
  const lastStudyDate = useProgressStore((state) => state.lastStudyDate);
  return useMemo(() => {
    const today = todayKey();
    return { current, lastStudyDate, studiedToday: lastStudyDate === today };
  }, [current, lastStudyDate]);
}

export function useLessonStatus(lesson: ContentLesson): ReturnType<typeof lessonStatus> {
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds);
  const startedLessonIds = useProgressStore((state) => state.startedLessonIds);
  return useMemo(
    () => lessonStatus(lesson, { completedLessonIds, startedLessonIds }),
    [lesson, completedLessonIds, startedLessonIds],
  );
}

export function useModuleProgress(moduleId: string): ModuleProgress {
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds);
  const startedLessonIds = useProgressStore((state) => state.startedLessonIds);
  return useMemo(
    () => moduleProgress(moduleId, { completedLessonIds, startedLessonIds }),
    [moduleId, completedLessonIds, startedLessonIds],
  );
}

export function useQuizRecords(): Record<string, QuizRecord> {
  return useProgressStore((state) => state.quizStats);
}

export function useProfileStats(): ProfileStats {
  const lessonsCompleted = useProgressStore((state) => state.completedLessonIds.length);
  const lessonsStarted = useProgressStore((state) => state.startedLessonIds.length);
  const totalQuizQuestions = useProgressStore((state) => state.totalQuizQuestions);
  const correctQuizAnswers = useProgressStore((state) => state.totalQuizCorrect);
  const aiQuestionsAsked = useProgressStore((state) => state.aiQuestions);
  const practiceCount = useProgressStore((state) => state.practiceCount);
  const commandsExecuted = useProgressStore((state) => state.commandsExecuted);
  const missionsCompleted = useProgressStore((state) => state.missionsCompleted);
  const timeSpentSeconds = useProgressStore((state) =>
    Object.values(state.lessonTimeSpent).reduce((sum, seconds) => sum + seconds, 0),
  );
  return useMemo(
    () => ({
      lessonsCompleted,
      lessonsStarted,
      totalQuizQuestions,
      correctQuizAnswers,
      aiQuestionsAsked,
      practiceCount,
      commandsExecuted,
      missionsCompleted,
      timeSpentSeconds,
      quizAccuracy:
        totalQuizQuestions > 0
          ? Math.round((correctQuizAnswers / totalQuizQuestions) * 100)
          : null,
    }),
    [
      lessonsCompleted,
      lessonsStarted,
      totalQuizQuestions,
      correctQuizAnswers,
      aiQuestionsAsked,
      practiceCount,
      commandsExecuted,
      missionsCompleted,
      timeSpentSeconds,
    ],
  );
}

export function useUnlockedAchievements(): string[] {
  const achievements = useProgressStore((state) => state.achievements);
  return useMemo(() => Object.keys(achievements), [achievements]);
}
