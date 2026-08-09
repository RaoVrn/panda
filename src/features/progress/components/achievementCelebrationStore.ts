import { create } from "zustand";
import type { AchievementDefinition } from "../achievements";

/**
 * Transient queue of newly-unlocked achievements. The progress store enqueues
 * here the moment an achievement transitions locked → earned (during a real
 * user action), and the celebration UI drains one at a time. Because the queue
 * is only filled by that transition  -  never on page load  -  the celebration
 * never replays for achievements the user already had.
 */
interface AchievementCelebrationState {
  queue: AchievementDefinition[];
  enqueue: (achievement: AchievementDefinition) => void;
  shift: () => void;
}

export const useAchievementCelebration = create<AchievementCelebrationState>()(
  (set) => ({
    queue: [],
    enqueue: (achievement) =>
      set((state) => ({ queue: [...state.queue, achievement] })),
    shift: () => set((state) => ({ queue: state.queue.slice(1) })),
  }),
);
