/**
 * Progress feature shared types.
 */

/** The actions a learner can earn XP for. */
export type XpAction =
  | "read-lesson"
  | "finish-lesson"
  | "quiz-complete"
  | "practice"
  | "ask-ai"
  | "first-correct"
  | "perfect-quiz";

export type LessonStatus = "locked" | "available" | "started" | "completed";

export interface LevelInfo {
  level: number;
  xp: number;
  /** XP at the start of the current level. */
  min: number;
  /** XP required to reach the next level. */
  max: number;
  /** 0..1 progress through the current level. */
  progress: number;
  /** XP still needed for the next level. */
  remaining: number;
}

export interface StreakInfo {
  current: number;
  lastStudyDate: string | null;
  studiedToday: boolean;
}

/** Best recorded quiz result for a lesson. */
export interface QuizRecord {
  correct: number;
  total: number;
  perfect: boolean;
}

/** Which XP rewards have already been granted for a lesson's quiz. */
export interface QuizAwardState {
  base: boolean;
  firstCorrect: boolean;
  perfect: boolean;
}

export interface ProfileStats {
  lessonsCompleted: number;
  lessonsStarted: number;
  totalQuizQuestions: number;
  correctQuizAnswers: number;
  aiQuestionsAsked: number;
  practiceCount: number;
  quizAccuracy: number | null;
  /** Total Git commands executed in terminals + playgrounds. */
  commandsExecuted: number;
  /** Total playground missions fully completed. */
  missionsCompleted: number;
  /** Total seconds actively spent on lessons. */
  timeSpentSeconds: number;
}

export type ToastType = "xp" | "achievement" | "levelup" | "section";

export interface ProgressToast {
  id: number;
  type: ToastType;
  /** XP amount when type is "xp". */
  amount?: number;
  /** Emoji + title for achievements, level-ups and section completions. */
  emoji?: string;
  title?: string;
}
