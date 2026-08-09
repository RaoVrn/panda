/**
 * Course curriculum  -  the single source of structure for the platform.
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
    id: "git-fundamentals",
    title: "Git Fundamentals",
    description: "What Git is, why it exists, and the three rooms of every repository",
    order: 1,
    icon: "sparkles",
    course: "git",
    lessons: [
      "what-is-git",
      "why-git",
      "installing-git",
      "git-configuration",
      "repository",
      "working-tree",
      "staging-area",
      "repository-vs-working-tree",
      "first-repository",
    ],
  },
  {
    id: "core-commands",
    title: "Core Commands",
    description: "The everyday commands that save and manage your work",
    order: 2,
    icon: "layers",
    course: "git",
    lessons: [
      "saving-snapshots",
      "git-status",
      "git-add",
      "git-commit",
      "git-log",
      "git-diff",
      "git-restore",
      "git-rm",
      "git-mv",
      "gitignore",
    ],
    requires: ["git-fundamentals"],
  },
  {
    id: "history",
    title: "History",
    description: "Read, compare and time-travel through your snapshots",
    order: 3,
    icon: "history",
    course: "git",
    lessons: [
      "commit-history",
      "head",
      "detached-head",
      "git-show",
      "git-blame",
      "git-reflog",
    ],
    requires: ["core-commands"],
  },
  {
    id: "branching",
    title: "Branching",
    description: "Work on many things at once, then join them back together",
    order: 4,
    icon: "git-branch",
    course: "git",
    lessons: [
      "branches",
      "git-branch",
      "git-switch",
      "git-checkout",
      "merge",
      "merge-conflicts",
      "fast-forward-merge",
    ],
    requires: ["history"],
  },
  {
    id: "remote-repositories",
    title: "Remote Repositories",
    description: "Share your work with the world and collaborate on GitHub",
    order: 5,
    icon: "globe",
    course: "git",
    lessons: [
      "github",
      "git-remote",
      "git-clone",
      "git-fetch",
      "git-pull",
      "git-push",
    ],
    requires: ["branching"],
  },
  {
    id: "advanced-git",
    title: "Advanced Git",
    description: "Fix mistakes, rewrite history and level up your workflow",
    order: 6,
    icon: "rocket",
    course: "git",
    lessons: [
      "stash",
      "cherry-pick",
      "reset",
      "revert",
      "rebase",
      "squash",
      "tags",
    ],
    requires: ["remote-repositories"],
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

/** The module that follows another in course order, if any. */
export function nextModule(moduleId: string): CourseModule | undefined {
  const current = moduleById(moduleId);
  if (!current) return undefined;
  const ordered = modulesForCourse(current.course).sort((a, b) => a.order - b.order);
  return ordered.find((module) => module.order === current.order + 1);
}

/** The module that precedes another in course order, if any. */
export function previousModule(moduleId: string): CourseModule | undefined {
  const current = moduleById(moduleId);
  if (!current) return undefined;
  const ordered = modulesForCourse(current.course).sort((a, b) => a.order - b.order);
  return ordered.find((module) => module.order === current.order - 1);
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
/* Availability                                                        */
/* ------------------------------------------------------------------ */

/** Whether a module has any authored lessons (i.e. it exists in the course). */
export function moduleHasLessons(moduleId: string): boolean {
  return (moduleById(moduleId)?.lessons.length ?? 0) > 0;
}

/**
 * A module is unlocked when every module it requires is fully completed
 * (checked against the authored lessons of that module).
 */
export function isModuleUnlocked(
  moduleId: string,
  completedLessonIds: string[],
): boolean {
  const mod = moduleById(moduleId);
  if (!mod) return false;
  const required = mod.requires ?? [];
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
