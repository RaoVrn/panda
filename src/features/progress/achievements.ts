/**
 * Achievement definitions and evaluation.
 *
 * The single source of truth for the achievement system: what each
 * achievement is (id, name, icon, category), how to earn it (requirement,
 * `test`), how close the learner is (`progress`) and its XP reward. Unlock
 * state lives in the progress store (`achievements: id -> earnedAt`) and is
 * synced with the learner's Supabase profile, so the UI always reflects real
 * user state — never hard-coded values.
 */

import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Clock,
  Code2,
  Compass,
  Dumbbell,
  Flame,
  Gamepad2,
  Gem,
  GitBranch,
  GitMerge,
  Globe,
  History,
  Hourglass,
  Layers,
  Leaf,
  MessageSquareText,
  Package,
  Rocket,
  Sparkles,
  Sprout,
  Star,
  Target,
  Terminal,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { modules } from "@/content/curriculum";
import { moduleLessons } from "@/content/lessons";
import type { QuizRecord } from "./types";

export type AchievementCategoryId =
  | "journey"
  | "modules"
  | "practice"
  | "habits"
  | "engagement";

export interface AchievementCategory {
  id: AchievementCategoryId;
  label: string;
}

/** Categories in display order. */
export const CATEGORIES: AchievementCategory[] = [
  { id: "journey", label: "Journey" },
  { id: "modules", label: "Modules" },
  { id: "practice", label: "Practice" },
  { id: "habits", label: "Habits" },
  { id: "engagement", label: "Engagement" },
];

export interface AchievementProgress {
  current: number;
  max: number;
}

export interface AchievementDefinition {
  id: string;
  /** Kept for small celebrations (toasts); the UI uses `icon`. */
  emoji: string;
  icon: LucideIcon;
  title: string;
  /** One short line shown on cards. */
  description: string;
  /** Exactly what the learner must do to unlock it. */
  requirement: string;
  category: AchievementCategoryId;
  /** XP granted the moment the achievement unlocks. */
  rewardXp: number;
  test: (ctx: AchievementContext) => boolean;
  /** Optional numeric progress, shown when available. */
  progress?: (ctx: AchievementContext) => AchievementProgress;
}

export interface AchievementContext {
  xp: number;
  lessonsCompleted: number;
  totalLessons: number;
  completedLessons: Set<string>;
  streakDays: number;
  quizCompletedCount: number;
  quizPerfectCount: number;
  aiQuestionsAsked: number;
  practiceCount: number;
  commandsExecuted: number;
  missionsCompleted: number;
  timeSpentSeconds: number;
  /** moduleId -> whether every authored lesson in it is complete. */
  modulesComplete: Record<string, boolean>;
  /** moduleId -> { completed, total }. */
  moduleProgress: Record<string, AchievementProgress>;
}

/** The raw progress-store slice needed to build an achievement context. */
export interface AchievementStateSnapshot {
  xp: number;
  completedLessonIds: string[];
  streakCurrent: number;
  quizStats: Record<string, QuizRecord>;
  aiQuestions: number;
  practiceCount: number;
  commandsExecuted: number;
  missionsCompleted: number;
  lessonTimeSpent: Record<string, number>;
}

/** Builds the full achievement context from a persisted-store snapshot. */
export function buildAchievementContext(
  s: AchievementStateSnapshot,
): AchievementContext {
  const completed = new Set(s.completedLessonIds);
  const moduleProgress: Record<string, AchievementProgress> = {};
  const modulesComplete: Record<string, boolean> = {};
  for (const module of modules) {
    const total = moduleLessons(module.id).length;
    const done = moduleLessons(module.id).filter((l) => completed.has(l.id)).length;
    moduleProgress[module.id] = { current: done, max: total };
    modulesComplete[module.id] = total > 0 && done === total;
  }
  return {
    xp: s.xp,
    lessonsCompleted: s.completedLessonIds.length,
    totalLessons: Object.values(moduleProgress).reduce((sum, p) => sum + p.max, 0),
    completedLessons: completed,
    streakDays: s.streakCurrent,
    quizCompletedCount: Object.keys(s.quizStats).length,
    quizPerfectCount: Object.values(s.quizStats).filter((q) => q.perfect).length,
    aiQuestionsAsked: s.aiQuestions,
    practiceCount: s.practiceCount,
    commandsExecuted: s.commandsExecuted,
    missionsCompleted: s.missionsCompleted,
    timeSpentSeconds: Object.values(s.lessonTimeSpent).reduce((sum, v) => sum + v, 0),
    modulesComplete,
    moduleProgress,
  };
}

