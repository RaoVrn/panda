import type { ContentLesson } from "@/content/schema";
import { modules } from "@/content/curriculum";
import { lesson01 } from "@/content/lessons/introduction/lesson-01";
import { lesson02 } from "@/content/lessons/introduction/lesson-02";
import { lesson03 } from "@/content/lessons/introduction/lesson-03";
import { lesson04 } from "@/content/lessons/introduction/lesson-04";
import { lesson05 } from "@/content/lessons/introduction/lesson-05";
import { lesson06 } from "@/content/lessons/git-basics/lesson-06";
import { lesson07 } from "@/content/lessons/git-basics/lesson-07";
import { lesson08 } from "@/content/lessons/git-basics/lesson-08";
import { lesson09 } from "@/content/lessons/git-basics/lesson-09";
import { lesson10 } from "@/content/lessons/git-basics/lesson-10";
import { lesson11 } from "@/content/lessons/git-basics/lesson-11";
import { lesson12 } from "@/content/lessons/git-basics/lesson-12";
import { lesson13 } from "@/content/lessons/git-basics/lesson-13";
import { lesson14 } from "@/content/lessons/git-basics/lesson-14";
import { lesson15 } from "@/content/lessons/git-basics/lesson-15";
import { lessonGitConfiguration } from "@/content/lessons/git-fundamentals/git-configuration";
import { lessonRepositoryVsWorkingTree } from "@/content/lessons/git-fundamentals/repository-vs-working-tree";
import { lessonGitRm } from "@/content/lessons/core-commands/git-rm";
import { lessonGitMv } from "@/content/lessons/core-commands/git-mv";

import { lessonPlaceholder_commit_history } from "@/content/lessons/history/commit-history";
import { lessonPlaceholder_head } from "@/content/lessons/history/head";
import { lessonPlaceholder_detached_head } from "@/content/lessons/history/detached-head";
import { lessonPlaceholder_git_show } from "@/content/lessons/history/git-show";
import { lessonPlaceholder_git_blame } from "@/content/lessons/history/git-blame";
import { lessonPlaceholder_git_reflog } from "@/content/lessons/history/git-reflog";
import { lessonBranches } from "@/content/lessons/branching/branches";
import { lessonGitBranch } from "@/content/lessons/branching/git-branch";
import { lessonGitSwitch } from "@/content/lessons/branching/git-switch";
import { lessonGitCheckout } from "@/content/lessons/branching/git-checkout";
import { lessonMerge } from "@/content/lessons/branching/merge";
import { lessonMergeConflicts } from "@/content/lessons/branching/merge-conflicts";
import { lessonFastForwardMerge } from "@/content/lessons/branching/fast-forward-merge";
import { lessonGithub } from "@/content/lessons/remote-repositories/github";
import { lessonGitRemote } from "@/content/lessons/remote-repositories/git-remote";
import { lessonGitClone } from "@/content/lessons/remote-repositories/git-clone";
import { lessonGitFetch } from "@/content/lessons/remote-repositories/git-fetch";
import { lessonGitPull } from "@/content/lessons/remote-repositories/git-pull";
import { lessonGitPush } from "@/content/lessons/remote-repositories/git-push";
import { lessonPlaceholder_stash } from "@/content/lessons/advanced-git/stash";
import { lessonPlaceholder_cherry_pick } from "@/content/lessons/advanced-git/cherry-pick";
import { lessonPlaceholder_reset } from "@/content/lessons/advanced-git/reset";
import { lessonPlaceholder_revert } from "@/content/lessons/advanced-git/revert";
import { lessonPlaceholder_rebase } from "@/content/lessons/advanced-git/rebase";
import { lessonPlaceholder_squash } from "@/content/lessons/advanced-git/squash";
import { lessonPlaceholder_tags } from "@/content/lessons/advanced-git/tags";

/**
 * Registry of all authored lessons. Adding a new lesson to this array (plus
 * its module in curriculum.ts) is the entire integration step.
 */
export const lessons: ContentLesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
  lesson15,
  lessonGitConfiguration,
  lessonRepositoryVsWorkingTree,
  lessonGitRm,
  lessonGitMv,
  lessonPlaceholder_commit_history,
  lessonPlaceholder_head,
  lessonPlaceholder_detached_head,
  lessonPlaceholder_git_show,
  lessonPlaceholder_git_blame,
  lessonPlaceholder_git_reflog,
  lessonBranches,
  lessonGitBranch,
  lessonGitSwitch,
  lessonGitCheckout,
  lessonMerge,
  lessonMergeConflicts,
  lessonFastForwardMerge,
  lessonGithub,
  lessonGitRemote,
  lessonGitClone,
  lessonGitFetch,
  lessonGitPull,
  lessonGitPush,
  lessonPlaceholder_stash,
  lessonPlaceholder_cherry_pick,
  lessonPlaceholder_reset,
  lessonPlaceholder_revert,
  lessonPlaceholder_rebase,
  lessonPlaceholder_squash,
  lessonPlaceholder_tags,
];

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));

export function getLesson(id: string): ContentLesson | undefined {
  return byId.get(id);
}

export function getLessonBySlug(slug: string): ContentLesson | undefined {
  return bySlug.get(slug);
}

/** Lessons in a module, in authored order. */
export function moduleLessons(moduleId: string): ContentLesson[] {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return [];
  return module.lessons
    .map((id) => getLesson(id))
    .filter((lesson): lesson is ContentLesson => Boolean(lesson));
}

/** Every authored lesson in course order. */
export function allLessons(): ContentLesson[] {
  return modules.flatMap((module) => moduleLessons(module.id));
}

export function nextLesson(currentId: string): ContentLesson | undefined {
  const lessonsList = allLessons();
  const index = lessonsList.findIndex((lesson) => lesson.id === currentId);
  return index >= 0 ? lessonsList[index + 1] : undefined;
}

export function previousLesson(currentId: string): ContentLesson | undefined {
  const lessonsList = allLessons();
  const index = lessonsList.findIndex((lesson) => lesson.id === currentId);
  return index > 0 ? lessonsList[index - 1] : undefined;
}

export function isLessonUnlocked(
  lesson: ContentLesson,
  completedLessonIds: string[],
): boolean {
  return (lesson.meta.prerequisites ?? []).every((id) =>
    completedLessonIds.includes(id),
  );
}
