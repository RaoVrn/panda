import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProgressState {
  completedLessonIds: string[];
  toggleCompleted: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedLessonIds: [],
      toggleCompleted: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds.filter((id) => id !== lessonId)
            : [...state.completedLessonIds, lessonId],
        })),
      completeLesson: (lessonId) =>
        set((state) =>
          state.completedLessonIds.includes(lessonId)
            ? state
            : { completedLessonIds: [...state.completedLessonIds, lessonId] },
        ),
      reset: () => set({ completedLessonIds: [] }),
    }),
    { name: "panda-progress" },
  ),
);