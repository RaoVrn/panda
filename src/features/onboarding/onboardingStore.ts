/**
 * Onboarding — first-visit state.
 *
 * A single persisted flag decides whether to show the welcome flow. New users
 * see it once; returning users go straight into the course. The Settings page
 * can reset it to replay the flow.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { localStorageAdapter, toZustandStorage } from "@/features/progress/localStorage";

interface OnboardingState {
  /** Whether the learner has seen (or skipped) the welcome flow. */
  completed: boolean;
  complete: () => void;
  /** Forget the flag so the flow can be replayed from Settings. */
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false }),
    }),
    {
      name: "panda-onboarding",
      version: 1,
      storage: createJSONStorage(() => toZustandStorage(localStorageAdapter)),
      partialize: (state) => ({ completed: state.completed }),
    },
  ),
);
