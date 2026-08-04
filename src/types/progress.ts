export interface ProgressSnapshot {
  completedLessonIds: string[]
  quizScores: Record<string, { best: number; attempts: number }>
  updatedAt: string
}

export type ProgressAction =
  | { type: 'completeLesson'; lessonId: string }
  | { type: 'resetLesson'; lessonId: string }
  | { type: 'recordQuiz'; lessonId: string; score: number }
  | { type: 'resetAll' }

export type ThemeMode = 'dark' | 'light'
