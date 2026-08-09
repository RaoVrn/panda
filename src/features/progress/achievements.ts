/**
 * Achievement definitions and evaluation.
 *
 * The single source of truth for the achievement system. Achievements are
 * meaningful, Git-focused milestones spread across the entire course, derived
 * from the real curriculum and progress store (never hard-coded counts). Unlock
 * state lives in the progress store (`achievements: id -> earnedAt`) and is
 * synced with the learner's Supabase profile.
 */

import {
  CheckSquare,
  Cloud,
  CloudUpload,
  Code,
  Files,
  Flame,
  Github,
  GitBranch,
  GitCommit,
  GitCommitHorizontal,
  GitMerge,
  Globe,
  History,
  Layers,
  Map,
  Rocket,
  SquareTerminal,
  Terminal,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { modules } from "@/content/curriculum";
import { moduleLessons } from "@/content/lessons";

export type AchievementCategoryId =
  | "foundations"
  | "core"
  | "branching"
  | "remote"
  | "advanced"
  | "mastery"
  | "streaks"
  | "practice";

export interface AchievementCategory {
  id: AchievementCategoryId;
  label: string;
}

/** Categories in display order (roughly follows the learner's journey). */
export const CATEGORIES: AchievementCategory[] = [
  { id: "foundations", label: "Foundations" },
  { id: "core", label: "Core Git" },
  { id: "branching", label: "Branching" },
  { id: "remote", label: "Remote" },
  { id: "advanced", label: "Advanced" },
  { id: "mastery", label: "Mastery" },
  { id: "streaks", label: "Streaks" },
  { id: "practice", label: "Practice" },
];

export interface AchievementProgress {
  current: number;
  max: number;
}

export interface AchievementDefinition {
  id: string;
  /** Kept for the small unlock toast; the UI uses `icon`. */
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
  practiceCount: number;
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
  practiceCount: number;
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
    practiceCount: s.practiceCount,
    modulesComplete,
    moduleProgress,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const one = (value: boolean): AchievementProgress => ({ current: value ? 1 : 0, max: 1 });

const fullCourse = (ctx: AchievementContext) => ({
  current: ctx.lessonsCompleted,
  max: ctx.totalLessons,
});

/** How many of the given lesson ids are completed. */
function done(ctx: AchievementContext, ...lessonIds: string[]): number {
  return lessonIds.filter((id) => ctx.completedLessons.has(id)).length;
}

function moduleProgressOf(ctx: AchievementContext, moduleId: string): AchievementProgress {
  return ctx.moduleProgress[moduleId] ?? { current: 0, max: 0 };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  /* ---------------- FOUNDATIONS ---------------- */
  {
    id: "git-beginner",
    emoji: "🐣",
    icon: Terminal,
    title: "Git Beginner",
    description: "Completed the first five Git Fundamentals lessons.",
    requirement: "Complete 5 lessons in Git Fundamentals.",
    category: "foundations",
    rewardXp: 25,
    test: (ctx) => (ctx.moduleProgress["git-fundamentals"]?.current ?? 0) >= 5,
    progress: (ctx) => ({
      current: Math.min(ctx.moduleProgress["git-fundamentals"]?.current ?? 0, 5),
      max: 5,
    }),
  },
  {
    id: "working-tree",
    emoji: "🗂️",
    icon: Files,
    title: "Working Tree",
    description: "Understood the working tree and staging area.",
    requirement: "Complete the 'Working Tree' and 'Staging Area' lessons.",
    category: "foundations",
    rewardXp: 30,
    test: (ctx) => done(ctx, "working-tree", "staging-area") === 2,
    progress: (ctx) => ({ current: done(ctx, "working-tree", "staging-area"), max: 2 }),
  },
  {
    id: "first-snapshot",
    emoji: "📦",
    icon: GitCommit,
    title: "First Snapshot",
    description: "Made your first commit.",
    requirement: "Complete the 'git commit' lesson.",
    category: "foundations",
    rewardXp: 25,
    test: (ctx) => ctx.completedLessons.has("git-commit"),
    progress: (ctx) => one(ctx.completedLessons.has("git-commit")),
  },
  {
    id: "git-foundations",
    emoji: "🧱",
    icon: Layers,
    title: "Git Foundations",
    description: "Finished every Git Fundamentals lesson.",
    requirement: "Complete all Git Fundamentals lessons.",
    category: "foundations",
    rewardXp: 100,
    test: (ctx) => ctx.modulesComplete["git-fundamentals"] === true,
    progress: (ctx) => moduleProgressOf(ctx, "git-fundamentals"),
  },

  /* ---------------- CORE GIT ---------------- */
  {
    id: "command-line-ready",
    emoji: "⌨️",
    icon: SquareTerminal,
    title: "Command Line Ready",
    description: "Completed the core status and staging commands.",
    requirement: "Complete the 'git status' and 'git add' lessons.",
    category: "core",
    rewardXp: 40,
    test: (ctx) => done(ctx, "git-status", "git-add") === 2,
    progress: (ctx) => ({ current: done(ctx, "git-status", "git-add"), max: 2 }),
  },
  {
    id: "core-commands",
    emoji: "⚙️",
    icon: GitCommitHorizontal,
    title: "Core Commands",
    description: "Finished every Core Commands lesson.",
    requirement: "Complete all Core Commands lessons.",
    category: "core",
    rewardXp: 100,
    test: (ctx) => ctx.modulesComplete["core-commands"] === true,
    progress: (ctx) => moduleProgressOf(ctx, "core-commands"),
  },
  {
    id: "history-explorer",
    emoji: "🕰️",
    icon: History,
    title: "History Explorer",
    description: "Finished every History lesson.",
    requirement: "Complete all History lessons.",
    category: "core",
    rewardXp: 100,
    test: (ctx) => ctx.modulesComplete["history"] === true,
    progress: (ctx) => moduleProgressOf(ctx, "history"),
  },

  /* ---------------- BRANCHING ---------------- */
  {
    id: "branch-builder",
    emoji: "🌿",
    icon: GitBranch,
    title: "Branch Builder",
    description: "Created and switched branches.",
    requirement: "Complete the 'Branches' and 'git branch' lessons.",
    category: "branching",
    rewardXp: 60,
    test: (ctx) => done(ctx, "branches", "git-branch") === 2,
    progress: (ctx) => ({ current: done(ctx, "branches", "git-branch"), max: 2 }),
  },
  {
    id: "merge-point",
    emoji: "🔀",
    icon: GitMerge,
    title: "Merge Point",
    description: "Merged branches together.",
    requirement: "Complete the merge lesson.",
    category: "branching",
    rewardXp: 60,
    test: (ctx) => ctx.completedLessons.has("merge"),
    progress: (ctx) => one(ctx.completedLessons.has("merge")),
  },
  {
    id: "branch-master",
    emoji: "🌳",
    icon: Workflow,
    title: "Branch Master",
    description: "Finished every Branching lesson.",
    requirement: "Complete all Branching lessons.",
    category: "branching",
    rewardXp: 150,
    test: (ctx) => ctx.modulesComplete["branching"] === true,
    progress: (ctx) => moduleProgressOf(ctx, "branching"),
  },

  /* ---------------- REMOTE ---------------- */
  {
    id: "remote-ready",
    emoji: "☁️",
    icon: Cloud,
    title: "Remote Ready",
    description: "Connected your work to a remote.",
    requirement: "Complete the 'git remote' and GitHub lessons.",
    category: "remote",
    rewardXp: 60,
    test: (ctx) => done(ctx, "git-remote", "github") === 2,
    progress: (ctx) => ({ current: done(ctx, "git-remote", "github"), max: 2 }),
  },
  {
    id: "push-to-the-world",
    emoji: "🚀",
    icon: CloudUpload,
    title: "Push to the World",
    description: "Shared your work with a push.",
    requirement: "Complete the 'git push' lesson.",
    category: "remote",
    rewardXp: 60,
    test: (ctx) => ctx.completedLessons.has("git-push"),
    progress: (ctx) => one(ctx.completedLessons.has("git-push")),
  },
  {
    id: "remote-explorer",
    emoji: "🌍",
    icon: Globe,
    title: "Remote Explorer",
    description: "Finished every Remote Repositories lesson.",
    requirement: "Complete all Remote Repositories lessons.",
    category: "remote",
    rewardXp: 150,
    test: (ctx) => ctx.modulesComplete["remote-repositories"] === true,
    progress: (ctx) => moduleProgressOf(ctx, "remote-repositories"),
  },

  /* ---------------- ADVANCED ---------------- */
  {
    id: "git-deep-dive",
    emoji: "🔬",
    icon: Code,
    title: "Git Deep Dive",
    description: "Worked through a substantial part of Advanced Git.",
    requirement: "Complete 4 of the Advanced Git lessons.",
    category: "advanced",
    rewardXp: 80,
    test: (ctx) => (ctx.moduleProgress["advanced-git"]?.current ?? 0) >= 4,
    progress: (ctx) => ({
      current: Math.min(ctx.moduleProgress["advanced-git"]?.current ?? 0, 4),
      max: 4,
    }),
  },
  {
    id: "advanced-git",
    emoji: "🧗",
    icon: Rocket,
    title: "Advanced Git",
    description: "Finished every Advanced Git lesson.",
    requirement: "Complete all Advanced Git lessons.",
    category: "advanced",
    rewardXp: 150,
    test: (ctx) => ctx.modulesComplete["advanced-git"] === true,
    progress: (ctx) => moduleProgressOf(ctx, "advanced-git"),
  },

  /* ---------------- MASTERY ---------------- */
  {
    id: "git-journey",
    emoji: "🗺️",
    icon: Map,
    title: "Git Journey",
    description: "Completed most of the course.",
    requirement: "Complete 75% of all lessons.",
    category: "mastery",
    rewardXp: 200,
    test: (ctx) =>
      ctx.totalLessons > 0 && ctx.lessonsCompleted >= Math.ceil(ctx.totalLessons * 0.75),
    progress: fullCourse,
  },
  {
    id: "git-master",
    emoji: "🏆",
    icon: Github,
    title: "Git Master",
    description: "Completed the entire course.",
    requirement: "Complete all lessons in the course.",
    category: "mastery",
    rewardXp: 500,
    test: (ctx) => ctx.totalLessons > 0 && ctx.lessonsCompleted >= ctx.totalLessons,
    progress: fullCourse,
  },

  /* ---------------- STREAKS ---------------- */
  {
    id: "streak-7",
    emoji: "🔥",
    icon: Flame,
    title: "7 Day Streak",
    description: "Studied seven days in a row.",
    requirement: "Study 7 days in a row.",
    category: "streaks",
    rewardXp: 50,
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
    category: "streaks",
    rewardXp: 150,
    test: (ctx) => ctx.streakDays >= 30,
    progress: (ctx) => ({ current: Math.min(ctx.streakDays, 30), max: 30 }),
  },

  /* ---------------- PRACTICE ---------------- */
  {
    id: "practice-10",
    emoji: "✍️",
    icon: CheckSquare,
    title: "Practice Makes Progress",
    description: "Completed ten practice exercises.",
    requirement: "Complete 10 practice exercises.",
    category: "practice",
    rewardXp: 40,
    test: (ctx) => ctx.practiceCount >= 10,
    progress: (ctx) => ({ current: Math.min(ctx.practiceCount, 10), max: 10 }),
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
