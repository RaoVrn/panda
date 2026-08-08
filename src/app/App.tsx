import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { AuthProvider } from "@/features/user/auth/AuthProvider";
import { GitEngineProvider } from "@/features/git/GitEngineProvider";
import { OnboardingOverlay } from "@/features/onboarding/components/OnboardingOverlay";
import { SearchShortcut } from "@/features/search/components/SearchShortcut";
import { AchievementCelebration } from "@/features/progress/components/AchievementCelebration";

export function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <GitEngineProvider>
            <RouterProvider router={router} />
            <OnboardingOverlay />
            <SearchShortcut />
            <AchievementCelebration />
          </GitEngineProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
