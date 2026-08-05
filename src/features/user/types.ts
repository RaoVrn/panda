/**
 * User system shared types.
 */

/** Who the user is (identity). */
export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email?: string;
  /** Emoji or image URL for the avatar. */
  avatarUrl?: string;
  /** ISO timestamp when the account was created. */
  joinedAt: string;
}

/** Learner preferences (persisted in learning_profiles.preferences). */
export interface UserPreferences {
  theme?: "dark" | "light";
  animationSpeed?: "fast" | "normal" | "slow";
  defaultMode?: "read" | "interactive";
  quizPreference?: "immediate" | "end";
  aiExplanationStyle?: "simple" | "balanced" | "deep";
  dailyReminder?: boolean;
}

export type QuizStat = { correct: number; total: number };

/** The learner's persisted progress. */
export interface LearningProfile {
  userId: string;
  level: number;
  xp: number;
  totalXp: number;
  completedLessons: string[];
  completedModules: Record<string, boolean>;
  streak: number;
  lastLesson?: string;
  lastOpenedLesson?: string;
  quizStats: Record<string, QuizStat>;
  badges: Record<string, number>;
  preferences: UserPreferences;
  updatedAt?: string;
}

/** The single snapshot pushed to Supabase when anything changes. */
export interface LearningProfileRow {
  user_id: string;
  level: number;
  xp: number;
  total_xp: number;
  completed_lessons: string[];
  completed_modules: Record<string, boolean>;
  streak: number;
  last_lesson: string | null;
  last_opened_lesson: string | null;
  quiz_stats: Record<string, QuizStat>;
  badges: Record<string, number>;
  preferences: UserPreferences;
}

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unconfigured";
