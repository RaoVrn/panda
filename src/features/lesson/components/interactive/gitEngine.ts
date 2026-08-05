/**
 * A tiny simulated Git engine powering Panda's interactive terminal.
 *
 * Pure and deterministic: `runCommand` takes a state and returns a new state
 * plus the lines to print. It intentionally mirrors real Git's wording so a
 * learner's mental model carries over to a real terminal, while staying small
 * enough to read in an evening. Add new commands here as future lessons need
 * them (merge, rebase, diff, stash …). Each lesson just preloads the state it
 * starts from and lets learners type.
 */

export type OutputKind =
  | "output"
  | "success"
  | "error"
  | "warning"
  | "muted";

export interface GitFile {
  content: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  files: string[];
}

export interface GitState {
  /** Has `git init` been run in this session? */
  initialized: boolean;
  /** Present working directory, printed by `pwd`. */
  pwd: string;
  /** Working-tree files, keyed by relative path. */
  files: Map<string, GitFile>;
  /** Paths currently in the index (staging area). */
  staged: Set<string>;
  /** Commits, oldest first. */
  commits: GitCommit[];
  /** branch name -> head commit hash. */
  branches: Map<string, string>;
  /** The checked-out branch. */
  branch: string;
}

export interface CommandOutput {
  lines: string[];
  kind: OutputKind;
  /** When true, the terminal should wipe the visible history. */
  clear?: boolean;
}

export interface CommandResult {
  state: GitState;
  output: CommandOutput;
}

const DEFAULT_FILES: Record<string, string> = {
  "README.md": "Hello Panda\n",
  "package.json": '{\n  "name": "project"\n}\n',
  "src/main.js": "console.log('hello');\n",
};

export function createGitState(options?: {
  files?: Record<string, string>;
  pwd?: string;
}): GitState {
  const files = new Map<string, GitFile>();
  const seed = options?.files ?? DEFAULT_FILES;
  for (const [path, content] of Object.entries(seed)) {
    files.set(path, { content });
  }
  return {
    initialized: false,
    pwd: options?.pwd ?? "~/project",
    files,
    staged: new Set(),
    commits: [],
    branches: new Map([["main", ""]]),
    branch: "main",
  };
}

/** Deterministic, readable short hash for an in-memory commit. */
function shortHash(message: string, index: number): string {
  const seed = `${index}:${message}`;
  let hash = 0;
  for (const char of seed) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }
  return (Math.abs(hash).toString(16) + "a1b2c3d").slice(0, 7);
}

/** Working-tree state of a path: staged, modified, untracked or clean. */
function fileStatus(state: GitState, path: string): string {
  if (state.staged.has(path)) return "staged";
  if (state.commits.length === 0) return "untracked";
  const committed = state.commits.some((c) => c.files.includes(path));
  if (!committed && !state.staged.has(path)) return "untracked";
  return "tracked";
}

function notARepo(state: GitState): CommandResult {
  return {
    state,
    output: {
      lines: [
        "fatal: not a git repository (or any of the parent directories): .git",
      ],
      kind: "error",
    },
  };
}

function message(message: string, kind: OutputKind = "output"): CommandOutput {
  return { lines: [message], kind };
}

