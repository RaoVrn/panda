import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LessonReading {
  /** Vertical scroll offset within the lesson, in px. */
  scroll: number;
  /** Block ids the learner has scrolled into view. */
  visited: string[];
}

interface ReadingsState {
  readings: Record<string, LessonReading>;
  setScroll: (lessonId: string, scroll: number) => void;
  markVisited: (lessonId: string, blockId: string) => void;
  resetReading: (lessonId: string) => void;
}

/**
 * Per-lesson "player" state: scroll memory and visited blocks. This is what
 * lets Panda resume exactly where a learner stopped and later sync to Supabase.
 */
export const useReadingStore = create<ReadingsState>()(
  persist(
    (set) => ({
      readings: {},
      setScroll: (lessonId, scroll) =>
        set((state) => {
          const prev = state.readings[lessonId];
          return {
            readings: {
              ...state.readings,
              [lessonId]: { scroll, visited: prev?.visited ?? [] },
            },
          };
        }),
      markVisited: (lessonId, blockId) =>
        set((state) => {
          const reading = state.readings[lessonId];
          if (reading?.visited.includes(blockId)) return state;
          const next: LessonReading = {
            scroll: reading?.scroll ?? 0,
            visited: [...(reading?.visited ?? []), blockId],
          };
          return {
            readings: {
              ...state.readings,
              [lessonId]: next,
            },
          };
        }),
      resetReading: (lessonId) =>
        set((state) => ({
          readings: {
            ...state.readings,
            [lessonId]: { scroll: 0, visited: [] },
          },
        })),
    }),
    { name: "panda-reading" },
  ),
);