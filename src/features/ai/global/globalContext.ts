/**
 * Global Panda AI context.
 *
 * Builds the app-wide context the /panda-ai assistant receives every turn:
 * the whole course and roadmap, the learner's progress, achievements,
 * preferences and learning history. When the assistant is opened from inside
 * a lesson, the lesson's context is captured and appended so it stays
 * context-aware.
 */

import type { LessonContext } from "@/lib/ai/types";
import { COURSES, modules, type Course } from "@/content/curriculum";
import { allLessons } from "@/content/lessons";
import { router } from "@/app/router";
import { useProgressStore } from "@/features/progress/progressStore";
import { ACHIEVEMENTS } from "@/features/progress/achievements";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { memorySummary } from "@/features/ai/memory/conversationMemory";
import { nextLessonToStudy } from "@/features/progress/progressService";
import { levelInfo } from "@/features/progress/xp";
import { describeAiRoutes } from "@/lib/navigation/routeRegistry";
import { describeCourseContent } from "@/lib/navigation/conceptIndex";
import { describeDocsContent } from "@/features/docs/guideIndex";
import { takeCapturedLesson } from "@/features/ai/global/lessonCapture";

/** The signed-in user's identity, set by the page when it mounts. */
let cachedUser: { name?: string; email?: string } | null = null;

/** Hand the signed-in user's identity to the context builder. */
export function setGlobalAiUser(user: { name?: string; email?: string } | null): void {
  cachedUser = user;
}

function courseLabel(course: Course): string {
  const moduleCount = modules.filter((m) => m.course === course.id).length;
  const lessonCount = allLessons().length;
  return `${course.title}: ${moduleCount} modules, ${lessonCount} lessons`;
}

/** Assembles the full app-wide context for the global assistant. */
export function buildGlobalContext(): LessonContext {
  const progress = useProgressStore.getState();
  const prefs = usePreferencesStore.getState();
  const course = COURSES[0];

  const completedTitles = allLessons()
    .filter((lesson) => progress.completedLessonIds.includes(lesson.id))
    .map((lesson) => lesson.title);

  const completedModules = modules
    .filter((module) => {
      const lessons = allLessons().filter((l) => module.lessons.includes(l.id));
      return (
        lessons.length > 0 &&
        lessons.every((l) => progress.completedLessonIds.includes(l.id))
      );
    })
    .map((module) => module.title);

  const unlockedIds = Object.keys(progress.achievements);
  const unlockedTitles = ACHIEVEMENTS.filter((a) =>
    unlockedIds.includes(a.id),
  ).map((a) => a.title);

  const next = nextLessonToStudy(progress.completedLessonIds);

  const completedLessonSlugs = allLessons()
    .filter((lesson) => progress.completedLessonIds.includes(lesson.id))
    .map((lesson) => lesson.slug);

  const captured = takeCapturedLesson();

  const base: LessonContext = {
    contextReady: Boolean(captured),
    course: course?.title,
    courseOverview: course ? courseLabel(course) : undefined,
    currentRoute: router.state.location.pathname,
    userName: cachedUser?.name,
    userEmail: cachedUser?.email,
    completedLessonSlugs:
      completedLessonSlugs.length > 0 ? completedLessonSlugs.join(", ") : "none",
    completedCount: progress.completedLessonIds.length,
    totalCount: allLessons().length,
    completedLessons:
      completedTitles.length > 0 ? completedTitles.slice(-8).join(" · ") : "none",
    modulesCompleted:
      completedModules.length > 0 ? completedModules.join(" · ") : "none",
    recommendedNext: next?.title,
    achievementsSummary:
      unlockedIds.length > 0
        ? `${unlockedIds.length} of ${ACHIEVEMENTS.length} unlocked: ${unlockedTitles.slice(0, 8).join(", ")}`
        : `none yet (${ACHIEVEMENTS.length} available)`,
    xp: progress.xp,
    level: levelInfo(progress.xp).level,
    streakDays: progress.streakCurrent,
    explanationStyle: prefs.aiExplanationStyle,
    lessonMode: prefs.defaultMode ?? useLessonModeStore.getState().mode,
    animationSpeed: prefs.animationSpeed,
    theme: prefs.theme,
    memory: memorySummary() || undefined,
    aiTools: `${describeAiRoutes()}\n${describeCourseContent()}\n${describeDocsContent()}`,
  };

  // Merge the captured lesson context so the assistant knows where the
  // learner came from (it applies to this turn only).
  if (captured) {
    return {
      ...base,
      ...captured,
      contextReady: true,
      courseOverview: base.courseOverview,
      completedCount: base.completedCount,
      totalCount: base.totalCount,
      completedLessons: base.completedLessons,
      completedLessonSlugs: base.completedLessonSlugs,
      modulesCompleted: base.modulesCompleted,
      recommendedNext: base.recommendedNext,
      achievementsSummary: base.achievementsSummary,
      xp: base.xp,
      level: base.level,
      streakDays: base.streakDays,
      explanationStyle: base.explanationStyle,
      lessonMode: base.lessonMode,
      animationSpeed: base.animationSpeed,
      theme: base.theme,
      memory: base.memory,
    };
  }

  return base;
}
