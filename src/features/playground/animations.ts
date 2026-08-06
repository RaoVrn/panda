/**
 * Animation system — event → visual response mappings.
 *
 * When the engine fires an event, the store reads these maps to:
 *   1. highlight the relevant visualizer column(s)
 *   2. show a one-sentence explanation toast
 *
 * Every lesson can override the toast messages via `ContentLessonPlayground.toasts`.
 */

import type { GitEventType } from "@/lib/git";

/** Which visualizer columns to highlight when an event fires. */
export const EVENT_AREA_MAP: Partial<Record<GitEventType, string[]>> = {
  REPOSITORY_INITIALIZED: ["repository"],
  FILE_ADDED: ["working-tree"],
  FILE_MODIFIED: ["working-tree"],
  FILE_DELETED: ["working-tree"],
  FILE_STAGED: ["staging"],
  FILE_UNSTAGED: ["working-tree"],
  FILE_RESTORED: ["working-tree", "repository"],
  COMMIT_CREATED: ["repository", "head"],
  HEAD_CHANGED: ["head"],
  BRANCH_CHANGED: ["head"],
  STATUS_CHANGED: [],
};

/** Default one-sentence explanations shown as toasts after an event. */
export const DEFAULT_EVENT_TOASTS: Partial<Record<GitEventType, string>> = {
  REPOSITORY_INITIALIZED: "Git is now tracking this folder.",
  FILE_STAGED: "Git is preparing this file for the next snapshot.",
  FILE_UNSTAGED: "The file is back in the working tree.",
  FILE_RESTORED: "The working tree now matches the last commit.",
  COMMIT_CREATED: "Git saved a new permanent snapshot.",
  HEAD_CHANGED: "HEAD now points to the latest snapshot.",
};

/** How long (ms) column highlights persist. */
export const AREA_HIGHLIGHT_MS = 900;

/** How long (ms) explanation toasts stay visible. */
export const TOAST_DURATION_MS = 2800;

/** Friendly explanations for common Git errors. */
export const ERROR_HINTS: Record<string, string> = {
  "nothing to commit": "Git only commits staged files. Stage a file first using git add.",
  "not a git repository": "Run git init first to create a repository.",
  "No commits yet": "Any commit needs a parent. Run git add + git commit at least once.",
  "pathspec": "That file doesn't exist. Run ls to see what's in the working tree.",
  "not tracked": "Git hasn't saved this file in a snapshot yet. Track it first.",
  "unknown git command": "That git command isn't available. Type help to see what is.",
};

/** Find the most relevant hint for an error output text. */
export function getErrorHint(text: string): string | undefined {
  for (const [key, hint] of Object.entries(ERROR_HINTS)) {
    if (text.includes(key)) return hint;
  }
  return undefined;
}
