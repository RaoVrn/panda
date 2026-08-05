/**
 * Suggested prompts shown as quick chips when the chat is empty. Lesson-
 * specific suggestions keep learners focused; a generic fallback covers every
 * other screen. Add a new lesson's prompts here. No UI change needed.
 */

import type { ContentLesson } from "@/content/schema";

const COMMON = [
  "Explain like I'm 10",
  "Give me another example",
  "Quiz me on this lesson",
];

/** Lesson 1 · What is Git? */
const WHAT_IS_GIT: string[] = [
  ...COMMON,
  "Why is Git called a time machine?",
  "Show another analogy",
  "Explain visually",
  "How would this work in real life?",
];

const WHY_GIT: string[] = [
  ...COMMON,
  "Why did developers invent Git?",
  "What was life like before Git?",
  "When does version control matter most?",
];

const INSTALLING_GIT: string[] = [
  ...COMMON,
  "How do I check Git is installed?",
  "What is the terminal?",
  "Why do I need a terminal for Git?",
];

const FIRST_REPOSITORY: string[] = [
  ...COMMON,
  "What does git init actually do?",
  "What is inside the .git folder?",
  "Where do I run git init?",
];

const SAVING_SNAPSHOTS: string[] = [
  ...COMMON,
  "What is the difference between add and commit?",
  "Why do I need to stage before committing?",
  "What makes a good commit message?",
];

const REPOSITORY: string[] = [
  ...COMMON,
  "What is inside a Git repository?",
  "What is a commit hash?",
  "Are my files stored twice?",
];

const WORKING_TREE: string[] = [
  ...COMMON,
  "What is the working tree?",
  "What does 'tracked' mean?",
  "Where do my changes live?",
];

const STAGING_AREA: string[] = [
  ...COMMON,
  "Why do I need a staging area?",
  "What does staged mean?",
  "Why does Git need two steps to save?",
];

const GIT_STATUS: string[] = [
  ...COMMON,
  "How do I read git status?",
  "What is an untracked file?",
  "What does 'working tree clean' mean?",
];

const GIT_ADD: string[] = [
  ...COMMON,
  "What does git add do?",
  "What is the difference between git add and git commit?",
  "What does git add . do?",
];

const GIT_COMMIT: string[] = [
  ...COMMON,
  "What is a commit?",
  "How do I write a good commit message?",
  "What is a commit hash?",
];

const GIT_LOG: string[] = [
  ...COMMON,
  "How do I read git log?",
  "What does HEAD mean in git log?",
  "What is the difference between git log and git status?",
];

const GIT_DIFF: string[] = [
  ...COMMON,
  "What is a diff?",
  "How do I read a diff?",
  "What is the difference between git diff and git status?",
];

const GIT_RESTORE: string[] = [
  ...COMMON,
  "What does git restore do?",
  "Can git restore undo a commit?",
  "What is the difference between restore and reset?",
];

const GITIGNORE: string[] = [
  ...COMMON,
  "What is a .gitignore file?",
  "Why do I need to ignore files?",
  "How do I ignore a whole folder?",
];

const FALLBACK: string[] = [
  "What is a commit?",
  "What is a branch?",
  "What is HEAD?",
  "What is staging?",
  "What's the difference between Git and GitHub?",
];

export const SUGGESTIONS_BY_SLUG: Record<string, string[]> = {
  "what-is-git": WHAT_IS_GIT,
  "why-git": WHY_GIT,
  "installing-git": INSTALLING_GIT,
  "first-repository": FIRST_REPOSITORY,
  "saving-snapshots": SAVING_SNAPSHOTS,
  repository: REPOSITORY,
  "working-tree": WORKING_TREE,
  "staging-area": STAGING_AREA,
  "git-status": GIT_STATUS,
  "git-add": GIT_ADD,
  "git-commit": GIT_COMMIT,
  "git-log": GIT_LOG,
  "git-diff": GIT_DIFF,
  "git-restore": GIT_RESTORE,
  gitignore: GITIGNORE,
};

export function suggestionsFor(lesson?: ContentLesson): string[] {
  if (lesson && lesson.slug in SUGGESTIONS_BY_SLUG) {
    return SUGGESTIONS_BY_SLUG[lesson.slug]!;
  }
  return FALLBACK;
}
