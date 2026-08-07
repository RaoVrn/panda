/**
 * Panda Git State Engine — shared types.
 *
 * A strongly-typed, in-memory Git simulation that is entirely independent of
 * React. Every future visualization, terminal, lesson and AI explanation reads
 * this state. Nothing here imports React.
 */

/** Author identity stamped on commits. */
export interface GitAuthor {
  name: string;
  email: string;
}

/**
 * A file in the working tree. `original` holds the content at the last commit
 * (undefined = never committed), so status is DERIVED, never duplicated.
 * The booleans you'd expect (tracked/staged/modified/deleted/untracked) are
 * computed by `fileStatusOf` — see `GitFileStatus`.
 */
export interface GitFileEntry {
  id: string;
  name: string;
  path: string;
  content: string;
  /** Baseline content at the last commit. */
  original?: string;
}

export type GitFileState =
  | "untracked"
  | "tracked"
  | "modified"
  | "staged"
  | "staged-modified"
  | "deleted"
  | "staged-deleted"
  | "clean";

/** Derived status of one file (what visualizations and status panels render). */
export interface GitFileStatus {
  path: string;
  state: GitFileState;
  tracked: boolean;
  staged: boolean;
  modified: boolean;
  deleted: boolean;
  untracked: boolean;
  file?: GitFileEntry;
}

export type GitChangedFileStatus = "added" | "modified" | "deleted";

export interface GitChangedFile {
  path: string;
  status: GitChangedFileStatus;
  /** File content at commit time (used to reconstruct a branch's working tree). */
  content?: string;
}

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: GitAuthor;
  timestamp: number;
  /** Parent hashes (empty for the root commit). */
  parents: string[];
  /** Branch this commit was created on. */
  branch: string;
  changedFiles: GitChangedFile[];
}

export interface GitTag {
  name: string;
  commitHash: string;
}

export interface GitStashEntry {
  id: string;
  message: string;
  files: Map<string, GitFileEntry>;
}

/** Non-empty while a merge is in progress. */
export interface GitMergeState {
  branch: string;
  baseHash: string;
  incomingHash: string;
  conflictedFiles: string[];
}

/** Non-empty while a rebase is in progress. */
export interface GitRebaseState {
  branch: string;
  onto: string;
  /** Commit hashes still to be replayed. */
  remaining: string[];
}

/**
 * The complete simulated repository. Working tree + index + object store
 * (commits) + refs (branches/tags) + stash. Remotes/merge/rebase are modelled
 * now so future milestones fill them in without changing this shape.
 */
export interface GitRepository {
  initialized: boolean;
  /** Present working directory (where the repo lives). */
  pwd: string;
  author: GitAuthor;
  /** Working tree files keyed by relative path. */
  workingTree: Map<string, GitFileEntry>;
  /** Staging area (index): paths ready for the next commit. */
  index: Set<string>;
  /** HEAD commit hash (null = unborn branch). */
  head: string | null;
  /** Checked-out branch name. */
  branch: string;
  /** branch name → head commit hash. */
  branches: Map<string, string>;
  /** All commits, oldest first. */
  commits: GitCommit[];
  /** tag name → commit hash. */
  tags: Map<string, string>;
  /** Stash entries (oldest first). */
  stash: GitStashEntry[];
  /** remote name → url. */
  remotes: Map<string, string>;
  mergeState: GitMergeState | null;
  rebaseState: GitRebaseState | null;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export type GitEventType =
  | "REPOSITORY_INITIALIZED"
  | "FILE_ADDED"
  | "FILE_MODIFIED"
  | "FILE_DELETED"
  | "FILE_STAGED"
  | "FILE_UNSTAGED"
  | "FILE_RESTORED"
  | "STATUS_CHANGED"
  | "COMMIT_CREATED"
  | "HEAD_CHANGED"
  | "BRANCH_CHANGED"
  | "TAG_CREATED"
  | "STASH_CHANGED"
  | "VISUALIZATION_UPDATED";

export interface GitEvent {
  id: string;
  type: GitEventType;
  /** File path the event concerns, when relevant. */
  path?: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Command output                                                      */
/* ------------------------------------------------------------------ */

export type GitOutputKind = "output" | "success" | "error" | "muted";

export interface GitCommandOutput {
  text: string;
  kind: GitOutputKind;
}

/** The result of running one command against the repository. */
export interface GitCommandResult {
  /** The new repository state (commands are immutable: old state untouched). */
  state: GitRepository;
  /** The remote repository after the command, if it changed (push/pull/fetch). */
  remote?: GitRepository;
  events: GitEvent[];
  output: GitCommandOutput;
}
