import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home/pages/HomePage";
import { CoursePage } from "@/features/learning/pages/CoursePage";
import { ModulePage } from "@/features/learning/pages/ModulePage";
import { LessonPage } from "@/features/learning/pages/LessonPage";
import { SearchPage } from "@/features/search/pages/SearchPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { AchievementsPage } from "@/features/progress/pages/AchievementsPage";
import { GlobalAiPage } from "@/features/ai/global/GlobalAiPage";
import { LoginPage } from "@/features/user/pages/LoginPage";
import { SignUpPage } from "@/features/user/pages/SignUpPage";
import { ResetPasswordPage } from "@/features/user/pages/ResetPasswordPage";
import { ProfilePage } from "@/features/user/pages/ProfilePage";
import { AccountPage } from "@/features/user/pages/AccountPage";
import { RequireAuth } from "@/features/user/components/RequireAuth";
import { RedirectIfAuthenticated } from "@/features/user/components/RedirectIfAuthenticated";
import { GuideOverviewPage } from "@/features/docs/pages/GuideOverviewPage";
import { GuideLearningPage } from "@/features/docs/pages/GuideLearningPage";
import { GuidePlaygroundPage } from "@/features/docs/pages/GuidePlaygroundPage";
import { GuideAiPage } from "@/features/docs/pages/GuideAiPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RedirectIfAuthenticated>
            <HomePage />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: "search",
        element: (
          <RequireAuth>
            <SearchPage />
          </RequireAuth>
        ),
      },
      {
        path: "login",
        element: (
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: "signup",
        element: (
          <RedirectIfAuthenticated>
            <SignUpPage />
          </RedirectIfAuthenticated>
        ),
      },
      { path: "reset-password", element: <ResetPasswordPage /> },
      {
        path: "settings",
        element: (
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: "account",
        element: (
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        ),
      },
      {
        path: "achievements",
        element: (
          <RequireAuth>
            <AchievementsPage />
          </RequireAuth>
        ),
      },
      {
        path: "ai",
        element: <Navigate to="/panda-ai" replace />,
      },
      {
        path: "panda-ai",
        element: (
          <RequireAuth>
            <GlobalAiPage />
          </RequireAuth>
        ),
      },
      // Panda Guide: public, reachable from the landing page (logged out) and
      // from inside the app (logged in). One shared route system, four pages.
      {
        path: "docs",
        element: <GuideOverviewPage />,
      },
      {
        path: "docs/learning",
        element: <GuideLearningPage />,
      },
      {
        path: "docs/playground",
        element: <GuidePlaygroundPage />,
      },
      {
        path: "docs/panda-ai",
        element: <GuideAiPage />,
      },
      {
        path: "docs/*",
        element: <Navigate to="/docs" replace />,
      },
    ],
  },
  // The learning workspace is full-bleed and renders its own three-panel shell,
  // so it lives outside the centered AppShell container.
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <CoursePage />
      </RequireAuth>
    ),
  },
  {
    path: "/course",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/module/:moduleId",
    element: (
      <RequireAuth>
        <ModulePage />
      </RequireAuth>
    ),
  },
  {
    path: "/lesson/:slug",
    element: (
      <RequireAuth>
        <LessonPage />
      </RequireAuth>
    ),
  },
]);