function parseCommitMessage(raw: string): string | null {
  const match = raw.match(/^git commit -m\s+(?:(["'])(.*?)\1|(\S+))$/);
  if (!match) return null;
  return match[2] ?? match[3] ?? null;
}

function parseAdd(raw: string): string | null {
  if (raw === "git add ." || raw === "git add -A") return ".";
  const match = raw.match(/^git add\s+(\S+)$/);
  return match ? match[1]! : null;
}

/** Run a single raw command line against `state`. Never mutates `state`. */
export function runCommand(state: GitState, raw: string): CommandResult {
  const trimmed = raw.trim();
  const cmd = trimmed.split(/\s+/)[0] ?? "";

  if (cmd === "") return { state, output: message("") };

  // Non-git shell commands.
  if (cmd === "pwd")
    return { state, output: message(state.pwd, "output") };
  if (cmd === "ls") {
    const names = [...state.files.keys()].sort();
    return {
      state,
      output: message(names.join("  ") || "(empty)", "output"),
    };
  }
  if (cmd === "clear")
    return { state, output: { lines: [], kind: "output", clear: true } };
  if (cmd === "help") {
    return {
      state,
      output: message(
        [
          "Try any of these commands:",
          "  pwd, ls, clear, help",
          "  git init           start tracking this folder",
          "  git status         see what Git notices",
          "  git add <file>     stage a change (or `git add .`)",
          '  git commit -m "…"  save a snapshot',
          "  git log            show your history",
          "  git branch         list branches",
          "  git checkout <b>   switch branches",
        ].join("\n"),
        "muted",
      ),
    };
  }
  if (!trimmed.startsWith("git ")) {
    return {
      state,
      output: message(`panda: command not found: ${cmd}\nType 'help' for available commands.`, "error"),
    };
  }

  const next = cloneState(state);
  const sub = trimmed.slice(4).trim();

  // git init
  if (sub === "init") {
    if (next.initialized) {
      return {
        state,
        output: message(
          `Reinitialized existing Git repository in ${next.pwd}/.git/`,
          "success",
        ),
      };
    }
    next.initialized = true;
    return {
      state: next,
      output: message(
        `Initialized empty Git repository in ${next.pwd}/.git/`,
        "success",
      ),
    };
  }

  if (!next.initialized) return notARepo(state);

  // git status
  if (sub === "status") {
    const lines: string[] = [`On branch ${next.branch}`];
    if (next.commits.length === 0) {
      lines.push("", "No commits yet");
    }
    const staged = [...next.staged];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    for (const path of next.files.keys()) {
      const status = fileStatus(next, path);
      if (status === "staged") continue;
      if (status === "untracked") untracked.push(path);
      else unstaged.push(path);
    }
    if (staged.length > 0) {
      lines.push("", "Changes to be committed:", "  (use \"git reset HEAD <file>\" to unstage)");
      for (const p of staged) lines.push(`\tnew file:   ${p}`);
    }
    if (unstaged.length > 0) {
      lines.push("", "Changes not staged for commit:");
      for (const p of unstaged) lines.push(`\tmodified:   ${p}`);
    }
    if (untracked.length > 0) {
      lines.push("", "Untracked files:", '  (use "git add <file>..." to include in what will be committed)');
      for (const p of untracked) lines.push(`\t${p}`);
    }
    if (staged.length === 0 && unstaged.length === 0 && untracked.length === 0) {
      lines.push("", "nothing to commit, working tree clean");
    }
    return { state, output: message(lines.join("\n"), "muted") };
  }

  // git add <path>
  const addTarget = parseAdd(sub);
  if (addTarget !== null) {
    const targets =
      addTarget === "."
        ? [...next.files.keys()]
        : next.files.has(addTarget)
          ? [addTarget]
          : [];
    if (targets.length === 0) {
      return {
        state,
        output: message(
          addTarget === "."
            ? "Nothing to add. The working tree has no changes."
            : `fatal: pathspec '${addTarget}' did not match any files`,
          "error",
        ),
      };
    }
    for (const p of targets) next.staged.add(p);
    const nouns = targets.length === 1 ? `${targets[0]} is` : `${targets.length} files are`;
    return {
      state: next,
      output: message(
        `${nouns} now staged and ready for their snapshot.`,
        "success",
      ),
    };
  }

  // git commit -m "…"
  const commitMessage = parseCommitMessage(trimmed);
  if (commitMessage !== null) {
    const files = [...next.staged];
    if (files.length === 0) {
      return {
        state,
        output: message("nothing to commit, working tree clean", "muted"),
      };
    }
    const hash = shortHash(commitMessage, next.commits.length);
    next.commits.push({ hash, message: commitMessage, files });
    next.branches.set(next.branch, hash);
    next.staged.clear();
    const root = next.commits.length === 1;
    const noun = files.length === 1 ? "1 file changed" : `${files.length} files changed`;
    return {
      state: next,
      output: message(
        `[${next.branch}${root ? " (root-commit)" : ""} ${hash}] ${commitMessage}\n ${noun}`,
        "success",
      ),
    };
  }

  // git log
  if (sub === "log") {
    if (next.commits.length === 0) {
      return { state, output: message("fatal: your current branch 'main' does not have any commits yet", "error") };
    }
    const lines = [...next.commits].reverse().flatMap((c, i) => [
      `commit ${c.hash}`,
      i === 0 ? `HEAD -> ${next.branch}` : "",
      `    ${c.message}`,
      "",
    ]);
    return { state, output: message(lines.join("\n"), "output") };
  }

  // git branch / git branch <name>
  if (sub === "branch") {
    const lines = [...next.branches.keys()].map(
      (b) => `${b === next.branch ? "*" : " "} ${b}`,
    );
    return { state, output: message(lines.join("\n"), "output") };
  }
  const branchMatch = trimmed.match(/^git branch\s+([\w/.-]+)$/);
  if (branchMatch) {
    const name = branchMatch[1]!;
    if (next.branches.has(name)) {
      return { state, output: message(`fatal: a branch named '${name}' already exists`, "error") };
    }
    next.branches.set(name, next.branches.get(next.branch) ?? "");
    return { state: next, output: message(`Switched to a new branch '${name}'`, "success") };
  }

  // git checkout <name>
  const checkoutMatch = trimmed.match(/^git checkout\s+([\w/.-]+)$/);
  if (checkoutMatch) {
    const name = checkoutMatch[1]!;
    if (!next.branches.has(name)) {
      return { state, output: message(`error: pathspec '${name}' did not match any branch`, "error") };
    }
    next.branch = name;
    return { state: next, output: message(`Switched to branch '${name}'`, "success") };
  }

  return {
    state,
    output: message(
      `panda: unknown git command '${sub}'\nType 'help' for available commands.`,
      "error",
    ),
  };
}

/** Deep-enough copy so callers can run many commands without aliasing. */
function cloneState(state: GitState): GitState {
  return {
    ...state,
    files: new Map(state.files),
    staged: new Set(state.staged),
    commits: state.commits.map((c) => ({ ...c, files: [...c.files] })),
    branches: new Map(state.branches),
  };
}

/** Run a script of commands and return the final state (used for preloads). */
export function applyScript(
  initial: GitState,
  commands: string[],
  stopAt: number,
): GitState {
  let state = cloneState(initial);
  for (let i = 0; i < Math.min(stopAt, commands.length); i++) {
    state = runCommand(state, commands[i]!).state;
  }
  return state;
}