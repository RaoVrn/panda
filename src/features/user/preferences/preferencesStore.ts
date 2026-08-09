/**
 * preferencesStore  -  the learner's settings, synced to Supabase when signed in.
 *
 * Holds every preference (including theme + default lesson mode) so the
 * settings UI reads/writes one place and the auth provider's debounced push
 * stays in sync. Theme/mode are also applied to their dedicated stores; this
 * store is the persisted, single record of all of them.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/contexts/themeContext";
import type { UserPreferences } from "@/features/user/types";

interface PreferencesState {
  theme?: Theme;
  defaultMode?: "read" | "interactive";
  animationSpeed: "fast" | "normal" | "slow";
  aiExplanationStyle: "simple" | "balanced" | "deep";
  notifyAchievements: boolean;
  notifyLessons: boolean;
  notifyModules: boolean;
  apply: (preferences: UserPreferences) => void;
  set: (patch: Partial<UserPreferences>) => void;
  snapshot: () => UserPreferences;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: undefined,
      defaultMode: undefined,
      animationSpeed: "normal",
      aiExplanationStyle: "balanced",
      notifyAchievements: true,
      notifyLessons: true,
      notifyModules: true,

      apply: (preferences) =>
        set((state) => ({
          theme: preferences.theme ?? state.theme,
          defaultMode: preferences.defaultMode ?? state.defaultMode,
          animationSpeed: preferences.animationSpeed ?? state.animationSpeed,
          aiExplanationStyle: preferences.aiExplanationStyle ?? state.aiExplanationStyle,
          notifyAchievements: preferences.notifyAchievements ?? state.notifyAchievements,
          notifyLessons: preferences.notifyLessons ?? state.notifyLessons,
          notifyModules: preferences.notifyModules ?? state.notifyModules,
        })),

      set: (patch) =>
        set((state) => ({
          theme: patch.theme ?? state.theme,
          defaultMode: patch.defaultMode ?? state.defaultMode,
          animationSpeed: patch.animationSpeed ?? state.animationSpeed,
          aiExplanationStyle: patch.aiExplanationStyle ?? state.aiExplanationStyle,
          notifyAchievements: patch.notifyAchievements ?? state.notifyAchievements,
          notifyLessons: patch.notifyLessons ?? state.notifyLessons,
          notifyModules: patch.notifyModules ?? state.notifyModules,
        })),

      snapshot: () => ({
        theme: get().theme,
        defaultMode: get().defaultMode,
        animationSpeed: get().animationSpeed,
        aiExplanationStyle: get().aiExplanationStyle,
        notifyAchievements: get().notifyAchievements,
        notifyLessons: get().notifyLessons,
        notifyModules: get().notifyModules,
      }),
    }),
    {
      name: "panda-preferences",
    },
  ),
);
