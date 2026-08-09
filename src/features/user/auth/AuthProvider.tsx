import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  updatePassword,
} from "@/features/user/services/authService";
import { fetchLearningProfile } from "@/features/user/services/profileService";
import {
  hydrateFromLearningProfile,
  pushProgressToSupabase,
} from "@/features/user/sync/progressSync";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useTheme } from "@/contexts/useTheme";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationCenter } from "@/features/notifications/notificationCenterStore";
import { switchStorageUser } from "@/features/user/sync/storageSwitch";
import type { AuthStatus } from "@/features/user/types";
import { AuthContext, type AuthContextValue } from "./authContext";

const PUSH_DEBOUNCE_MS = 1500;

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [status, setStatus] = useState<AuthStatus>(
    configured ? "loading" : "unconfigured",
  );
  const [user, setUser] = useState<User | null>(null);

  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  // The most recent user-scoped storage switch; remote profile hydration waits
  // for it so fresh server data is never clobbered by a stale local rehydrate.
  const storageSwitchRef = useRef<Promise<void>>(Promise.resolve());

  // Session + auth state listener.
  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setStatus(data.session?.user ? "authenticated" : "unauthenticated");
      storageSwitchRef.current = switchStorageUser(data.session?.user?.id ?? null);
      if (!data.session?.user) {
        queryClient.clear();
        useNotificationCenter.getState().clearForLogout();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "authenticated" : "unauthenticated");
      storageSwitchRef.current = switchStorageUser(session?.user?.id ?? null);
      if (!session?.user) {
        queryClient.clear();
        useNotificationCenter.getState().clearForLogout();
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [configured, queryClient]);

  const userId = user?.id ?? null;

  // Debounced push of local progress → Supabase whenever it changes.
  const pushTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!configured || !userId) return;

    const schedulePush = () => {
      window.clearTimeout(pushTimer.current);
      pushTimer.current = window.setTimeout(() => {
        const preferences = usePreferencesStore.getState().snapshot();
        void pushProgressToSupabase(userId, preferences).catch(() => {
          // Progress is persisted locally; a failed sync is retried on the
          // next change or the next sign-in. Never an unhandled rejection.
        });
      }, PUSH_DEBOUNCE_MS);
    };

    const unsubProgress = useProgressStore.subscribe(schedulePush);
    const unsubPrefs = usePreferencesStore.subscribe(schedulePush);

    return () => {
      window.clearTimeout(pushTimer.current);
      unsubProgress();
      unsubPrefs();
    };
  }, [configured, userId]);

  // On sign-in: pull the learning profile and apply preferences.
  useEffect(() => {
    if (!configured || !user) return;
    let cancelled = false;

    void (async () => {
      try {
        // Wait for the local storage switch to settle first, so the freshly
        // fetched server profile is authoritative and never overwritten by a
        // stale local rehydrate.
        await storageSwitchRef.current;
        if (cancelled || !user) return;
        const profile = await fetchLearningProfile(user.id);
        if (cancelled || !profile) return;
        hydrateFromLearningProfile(profile);
        const prefs = profile.preferences;
        if (prefs.theme) setTheme(prefs.theme);
        if (prefs.defaultMode) useLessonModeStore.getState().setMode(prefs.defaultMode);
        usePreferencesStore.getState().apply(prefs);
      } catch {
        // Profile rows are created by the signup trigger; ignore races.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, user, setTheme]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      userId,
      configured,
      loading: status === "loading",
      signUp: async (email, password, name) => {
        await signUpWithEmail(email, password, name);
      },
      signIn: async (email, password) => {
        await signInWithEmail(email, password);
      },
      signInWithGoogle,
      signOut: async () => {
        await signOut();
        queryClient.clear();
      },
      resetPassword: requestPasswordReset,
      updatePassword,
    }),
    [status, user, userId, configured, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
