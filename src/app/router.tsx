import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { lazyPage } from "@/app/lazyPage";
import { RequireAuth } from "@/features/user/components/RequireAuth";
import { RedirectIfAuthenticated } from "@/features/user/components/RedirectIfAuthenticated";

const HomePage = lazyPage(() => import("@/features/home/pages/HomePage").then((m) => m.HomePage));
const CoursePage = lazyPage(() => import("@/features/learning/pages/CoursePage").then((m) => m.CoursePage));
const ModulePage = lazyPage(() => import("@/features/learning/pages/ModulePage").then((m) => m.ModulePage));
const LessonPage = lazyPage(() => import("@/features/learning/pages/LessonPage").then((m) => m.LessonPage));
const SearchPage = lazyPage(() => import("@/features/search/pages/SearchPage").then((m) => m.SearchPage));
const SettingsPage = lazyPage(() => import("@/features/settings/pages/SettingsPage").then((m) => m.SettingsPage));
const AchievementsPage = lazyPage(() => import("@/features/progress/pages/AchievementsPage").then((m) => m.AchievementsPage));
const GlobalAiPage = lazyPage(() => import("@/features/ai/global/GlobalAiPage").then((m) => m.GlobalAiPage));
const LoginPage = lazyPage(() => import("@/features/user/pages/LoginPage").then((m) => m.LoginPage));
const SignUpPage = lazyPage(() => import("@/features/user/pages/SignUpPage").then((m) => m.SignUpPage));
const ResetPasswordPage = lazyPage(() => import("@/features/user/pages/ResetPasswordPage").then((m) => m.ResetPasswordPage));
const ProfilePage = lazyPage(() => import("@/features/user/pages/ProfilePage").then((m) => m.ProfilePage));
const AccountPage = lazyPage(() => import("@/features/user/pages/AccountPage").then((m) => m.AccountPage));
const GuideOverviewPage = lazyPage(() => import("@/features/docs/pages/GuideOverviewPage").then((m) => m.GuideOverviewPage));
const GuideLearningPage = lazyPage(() => import("@/features/docs/pages/GuideLearningPage").then((m) => m.GuideLearningPage));
const GuidePlaygroundPage = lazyPage(() => import("@/features/docs/pages/GuidePlaygroundPage").then((m) => m.GuidePlaygroundPage));
const GuideAiPage = lazyPage(() => import("@/features/docs/pages/GuideAiPage").then((m) => m.GuideAiPage));

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
