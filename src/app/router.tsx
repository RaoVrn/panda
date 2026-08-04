import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home/pages/HomePage";
import {
  AiPage,
  CoursePage,
  LessonPage,
  SearchPage,
  SettingsPage,
} from "@/features/placeholders";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "course", element: <CoursePage /> },
      { path: "lesson/:slug", element: <LessonPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "ai", element: <AiPage /> },
    ],
  },
]);