const fullCourse = (ctx: AchievementContext) => ({
  current: ctx.lessonsCompleted,
  max: ctx.totalLessons,
});

const one = (value: boolean): AchievementProgress => ({ current: value ? 1 : 0, max: 1 });

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-lesson",
    emoji: "🌱",
    icon: Sprout,
    title: "First Lesson",
    description: "Completed your first lesson.",
    requirement: "Complete any lesson in the course.",
    category: "journey",
    rewardXp: 15,
    test: (ctx) => ctx.lessonsCompleted >= 1,
    progress: (ctx) => ({ current: ctx.lessonsCompleted, max: 1 }),
  },
  {
    id: "git-beginner",
    emoji: "🐣",
    icon: Leaf,
    title: "Git Beginner",
    description: "Understand what Git is and why it exists.",
    requirement: "Finish the 'What is Git?' lesson.",
    category: "journey",
    rewardXp: 15,
    test: (ctx) => ctx.completedLessons.has("what-is-git"),
    progress: (ctx) => one(ctx.completedLessons.has("what-is-git")),
  },
  {
    id: "first-commit",
    emoji: "📦",
    icon: Package,
    title: "First Commit",
    description: "Saved your first snapshot.",
    requirement: "Finish the 'git commit' lesson.",
    category: "journey",
    rewardXp: 20,
    test: (ctx) => ctx.completedLessons.has("git-commit"),
    progress: (ctx) => one(ctx.completedLessons.has("git-commit")),
  },
  {
    id: "explorer",
    emoji: "🚀",
    icon: Compass,
    title: "Git Explorer",
    description: "Explored five lessons.",
    requirement: "Complete 5 lessons.",
    category: "journey",
    rewardXp: 20,
    test: (ctx) => ctx.lessonsCompleted >= 5,
    progress: (ctx) => ({ current: Math.min(ctx.lessonsCompleted, 5), max: 5 }),
  },
  {
    id: "veteran",
    emoji: "🐼",
    icon: Award,
    title: "Panda Veteran",
    description: "A dedicated learner with a live streak.",
    requirement: "Complete 20 lessons and keep a 3-day streak.",
    category: "journey",
    rewardXp: 60,
    test: (ctx) => ctx.lessonsCompleted >= 20 && ctx.streakDays >= 3,
    progress: (ctx) => ({ current: Math.min(ctx.lessonsCompleted, 20), max: 20 }),
  },
  {
    id: "finished-course",
    emoji: "🏆",
    icon: Trophy,
    title: "Finished Entire Course",
    description: "Completed every lesson.",
    requirement: "Complete all 45 lessons in the course.",
    category: "journey",
    rewardXp: 200,
    test: (ctx) => ctx.totalLessons > 0 && ctx.lessonsCompleted >= ctx.totalLessons,
    progress: fullCourse,
  },
  {
    id: "finished-first-module",
    emoji: "📖",
    icon: BookOpen,
    title: "Finished First Module",
    description: "Completed Git Fundamentals.",
    requirement: "Complete all lessons in Git Fundamentals.",
    category: "modules",
    rewardXp: 30,
    test: (ctx) => ctx.modulesComplete["git-fundamentals"] === true,
    progress: (ctx) => ctx.moduleProgress["git-fundamentals"] ?? { current: 0, max: 0 },
  },
  {
    id: "core-commands",
    emoji: "🏁",
    icon: Layers,
    title: "Core Commands",
    description: "Completed the Core Commands module.",
    requirement: "Complete all lessons in Core Commands.",
    category: "modules",
    rewardXp: 40,
    test: (ctx) => ctx.modulesComplete["core-commands"] === true,
    progress: (ctx) => ctx.moduleProgress["core-commands"] ?? { current: 0, max: 0 },
  },
  {
    id: "history-master",
    emoji: "🕰️",
    icon: History,
    title: "History Reader",
    description: "Completed the History module.",
    requirement: "Complete all lessons in History.",
    category: "modules",
    rewardXp: 40,
    test: (ctx) => ctx.modulesComplete["history"] === true,
    progress: (ctx) => ctx.moduleProgress["history"] ?? { current: 0, max: 0 },
  },
  {
    id: "branch-master",
    emoji: "🌿",
    icon: GitBranch,
    title: "Branch Master",
    description: "Completed the Branching module.",
    requirement: "Complete all lessons in Branching.",
    category: "modules",
    rewardXp: 50,
    test: (ctx) => ctx.modulesComplete["branching"] === true,
    progress: (ctx) => ctx.moduleProgress["branching"] ?? { current: 0, max: 0 },
  },
  {
    id: "merge-master",
    emoji: "🔀",
    icon: GitMerge,
    title: "Merge Master",
    description: "Merged your first branches.",
    requirement: "Complete the merge lesson.",
    category: "modules",
    rewardXp: 25,
    test: (ctx) => ctx.completedLessons.has("merge"),
    progress: (ctx) => one(ctx.completedLessons.has("merge")),
  },
  {
    id: "first-remote",
    emoji: "🌍",
    icon: Globe,
    title: "First Remote Repository",
    description: "Completed the Remote Repositories module.",
    requirement: "Complete all lessons in Remote Repositories.",
    category: "modules",
    rewardXp: 60,
    test: (ctx) => ctx.modulesComplete["remote-repositories"] === true,
    progress: (ctx) => ctx.moduleProgress["remote-repositories"] ?? { current: 0, max: 0 },
  },
  {
    id: "advanced-git",
    emoji: "🧗",
    icon: Rocket,
    title: "Advanced Git",
    description: "Completed the Advanced Git module.",
    requirement: "Complete all lessons in Advanced Git.",
    category: "modules",
    rewardXp: 75,
    test: (ctx) => ctx.modulesComplete["advanced-git"] === true,
    progress: (ctx) => ctx.moduleProgress["advanced-git"] ?? { current: 0, max: 0 },
  },
  {
    id: "first-quiz",
    emoji: "🧠",
    icon: Brain,
    title: "First Quiz",
    description: "Completed a quiz.",
    requirement: "Complete any lesson quiz.",
    category: "practice",
    rewardXp: 15,
    test: (ctx) => ctx.quizCompletedCount >= 1,
    progress: (ctx) => ({ current: ctx.quizCompletedCount, max: 1 }),
  },
  {
    id: "perfect-quiz",
    emoji: "🎯",
    icon: Target,
    title: "First Perfect Quiz",
    description: "Scored 100% on a quiz.",
    requirement: "Score 100% on any quiz.",
    category: "practice",
    rewardXp: 25,
    test: (ctx) => ctx.quizPerfectCount >= 1,
    progress: (ctx) => ({ current: ctx.quizPerfectCount, max: 1 }),
  },
  {
    id: "mission-10",
    emoji: "🎮",
    icon: Gamepad2,
    title: "Mission Complete",
    description: "Finished ten playground missions.",
    requirement: "Complete 10 playground missions.",
    category: "practice",
    rewardXp: 30,
    test: (ctx) => ctx.missionsCompleted >= 10,
    progress: (ctx) => ({ current: Math.min(ctx.missionsCompleted, 10), max: 10 }),
  },
  {
    id: "practice-10",
    emoji: "🏋️",
    icon: Dumbbell,
    title: "Practice Makes Perfect",
    description: "Completed ten practice exercises.",
    requirement: "Complete 10 practice exercises.",
    category: "practice",
    rewardXp: 25,
    test: (ctx) => ctx.practiceCount >= 10,
    progress: (ctx) => ({ current: Math.min(ctx.practiceCount, 10), max: 10 }),
  },
  {
    id: "streak-7",
    emoji: "🔥",
    icon: Flame,
    title: "7 Day Streak",
    description: "Studied seven days in a row.",
    requirement: "Study 7 days in a row.",
    category: "habits",
    rewardXp: 25,
    test: (ctx) => ctx.streakDays >= 7,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 7), max: 7 }),
  },
  {
    id: "streak-30",
    emoji: "⚡",
    icon: Zap,
    title: "30 Day Streak",
    description: "Studied for a whole month.",
    requirement: "Study 30 days in a row.",
    category: "habits",
    rewardXp: 60,
    test: (ctx) => ctx.streakDays >= 30,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 30), max: 30 }),
  },
  {
    id: "command-100",
    emoji: "⌨️",
    icon: Terminal,
    title: "100 Commands",
    description: "Ran one hundred Git commands.",
    requirement: "Run 100 Git commands.",
    category: "habits",
    rewardXp: 30,
    test: (ctx) => ctx.commandsExecuted >= 100,
    progress: (ctx) => ({ current: Math.min(ctx.commandsExecuted, 100), max: 100 }),
  },
  {
    id: "command-1000",
    emoji: "🖥️",
    icon: Code2,
    title: "Command Veteran",
    description: "Ran one thousand Git commands.",
    requirement: "Run 1,000 Git commands.",
    category: "habits",
    rewardXp: 75,
    test: (ctx) => ctx.commandsExecuted >= 1000,
    progress: (ctx) => ({ current: Math.min(ctx.commandsExecuted, 1000), max: 1000 }),
  },
  {
    id: "time-60",
    emoji: "⏱️",
    icon: Clock,
    title: "One Hour In",
    description: "Spent an hour learning.",
    requirement: "Spend 1 hour learning.",
    category: "habits",
    rewardXp: 25,
    test: (ctx) => ctx.timeSpentSeconds >= 3600,
    progress: (ctx) => ({ current: Math.min(Math.round(ctx.timeSpentSeconds / 60), 60), max: 60 }),
  },
  {
    id: "time-300",
    emoji: "⏳",
    icon: Hourglass,
    title: "Five Hours Deep",
    description: "Spent five hours learning.",
    requirement: "Spend 5 hours learning.",
    category: "habits",
    rewardXp: 50,
    test: (ctx) => ctx.timeSpentSeconds >= 18000,
    progress: (ctx) => ({ current: Math.min(Math.round(ctx.timeSpentSeconds / 60), 300), max: 300 }),
  },
  {
    id: "first-ai",
    emoji: "💬",
    icon: MessageSquareText,
    title: "First AI Question",
    description: "Asked Panda your first question.",
    requirement: "Ask Panda a question.",
    category: "engagement",
    rewardXp: 10,
    test: (ctx) => ctx.aiQuestionsAsked >= 1,
    progress: (ctx) => ({ current: ctx.aiQuestionsAsked, max: 1 }),
  },
  {
    id: "ai-10",
    emoji: "🤖",
    icon: Bot,
    title: "Asked Panda 10 Times",
    description: "Asked Panda ten questions.",
    requirement: "Ask Panda 10 questions.",
    category: "engagement",
    rewardXp: 20,
    test: (ctx) => ctx.aiQuestionsAsked >= 10,
    progress: (ctx) => ({ current: Math.min(ctx.aiQuestionsAsked, 10), max: 10 }),
  },
  {
    id: "ai-50",
    emoji: "🦾",
    icon: Sparkles,
    title: "AI Power User",
    description: "Asked Panda fifty questions.",
    requirement: "Ask Panda 50 questions.",
    category: "engagement",
    rewardXp: 50,
    test: (ctx) => ctx.aiQuestionsAsked >= 50,
    progress: (ctx) => ({ current: Math.min(ctx.aiQuestionsAsked, 50), max: 50 }),
  },
  {
    id: "xp-500",
    emoji: "💎",
    icon: Gem,
    title: "Halfway There",
    description: "Earned 500 XP.",
    requirement: "Earn 500 XP.",
    category: "engagement",
    rewardXp: 25,
    test: (ctx) => ctx.xp >= 500,
    progress: (ctx) => ({ current: Math.min(ctx.xp, 500), max: 500 }),
  },
  {
    id: "git-wizard",
    emoji: "⭐",
    icon: Star,
    title: "Git Wizard",
    description: "Earned 1,000 XP.",
    requirement: "Earn 1,000 XP.",
    category: "engagement",
    rewardXp: 100,
    test: (ctx) => ctx.xp >= 1000,
    progress: (ctx) => ({ current: Math.min(ctx.xp, 1000), max: 1000 }),
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

/** Numeric progress for the achievement UI (falls back to a boolean 0/1). */
export function achievementProgress(
  achievement: AchievementDefinition,
  ctx: AchievementContext,
): AchievementProgress {
  if (achievement.progress) return achievement.progress(ctx);
  return { current: achievement.test(ctx) ? 1 : 0, max: 1 };
}
