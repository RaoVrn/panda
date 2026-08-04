import { createContext, useContext } from "react";
import type { LessonMode } from "@/stores/lessonModeStore";

export interface LessonModeValue {
  mode: LessonMode;
  setMode: (mode: LessonMode) => void;
}

/**
 * Read / Interactive presentation for the lesson being rendered. Provided once
 * by <LessonPlayer>; visualizations consume it to decide how to present
 * themselves (static in Read, step-driven in Interactive).
 */
export const LessonModeContext = createContext<LessonModeValue | null>(null);

export function useLessonMode(): LessonModeValue {
  const value = useContext(LessonModeContext);
  if (!value) {
    throw new Error("useLessonMode must be used within <LessonPlayer>");
  }
  return value;
}