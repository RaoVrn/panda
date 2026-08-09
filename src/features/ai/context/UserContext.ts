/**
 * UserContext  -  a minimal, privacy-conscious slice of who the learner is.
 *
 * Only facts that help the AI teach better are included: level, XP, how much
 * of the course is done, their preferred explanation style, theme, lesson
 * mode and animation speed. Email/username are deliberately NOT sent.
 */

import { allLessons } from "@/content/lessons";
import { levelInfo } from "@/features/progress/xp";
import { useProgressStore } from "@/features/progress/progressStore";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";

export interface UserContextData {
  xp: number;
  level: number;
  completedLessons: number;
  totalLessons: number;
  explanationStyle?: string;
  theme?: string;
  lessonMode?: string;
  animationSpeed?: string;
}

export function collectUserContext(snapshot?: {
  xp?: number;
  completedLessonIds?: string[];
}): UserContextData {
  const progress = snapshot ?? useProgressStore.getState();
  const prefs = usePreferencesStore.getState().snapshot();

  return {
    xp: progress.xp ?? 0,
    level: levelInfo(progress.xp ?? 0).level,
    completedLessons: progress.completedLessonIds?.length ?? 0,
    totalLessons: allLessons().length,
    explanationStyle: prefs.aiExplanationStyle,
    theme: prefs.theme,
    lessonMode: prefs.defaultMode,
    animationSpeed: prefs.animationSpeed,
  };
}
