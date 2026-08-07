/**
 * Achievement definitions and evaluation.
 *
 * Each achievement declares a pure condition over a snapshot of the learner's
 * progress. `evaluateAchievements` returns every achievement that should be
 * unlocked but isn't yet.
 */

export interface AchievementDefinition {
  id: string;
  emoji: string;
  title: string;
  description: string;
  test: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  lessonsCompleted: number;
  totalLessons: number;
  quizCompletedCount: number;
  quizPerfectCount: number;
  aiQuestionsAsked: number;
  practiceCount: number;
  /** moduleId -> whether every authored lesson in it is complete. */
  modulesComplete: Record<string, boolean>;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-lesson",
    emoji: "🌱",
    title: "First Lesson",
    description: "Finish your very first lesson.",
    test: (ctx) => ctx.lessonsCompleted >= 1,
  },
  {
    id: "first-quiz",
    emoji: "🧠",
    title: "First Quiz",
    description: "Complete a quiz for the first time.",
    test: (ctx) => ctx.quizCompletedCount >= 1,
  },
  {
    id: "perfect-quiz",
    emoji: "🔥",
    title: "Perfect Quiz",
    description: "Score 100% on a quiz.",
    test: (ctx) => ctx.quizPerfectCount >= 1,
  },
  {
    id: "first-ai",
    emoji: "💬",
    title: "First AI Question",
    description: "Ask Panda AI your first question.",
    test: (ctx) => ctx.aiQuestionsAsked >= 1,
  },
  {
    id: "read-everything",
    emoji: "📚",
    title: "Read Everything",
    description: "Complete every lesson in the course.",
    test: (ctx) => ctx.totalLessons > 0 && ctx.lessonsCompleted >= ctx.totalLessons,
  },
  {
    id: "git-basics",
    emoji: "🏁",
    title: "Completed Core Commands",
    description: "Finish every lesson in the Core Commands module.",
    test: (ctx) => ctx.modulesComplete["core-commands"] === true,
  },
];

/** Returns achievements that just became unlockable. */
export function evaluateAchievements(
  ctx: AchievementContext,
  unlockedIds: Record<string, number>,
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(
    (achievement) => !unlockedIds[achievement.id] && achievement.test(ctx),
  );
}
