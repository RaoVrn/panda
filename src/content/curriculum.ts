/**
 * Course curriculum — the single source of structure for the platform.
 *
 * A platform can host many courses. Each course contains ordered modules, and
 * each module lists its lessons (by id, in teaching order). Modules can depend
 * on other modules via `requires`, which powers the unlock chain.
 *
 * Adding a new course/module means editing this file (or feeding it from a CMS
 * later). No React code changes.
 */

import type { Course, CourseModule } from "./schema";

export type { Course, CourseModule };

export const COURSES: Course[] = [
  {
    id: "git",
    slug: "git",
    title: "Learn Git",
    description:
      "A visual path from your very first commit to confidently shipping with Git, GitHub and version control.",
  },
];

export const modules: CourseModule[] = [
  {
    id: "introduction",
    title: "Introduction",
    description: "First steps",
    order: 1,
    icon: "sparkles",
    course: "git",
    lessons: ["what-is-git", "why-git", "version-control"],
  },
  {
    id: "git-basics",
    title: "Git Basics",
    description: "Core building blocks",
    order: 2,
    icon: "layers",
    course: "git",
    lessons: ["repository", "commit", "branch", "checkout", "merge", "rebase"],
    requires: ["introduction"],
  },
  {
    id: "github",
    title: "GitHub",
    description: "Share and collaborate",
    order: 3,
    icon: "globe",
    course: "git",
    lessons: ["remote", "push", "pull", "clone", "fork", "pull-request"],
    requires: ["git-basics"],
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Go deeper",
    order: 4,
    icon: "rocket",
    course: "git",
    lessons: ["advanced-git", "ci-cd"],
    requires: ["github"],
  },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                            */
/* ------------------------------------------------------------------ */

export function courseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}

export function moduleById(id: string): CourseModule | undefined {
  return modules.find((module) => module.id === id);
}

export function modulesForCourse(courseId: string): CourseModule[] {
  return modules
    .filter((module) => module.course === courseId)
    .sort((a, b) => a.order - b.order);
}

export function moduleOfLesson(lessonId: string): CourseModule | undefined {
  return modules.find((module) => module.lessons.includes(lessonId));
}

export function courseOfLesson(lessonId: string): Course | undefined {
  const module = moduleOfLesson(lessonId);
  return module ? courseById(module.course) : undefined;
}

/* ------------------------------------------------------------------ */
/* Unlocking                                                           */
/* ------------------------------------------------------------------ */

/**
 * A module is unlocked when every module it requires is fully completed
 * (checked against the authored lessons of that module).
 */
export function isModuleUnlocked(
  moduleId: string,
  completedLessonIds: string[],
): boolean {
  const module = moduleById(moduleId);
  if (!module) return false;
  const required = module.requires ?? [];
  if (required.length === 0) return true;
  return required.every((requiredId) => {
    const requiredModule = moduleById(requiredId);
    if (!requiredModule) return false;
    return (
      requiredModule.lessons.length > 0 &&
      requiredModule.lessons.every((id) => completedLessonIds.includes(id))
    );
  });
}

/** Whether a module has any authored lessons (i.e. it exists in the course). */
export function moduleHasLessons(moduleId: string): boolean {
  return (moduleById(moduleId)?.lessons.length ?? 0) > 0;
}
