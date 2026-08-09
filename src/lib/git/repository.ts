/**
 * Git State Engine  -  repository model.
 *
 * Creation, cloning and the derived file-status model. Commands (commands.ts)
 * build on these helpers. Everything is immutable: each mutation returns a
 * NEW repository so the UI can diff snapshots cheaply.
 */

import type {
  GitAuthor,
  GitChangedFile,
  GitCommit,
  GitFileEntry,
  GitFileStatus,
  GitRepository,
} from "./types";

export interface CreateRepositoryOptions {
  pwd?: string;
  author?: GitAuthor;
  /** Seed the working tree with files (path → content). Untracked until committed. */
  files?: Record<string, string>;
  /** Whether the repository starts initialized (has run `git init`). */
  initialized?: boolean;
  /** Seed a simulated remote (GitHub) repository with these files/options. */
  remote?: CreateRepositoryOptions;
}

// The starter identity. The Git Fundamentals config lesson teaches learners to
// set this to their own name/email, so it must differ from the values that
// lesson's objectives check ("Panda" / "panda@example.com").
const DEFAULT_AUTHOR: GitAuthor = { name: "Git Learner", email: "learner@example.com" };

export function createRepository(options: CreateRepositoryOptions = {}): GitRepository {
  const files: Record<string, string> = options.files ?? {};
  const workingTree = new Map<string, GitFileEntry>();
  for (const [path, content] of Object.entries(files)) {
    const entry = toEntry(path, content);
    workingTree.set(path, entry);
  }
  return {
    initialized: options.initialized ?? false,
    pwd: options.pwd ?? "~/project",
    author: options.author ?? DEFAULT_AUTHOR,
    workingTree,
    index: new Set(),
    head: null,
    branch: "main",
    detached: false,
    branches: new Map([["main", ""]]),
    commits: [],
    tags: new Map(),
    stash: [],
    remotes: new Map(),
    reflog: [],
    mergeState: null,
    rebaseState: null,
  };
}

function toEntry(path: string, content: string): GitFileEntry {
  const name = path.split("/").pop() ?? path;
  return { id: path, name, path, content };
}

/** Deep-enough copy so callers never alias into the previous state. */
export function cloneRepository(repo: GitRepository): GitRepository {
  return {
    ...repo,
    workingTree: new Map(
      [...repo.workingTree].map(([path, file]) => [path, { ...file }]),
    ),
    index: new Set(repo.index),
    branches: new Map(repo.branches),
    commits: repo.commits.map((commit) => ({
      ...commit,
      parents: [...commit.parents],
      changedFiles: commit.changedFiles.map((c) => ({ ...c })),
    })),
    tags: new Map(repo.tags),
    stash: repo.stash.map((entry) => ({
      ...entry,
      files: new Map([...entry.files].map(([p, f]) => [p, { ...f }])),
    })),
    remotes: new Map(repo.remotes),
    reflog: repo.reflog.map((entry) => ({ ...entry })),
    mergeState: repo.mergeState ? { ...repo.mergeState, conflictedFiles: [...repo.mergeState.conflictedFiles] } : null,
    rebaseState: repo.rebaseState ? { ...repo.rebaseState, remaining: [...repo.rebaseState.remaining] } : null,
  };
}

/** Whether a path was ever committed (tracked) by a commit reachable from HEAD. */
export function wasTracked(repo: GitRepository, path: string): boolean {
  return logCommits(repo).some((commit) =>
    commit.changedFiles.some((file) => file.path === path),
  );
}

/** The commit HEAD currently points at, if any. */
export function headCommit(repo: GitRepository): GitCommit | undefined {
  return repo.commits.find((c) => c.hash === repo.head) ?? undefined;
}

/** Commits reachable from HEAD, newest first (matches `git log`). */
export function logCommits(repo: GitRepository): GitCommit[] {
  if (!repo.head) return [];
  const byHash = new Map(repo.commits.map((c) => [c.hash, c]));
  const ordered: GitCommit[] = [];
  const seen = new Set<string>();
  let current: string | undefined = repo.head;
  while (current && !seen.has(current)) {
    seen.add(current);
    const commit = byHash.get(current);
    if (!commit) break;
    ordered.push(commit);
    current = commit.parents[0];
  }
  return ordered;
}

/**
 * Derived status for one path. `file.original` is the baseline, so status is
 * computed here  -  never stored redundantly.
 */
