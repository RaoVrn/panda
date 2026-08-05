/**
 * preferencesStore — the learner's settings, synced to Supabase when signed in.
 *
 * Holds every preference (including theme + default lesson mode) so the
 * settings UI reads/writes one place and the auth provider's debounced push
 * stays in sync. Theme/mode are also applied to their dedicated stores; this
 * store is the persisted, single record of all of them.
 */

import { create } from "zustand";
import type { UserPreferences } from "@/features/user/types";

interface PreferencesState {
  theme?: "dark" | "light";
  defaultMode?: "read" | "interactive";
  animationSpeed: "fast" | "normal" | "slow";
  quizPreference: "immediate" | "end";
  aiExplanationStyle: "simple" | "balanced" | "deep";
  dailyReminder: boolean;
  apply: (preferences: UserPreferences) => void;
  set: (patch: Partial<UserPreferences>) => void;
  snapshot: () => UserPreferences;
}

export const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  theme: undefined,
  defaultMode: undefined,
  animationSpeed: "normal",
  quizPreference: "immediate",
  aiExplanationStyle: "balanced",
  dailyReminder: false,

  apply: (preferences) =>
    set((state) => ({
      theme: preferences.theme ?? state.theme,
      defaultMode: preferences.defaultMode ?? state.defaultMode,
      animationSpeed: preferences.animationSpeed ?? state.animationSpeed,
      quizPreference: preferences.quizPreference ?? state.quizPreference,
      aiExplanationStyle: preferences.aiExplanationStyle ?? state.aiExplanationStyle,
      dailyReminder: preferences.dailyReminder ?? state.dailyReminder,
    })),

  set: (patch) =>
    set((state) => ({
      theme: patch.theme ?? state.theme,
      defaultMode: patch.defaultMode ?? state.defaultMode,
      animationSpeed: patch.animationSpeed ?? state.animationSpeed,
      quizPreference: patch.quizPreference ?? state.quizPreference,
      aiExplanationStyle: patch.aiExplanationStyle ?? state.aiExplanationStyle,
      dailyReminder: patch.dailyReminder ?? state.dailyReminder,
    })),

  snapshot: () => ({
    theme: get().theme,
    defaultMode: get().defaultMode,
    animationSpeed: get().animationSpeed,
    quizPreference: get().quizPreference,
    aiExplanationStyle: get().aiExplanationStyle,
    dailyReminder: get().dailyReminder,
  }),
}));
