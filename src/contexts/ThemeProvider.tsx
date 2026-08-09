import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import {
  ThemeContext,
  type Theme,
} from "@/contexts/themeContext";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";

/**
 * Theme provider. The selected theme lives in the preferences store (the
 * single source of truth): it persists locally for refresh and syncs to the
 * user's account via the existing Supabase preferences pipeline, so it
 * survives logout/login too. The provider simply applies `data-theme` to the
 * document and exposes setter/toggle helpers.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme ?? "dark");
  const setPreferences = usePreferencesStore((s) => s.set);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback(
    (next: Theme) => setPreferences({ theme: next }),
    [setPreferences],
  );
  const toggleTheme = useCallback(
    () =>
      setPreferences({
        theme: theme === "dark" || theme === "midnight" ? "light" : "dark",
      }),
    [theme, setPreferences],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
