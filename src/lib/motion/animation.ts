/**
 * Animation speed system.
 *
 * The user's "Animation speed" preference (fast/normal/slow) scales every
 * motion duration in the app via a single factor. Components use
 * `useAnimationDuration(baseMs)` instead of hardcoding durations.
 */

import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";

export type AnimationSpeed = "fast" | "normal" | "slow";

/** Multiplier applied to base durations. */
export function speedFactor(speed: AnimationSpeed): number {
  switch (speed) {
    case "fast":
      return 0.6;
    case "slow":
      return 1.5;
    default:
      return 1;
  }
}

/** The current speed factor, reactive to the preference. */
export function useAnimationSpeed(): number {
  const speed = usePreferencesStore((state) => state.animationSpeed);
  return speedFactor(speed);
}

/** Scale a base millisecond duration by the current factor. */
export function scaledDuration(baseMs: number, factor: number): number {
  return Math.max(80, Math.round(baseMs * factor));
}
