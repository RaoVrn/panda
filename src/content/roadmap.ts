import type { CourseModule } from "@/content/schema";

/**
 * Panda course structure.
 *
 * This is the navigational skeleton only — the ordered modules of the course
 * and the lesson ids each contains. Actual lesson content (and each lesson's
 * own metadata) lives in `content/lessons/`, which is the single source of
 * lesson data. The ids here must match a lesson registered in that folder.
 */

export const modules: CourseModule[] = [
  {
    id: "introduction",
    title: "Introduction",
    description: "First steps",
    order: 1,
    icon: "sparkles",
    lessons: ["what-is-git", "why-git", "version-control"],
  },
  {
    id: "git-basics",
    title: "Git Basics",
    description: "Core building blocks",
    order: 2,
    icon: "layers",
    lessons: [
      "repository",
      "commit",
      "branch",
      "checkout",
      "merge",
      "rebase",
    ],
  },
  {
    id: "github",
    title: "GitHub",
    description: "Share and collaborate",
    order: 3,
    icon: "globe",
    lessons: ["remote", "push", "pull", "clone", "fork", "pull-request"],
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Go deeper",
    order: 4,
    icon: "rocket",
    lessons: ["advanced-git", "ci-cd"],
  },
];