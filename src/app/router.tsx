import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home/pages/HomePage";
import { CoursePage } from "@/features/learning/pages/CoursePage";
import { LessonPage } from "@/features/learning/pages/LessonPage";
import {
  AiPage,
  SearchPage,
  SettingsPage,
} from "@/features/placeholders";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "ai", element: <AiPage /> },
    ],
  },
  // The learning workspace is full-bleed and renders its own three-panel shell,
  // so it lives outside the centered AppShell container.
  {
    path: "/course",
    element: <CoursePage />,
  },
  {
    path: "/lesson/:slug",
    element: <LessonPage />,
  },
]);