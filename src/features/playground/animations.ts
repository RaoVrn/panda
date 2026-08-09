/**
 * Animation system  -  event → visual response mappings.
 *
 * When the engine fires an event, the store reads these maps to:
 *   1. highlight the relevant visualizer column(s)
 *   2. show a one-sentence explanation toast
 *
 * Every lesson can override the toast messages via `ContentLessonPlayground.toasts`.
 */

import type { GitEvent, GitEventType } from "@/lib/git";

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

/** How long (ms) column highlights persist. */
export const AREA_HIGHLIGHT_MS = 900;

/** How long (ms) explanation toasts stay visible. */
export const TOAST_DURATION_MS = 2800;

/** Short, human-friendly file name for toasts (drops the folder path). */
function shortName(path?: string): string {
  if (!path) return "This file";
  const name = path.split("/").pop() ?? path;
  return name;
}

/**
 * Build a beginner-friendly, one-sentence toast that explains what a Git event
 * just changed  -  including the file it touched, so feedback feels concrete
 * ("app.js is now staged") rather than generic ("a file was staged").
 */
export function buildEventToast(
  event: GitEvent,
  overrides: Partial<Record<GitEventType, string>> = {},
): string | undefined {
  const custom = overrides[event.type];
  if (custom) return custom;

  const name = shortName(event.path);
  switch (event.type) {
    case "REPOSITORY_INITIALIZED":
      return "Git is now tracking this folder.";
    case "FILE_STAGED":
      return `${name} is staged and ready for the next snapshot.`;
    case "FILE_UNSTAGED":
      return `${name} is back in the working tree.`;
    case "FILE_ADDED":
      return `${name} was created in the working tree.`;
    case "FILE_MODIFIED":
      return `${name} was updated.`;
    case "FILE_DELETED":
      return `${name} was removed.`;
    case "FILE_RESTORED":
      return `${name} now matches the last snapshot.`;
    case "COMMIT_CREATED": {
      const message = event.payload?.message;
      return message ? `Snapshot saved: "${message}".` : "Git saved a new permanent snapshot.";
    }
    case "HEAD_CHANGED":
      return "HEAD now points to the latest snapshot.";
    case "BRANCH_CHANGED":
      return "You're on a new branch now.";
    case "STASH_CHANGED":
      return "Your stash was updated.";
    default:
      return undefined;
  }
}

/** Friendly explanations for common Git errors. */
export const ERROR_HINTS: Record<string, string> = {
  "nothing to commit": "Git only commits staged files. Stage a file first using git add.",
  "not a git repository": "Run git init first to create a repository.",
  "No commits yet": "Any commit needs a parent. Run git add + git commit at least once.",
  "does not have any commits yet": "This branch has no snapshots yet. Run git add . then git commit -m to create your first one.",
  "pathspec": "That file or reference doesn't exist. Run ls to see what's in the working tree, or git branch to see your branches.",
  "not tracked": "Git hasn't saved this file in a snapshot yet. Create it, git add it, and commit it first.",
  "unknown git command": "That git command isn't available. Type help to see what is.",
  "command not found": "That isn't a command Panda knows. Type help to see what you can use.",
  "invalid reference": "That branch or tag doesn't exist. Run git branch to see your branches.",
  " not found": "That branch or tag doesn't exist. Run git branch or git tag to see what you have.",
  "cannot delete branch": "You can't delete the branch you're standing on. Switch to another branch first, then delete it.",
  "already exists": "That name is taken. Pick a different branch, remote, or tag name.",
  "no such remote": "That remote doesn't exist. Run git remote -v to see which remotes you have.",
  "ambiguous argument": "Git can't find that revision. Copy a full hash from git log --oneline.",
  "bad revision": "That commit doesn't exist. Run git log --oneline to find a real hash.",
  "cannot reset in detached HEAD state": "You're in detached HEAD. Switch to a branch first with git switch <branch>, then reset.",
  "cannot stat path": "That file doesn't exist in the working tree. Run ls to see what's there.",
  "could not clone": "There's no remote repository to clone from in this exercise.",
  "invalid upstream": "That branch isn't a valid rebase target. Run git branch to see your branches.",
  "merge: can't merge": "Merging that branch isn't part of this exercise. Use git switch or git rebase instead.",
  "no local changes to save": "There's nothing to stash, your working tree is clean.",
  "No stash entries found": "There's nothing to pop. Create a stash first with git stash.",
  "cannot remove": "That file isn't in the working tree. Run ls to see what's there.",
  "cannot stat": "That file doesn't exist. Run ls to see what's in the working tree.",
};

/** Find the most relevant hint for an error output text. */
export function getErrorHint(text: string): string | undefined {
  for (const [key, hint] of Object.entries(ERROR_HINTS)) {
    if (text.includes(key)) return hint;
  }
  return undefined;
}

/** Git commands the engine knows, for "did you mean" suggestions. */
const KNOWN_GIT_COMMANDS = [
  "add",
  "status",
  "init",
  "commit",
  "log",
  "diff",
  "restore",
  "branch",
  "switch",
  "checkout",
  "merge",
  "show",
  "blame",
  "reflog",
  "stash",
  "cherry-pick",
  "reset",
  "revert",
  "rebase",
  "tag",
  "remote",
  "clone",
  "fetch",
  "pull",
  "push",
  "config",
];

/** The nearest known git command, by edit distance, within a small threshold. */
export function closestCommand(typed: string): string | undefined {
  const clean = typed.replace(/^git\s+/, "").trim().split(/\s+/)[0];
  if (!clean) return undefined;
  let best: string | undefined;
  let bestDist = Infinity;
  for (const known of KNOWN_GIT_COMMANDS) {
    const dist = editDistance(clean, known);
    if (dist < bestDist) {
      bestDist = dist;
      best = known;
    }
  }
  return bestDist <= 2 ? best : undefined;
}

function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i]![0] = i;
  for (let j = 0; j < cols; j++) dp[0]![j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[rows - 1]![cols - 1]!;
}
