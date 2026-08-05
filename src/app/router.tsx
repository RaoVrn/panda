import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home/pages/HomePage";
import { CoursePage } from "@/features/learning/pages/CoursePage";
import { LessonPage } from "@/features/learning/pages/LessonPage";
import { SearchPage } from "@/features/search/pages/SearchPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { AiPage } from "@/features/ai/pages/AiPage";
import { LoginPage } from "@/features/user/pages/LoginPage";
import { SignUpPage } from "@/features/user/pages/SignUpPage";
import { ResetPasswordPage } from "@/features/user/pages/ResetPasswordPage";
import { ProfilePage } from "@/features/user/pages/ProfilePage";
import { AccountPage } from "@/features/user/pages/AccountPage";
import { RequireAuth } from "@/features/user/components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
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
        path: "ai",
        element: (
          <RequireAuth>
            <AiPage />
          </RequireAuth>
        ),
      },
    ],
  },
  // The learning workspace is full-bleed and renders its own three-panel shell,
  // so it lives outside the centered AppShell container.
  {
    path: "/course",
    element: (
      <RequireAuth>
        <CoursePage />
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