export function fileStatusOf(repo: GitRepository, path: string): GitFileStatus {
  const file = repo.workingTree.get(path);
  const inIndex = repo.index.has(path);
  const tracked = file ? file.original !== undefined : wasTracked(repo, path);
  const present = file !== undefined;

  if (inIndex) {
    if (!present) {
      return { path, state: "staged-deleted", tracked, staged: true, modified: false, deleted: true, untracked: false };
    }
    if (file.original !== undefined && file.content !== file.original) {
      return { path, state: "staged-modified", tracked, staged: true, modified: true, deleted: false, untracked: false, file };
    }
    return { path, state: "staged", tracked, staged: true, modified: false, deleted: false, untracked: !tracked, file };
  }

  if (!tracked) {
    return { path, state: "untracked", tracked, staged: false, modified: false, deleted: false, untracked: true, file };
  }
  if (!present) {
    return { path, state: "deleted", tracked, staged: false, modified: false, deleted: true, untracked: false };
  }
  if (file.original !== undefined && file.content !== file.original) {
    return { path, state: "modified", tracked, staged: false, modified: true, deleted: false, untracked: false, file };
  }
  return { path, state: "tracked", tracked, staged: false, modified: false, deleted: false, untracked: false, file };
}

/** All paths worth showing in `git status`, in sorted order. */
export function statusPaths(repo: GitRepository): string[] {
  const paths = new Set<string>(repo.workingTree.keys());
  for (const path of repo.index) paths.add(path);
  for (const path of repo.workingTree.keys()) {
    if (fileStatusOf(repo, path).deleted) paths.add(path);
  }
  // Only commits reachable from HEAD count as "tracked". Files that belong to
  // reset-away or other-branch commits must not linger in `git status` as
  // phantom deletions after a reset.
  for (const commit of logCommits(repo)) {
    for (const change of commit.changedFiles) {
      if (change.status === "deleted") continue;
      paths.add(change.path);
    }
  }
  return [...paths].sort();
}

export function statusRows(repo: GitRepository): GitFileStatus[] {
  return statusPaths(repo).map((path) => fileStatusOf(repo, path));
}

/** Append a working-tree file (new or overwrite). */
export function writeWorkingTree(repo: GitRepository, path: string, content: string): void {
  const existing = repo.workingTree.get(path);
  repo.workingTree.set(path, {
    id: path,
    name: path.split("/").pop() ?? path,
    path,
    content,
    original: existing?.original,
  });
}

export function deleteFromWorkingTree(repo: GitRepository, path: string): void {
  repo.workingTree.delete(path);
}

export function stagePath(repo: GitRepository, path: string): void {
  repo.index.add(path);
}

export function unstagePath(repo: GitRepository, path: string): void {
  repo.index.delete(path);
}

/**
 * Minimal `.gitignore` support (Phase 1 subset):
 *   - `*.ext`      → every file ending in `.ext`
 *   - `dir/`       → every path inside `dir`
 *   - a plain name → exactly that file or directory
 * Only untracked files are ever affected (that's how real Git behaves too).
 * Lines that are blank or start with `#` are comments and ignored.
 */
export function isIgnored(repo: GitRepository, path: string): boolean {
  const ignoreFile = repo.workingTree.get(".gitignore");
  if (!ignoreFile) return false;
  const name = path.split("/").pop() ?? path;
  for (const rawLine of ignoreFile.content.split("\n")) {
    const pattern = rawLine.trim();
    if (!pattern || pattern.startsWith("#")) continue;
    if (pattern.endsWith("/")) {
      const dir = pattern.slice(0, -1);
      if (path.startsWith(`${dir}/`)) return true;
      continue;
    }
    if (pattern.startsWith("*.")) {
      const extension = pattern.slice(1);
      if (name.endsWith(extension)) return true;
      continue;
    }
    if (pattern === name || pattern === path) return true;
    if (!pattern.includes("/")) {
      const regex = new RegExp(
        `^${pattern.split("*").map(escapeRegExp).join(".*")}$`,
      );
      if (regex.test(name)) return true;
    }
  }
  return false;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Deterministic, readable short hash. */
export function shortHash(seed: string, index: number): string {  const input = `${index}:${seed}`;
  let hash = 0;
  for (const char of input) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }
  return (Math.abs(hash).toString(16) + "a1b2c3d").slice(0, 7);
}

export function makeCommitId(hash: string): string {
  return `commit-${hash}`;
}

/** Create the commit object for the current index (assumes staged changes). */
export function buildCommit(
  repo: GitRepository,
  message: string,
  timestamp: number,
  changedFiles: GitChangedFile[],
): GitCommit {
  const parent = repo.head;
  const hash = shortHash(message, repo.commits.length);
  return {
    id: makeCommitId(hash),
    hash,
    message,
    author: { ...repo.author },
    timestamp,
    parents: parent ? [parent] : [],
    branch: repo.branch,
    changedFiles,
  };
}
