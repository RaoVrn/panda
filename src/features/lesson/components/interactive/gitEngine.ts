/**
 * A simulated Git engine powering Panda's interactive terminal and the
 * shared "git sim" store that keeps every visualization in sync.
 *
 * Pure and deterministic: `runCommand` takes a state and returns a new state
 * plus the lines to print. It intentionally mirrors real Git's wording so a
 * learner's mental model carries over to a real terminal, while staying small
 * enough to read in an evening.
 *
 * Files carry their committed baseline (`original`), so the engine can report
 * real modified/untracked/staged states and power `git diff` and
 * `git restore` just like the real thing.
 */

export type OutputKind =
  | "output"
  | "success"
  | "error"
  | "warning"
  | "muted";

export interface GitFile {
  content: string;
  /** Content at the last commit (baseline). Undefined = never committed. */
  original?: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  files: string[];
  /** Parent commit hashes (older first). Empty for the root commit. */
  parents: string[];
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
  /** branch name -> head commit hash ("" for an unborn branch). */
  branches: Map<string, string>;
  /** The checked-out branch. */
  branch: string;
  /** remote name -> url. */
  remotes: Map<string, string>;
  /** tag name -> commit hash. */
  tags: Map<string, string>;
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
  initialized?: boolean;
}): GitState {
  const files = new Map<string, GitFile>();
  const seed = options?.files ?? DEFAULT_FILES;
  for (const [path, content] of Object.entries(seed)) {
    files.set(path, { content });
  }
  return {
    initialized: options?.initialized ?? false,
    pwd: options?.pwd ?? "~/project",
    files,
    staged: new Set(),
    commits: [],
    branches: new Map([["main", ""]]),
    branch: "main",
    remotes: new Map(),
    tags: new Map(),
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

export type FileStatus =
  | "staged"
  | "modified"
  | "untracked"
  | "clean"
  | "staged-modified";

/** Working-tree state of a path. */
export function fileStatus(state: GitState, path: string): FileStatus {
  const file = state.files.get(path);
  if (state.staged.has(path)) {
    const committed = file && file.original !== undefined;
    const dirty = file && file.original !== undefined && file.content !== file.original;
    if (!committed) return "staged";
    return dirty ? "staged-modified" : "staged";
  }
  if (state.commits.length === 0) return "untracked";
  if (!file || file.original === undefined) return "untracked";
  return file.content !== file.original ? "modified" : "clean";
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
  const match = raw.match(/^git commit\s+(?:-m\s+)?(?:(["'])(.*?)\1|(\S+))$/);
  if (!match) return null;
  return match[2] ?? match[3] ?? null;
}

function parseAdd(raw: string): string[] | null {
  if (raw === "add ." || raw === "add -A" || raw === "add -a") return ["."];
  const match = raw.match(/^add\s+(.+)$/);
  if (!match) return null;
  return match[1]!.trim().split(/\s+/);
}

/** Whether `ancestor` is reachable from `descendant` in the commit graph. */
function isAncestor(
  commits: GitCommit[],
  ancestorHash: string,
  descendantHash: string,
): boolean {
  if (ancestorHash === descendantHash) return true;
  const byHash = new Map(commits.map((c) => [c.hash, c]));
  const stack = [descendantHash];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const hash = stack.pop()!;
    if (hash === ancestorHash) return true;
    if (seen.has(hash)) continue;
    seen.add(hash);
    const commit = byHash.get(hash);
    if (commit) stack.push(...commit.parents);
  }
  return false;
}

/** `echo <text> > <file>` or `echo <text> >> <file>` (append). */
function parseEcho(raw: string): { text: string; file: string; append: boolean } | null {
  const match = raw.match(/^echo\s+(?:(["'])(.*?)\1|(\S+))\s*(>>|>)\s*(\S+)$/);
  if (!match) return null;
  return {
    text: match[2] ?? match[3] ?? "",
    file: match[5]!,
    append: match[4] === ">>",
  };
}

/** Render a tiny hunk for a single modified file, Git style. */
function diffHunk(path: string, original: string | undefined, current: string): string[] {
  const a = (original ?? "").split("\n");
  const b = current.split("\n");
  const out: string[] = [`diff --git a/${path} b/${path}`];
  out.push(`--- a/${path}`);
  out.push(`+++ b/${path}`);
  if (original === undefined) {
    out.push("@@ -0,0 +1," + b.length + " @@");
    for (const line of b) out.push("+" + line);
    return out;
  }
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] === b[i]) continue;
    const start = i;
    let end = i;
    while (end + 1 < max && a[end + 1] !== b[end + 1]) end++;
    out.push(`@@ -${start + 1},${end - start + 1} +${start + 1},${end - start + 1} @@`);
    for (let j = start; j <= end; j++) {
      if (a[j] !== undefined && a[j] !== b[j]) out.push("-" + a[j]);
      if (b[j] !== undefined && a[j] !== b[j]) out.push("+" + b[j]);
    }
    i = end;
  }
  return out;
}

/** Run a single raw command line against `state`. Never mutates `state`. */
export function runCommand(state: GitState, raw: string): CommandResult {
  const trimmed = raw.trim();
  const cmd = trimmed.split(/\s+/)[0] ?? "";

  if (cmd === "") return { state, output: message("") };

  // Non-git shell commands.
  if (cmd === "pwd") return { state, output: message(state.pwd, "output") };
  if (cmd === "ls") {
    const names = [...state.files.keys()].sort();
    return {
      state,
      output: message(names.join("  ") || "(empty)", "output"),
    };
  }
  if (cmd === "cat") {
    const file = trimmed.slice(4).trim();
    const hit = state.files.get(file);
    return {
      state,
      output: message(hit ? hit.content : `cat: ${file}: No such file or directory`, hit ? "output" : "error"),
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
          "  pwd, ls, cat <file>, clear, help",
          '  echo "hi" > file.txt   write (or overwrite) a file',
          "  git init                start tracking this folder",
          "  git status              see what Git notices",
          "  git add <file>          stage a change (or `git add .`)",
          '  git commit -m "…"       save a snapshot',
          "  git log / --oneline     show your history",
          "  git diff                see unstaged changes",
          "  git restore <file>      throw away unstaged changes",
          "  git branch / switch     work with branches",
          "  git merge <branch>      join branches",
          "  git tag <name>          name a commit",
          "  git remote add origin <url>",
        ].join("\n"),
        "muted",
      ),
    };
  }
  if (!trimmed.startsWith("git ")) {
    // echo writes files; anything else is unknown.
    const echo = parseEcho(trimmed);
    if (echo) {
      const next = cloneState(state);
      const existing = next.files.get(echo.file);
      const content = echo.append ? (existing?.content ?? "") + echo.text + "\n" : echo.text + "\n";
      next.files.set(echo.file, { content, original: existing?.original });
      return {
        state: next,
        output: message(echo.append ? `${echo.file} updated` : `wrote ${echo.file}`, "success"),
      };
    }
    return {
      state,
      output: message(
        `panda: command not found: ${cmd}\nType 'help' for available commands.`,
        "error",
      ),
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
    if (next.commits.length === 0) lines.push("", "No commits yet");
    const stagedNew: string[] = [];
    const stagedMod: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    for (const path of next.files.keys()) {
      const status = fileStatus(next, path);
      if (status === "staged") stagedNew.push(path);
      else if (status === "staged-modified") stagedMod.push(path);
      else if (status === "modified") unstaged.push(path);
      else if (status === "untracked") untracked.push(path);
    }
    if (stagedNew.length > 0 || stagedMod.length > 0) {
      lines.push("", "Changes to be committed:", '  (use "git restore --staged <file>..." to unstage)');
      for (const p of stagedNew) lines.push(`\tnew file:   ${p}`);
      for (const p of stagedMod) lines.push(`\tmodified:   ${p}`);
    }
    if (unstaged.length > 0) {
      lines.push("", "Changes not staged for commit:", '  (use "git add <file>..." to update what will be committed)');
      for (const p of unstaged) lines.push(`\tmodified:   ${p}`);
    }
    if (untracked.length > 0) {
      lines.push("", "Untracked files:", '  (use "git add <file>..." to include in what will be committed)');
      for (const p of untracked) lines.push(`\t${p}`);
    }
    if (
      stagedNew.length + stagedMod.length + unstaged.length + untracked.length === 0
    ) {
      lines.push("", "nothing to commit, working tree clean");
    }
    return { state, output: message(lines.join("\n"), "muted") };
  }

  // git add <path...>
  const addTargets = parseAdd(sub);
  if (addTargets !== null) {
    const requested = addTargets.includes(".")
      ? [...next.files.keys()]
      : addTargets;
    const targets = requested.filter((p) => next.files.has(p));
    if (targets.length === 0) {
      return {
        state,
        output: message(
          addTargets.includes(".")
            ? "Nothing to add. The working tree has no changes."
            : `fatal: pathspec '${requested[0]}' did not match any files`,
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
    const parent = next.branches.get(next.branch) ?? undefined;
    const hash = shortHash(commitMessage, next.commits.length);
    next.commits.push({
      hash,
      message: commitMessage,
      files,
      parents: parent ? [parent] : [],
    });
    next.branches.set(next.branch, hash);
    for (const p of files) {
      const file = next.files.get(p);
      if (file) file.original = file.content;
    }
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

  // git log [--oneline]
  if (sub === "log" || sub === "log --oneline") {
    if (next.commits.length === 0) {
      return {
        state,
        output: message(
          "fatal: your current branch 'main' does not have any commits yet",
          "error",
        ),
      };
    }
    const oneline = sub === "log --oneline";
    const head = next.branches.get(next.branch);
    const lines = [...next.commits].reverse().flatMap((c) => {
      const isHead = c.hash === head;
      if (oneline) {
        const tags = [...next.tags.entries()]
          .filter(([, h]) => h === c.hash)
          .map(([name]) => name);
        const marks = [
          isHead ? `HEAD -> ${next.branch}` : "",
          ...tags.map((t) => `tag: ${t}`),
        ].filter(Boolean);
        return [`${c.hash} ${marks.length > 0 ? `(${marks.join(", ")}) ` : ""}${c.message}`];
      }
      const tags = [...next.tags.entries()]
        .filter(([, h]) => h === c.hash)
        .map(([name]) => `tag: ${name}`);
      return [
        `commit ${c.hash}`,
        isHead ? `HEAD -> ${next.branch}` : "",
        ...tags,
        `    ${c.message}`,
        "",
      ];
    });
    return { state, output: message(lines.join("\n"), "output") };
  }

  // git diff [--staged]
  if (sub === "diff" || sub === "diff --staged" || sub === "diff --cached") {
    const stagedOnly = sub !== "diff";
    const out: string[] = [];
    for (const path of next.files.keys()) {
      const status = fileStatus(next, path);
      if (stagedOnly) {
        if (status !== "staged" && status !== "staged-modified") continue;
      } else {
        if (status !== "modified") continue;
      }
      const file = next.files.get(path)!;
      out.push(...diffHunk(path, file.original, file.content));
    }
    if (out.length === 0) {
      return {
        state,
        output: message(stagedOnly ? "nothing staged to commit" : "no changes", "muted"),
      };
    }
    return { state, output: message(out.join("\n"), "muted") };
  }

  // git restore <file> / git restore --staged <file>
  const restoreStaged = trimmed.match(/^git restore --staged\s+(\S+)$/);
  if (restoreStaged) {
    const path = restoreStaged[1]!;
    if (!next.staged.has(path)) {
      return { state, output: message(`no changes staged for '${path}'`, "muted") };
    }
    next.staged.delete(path);
    return { state: next, output: message(`Unstaged '${path}'`, "success") };
  }
  const restoreMatch = trimmed.match(/^git restore\s+(\S+)$/);
  if (restoreMatch) {
    const path = restoreMatch[1]!;
    const file = next.files.get(path);
    if (!file || file.original === undefined) {
      return { state, output: message(`fatal: '${path}' is not tracked`, "error") };
    }
    next.files.set(path, { content: file.original, original: file.original });
    return {
      state: next,
      output: message(`Restored '${path}' from the last snapshot`, "success"),
    };
  }

  // git reset HEAD <file>
  const resetHead = trimmed.match(/^git reset HEAD\s+(\S+)$/);
  if (resetHead) {
    const path = resetHead[1]!;
    if (!next.staged.has(path)) {
      return { state, output: message(`no changes staged for '${path}'`, "muted") };
    }
    next.staged.delete(path);
    return { state: next, output: message(`Unstaged '${path}'`, "success") };
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
    return { state: next, output: message(`Created branch '${name}'`, "success") };
  }

  // git switch <name> / git switch -c <name>
  const switchNew = trimmed.match(/^git switch -c\s+([\w/.-]+)$/);
  if (switchNew) {
    const name = switchNew[1]!;
    if (next.branches.has(name)) {
      return { state, output: message(`fatal: a branch named '${name}' already exists`, "error") };
    }
    next.branches.set(name, next.branches.get(next.branch) ?? "");
    next.branch = name;
    return { state: next, output: message(`Switched to a new branch '${name}'`, "success") };
  }
  const switchMatch = trimmed.match(/^git switch\s+([\w/.-]+)$/);
  if (switchMatch) {
    const name = switchMatch[1]!;
    if (!next.branches.has(name)) {
      return { state, output: message(`fatal: invalid reference: ${name}`, "error") };
    }
    next.branch = name;
    return { state: next, output: message(`Switched to branch '${name}'`, "success") };
  }

  // git checkout <name> (alias of switch)
  const checkoutMatch = trimmed.match(/^git checkout\s+([\w/.-]+)$/);
  if (checkoutMatch) {
    const name = checkoutMatch[1]!;
    if (!next.branches.has(name)) {
      return { state, output: message(`error: pathspec '${name}' did not match any branch`, "error") };
    }
    next.branch = name;
    return { state: next, output: message(`Switched to branch '${name}'`, "success") };
  }

  // git merge <branch>
  const mergeMatch = trimmed.match(/^git merge\s+([\w/.-]+)$/);
  if (mergeMatch) {
    const name = mergeMatch[1]!;
    if (name === next.branch || !next.branches.has(name)) {
      return {
        state,
        output: message(name === next.branch ? "Already up to date." : `merge: ${name} - not something we can merge`, "muted"),
      };
    }
    const head = next.branches.get(next.branch);
    const target = next.branches.get(name);
    if (head && target && isAncestor(next.commits, head, target)) {
      next.branches.set(next.branch, target);
      return {
        state: next,
        output: message(`Updating ${head ?? "(root)"}..${target}\nFast-forward`, "success"),
      };
    }
    const hash = shortHash(`Merge branch '${name}'`, next.commits.length);
    next.commits.push({
      hash,
      message: `Merge branch '${name}'`,
      files: [...next.staged],
      parents: head && target ? [head, target] : [],
    });
    next.branches.set(next.branch, hash);
    next.staged.clear();
    return {
      state: next,
      output: message(
        `Merge made by the 'ort' strategy.\n ${hash} Merge branch '${name}'`,
        "success",
      ),
    };
  }

  // git tag <name>
  const tagMatch = trimmed.match(/^git tag\s+([\w/.-]+)$/);
  if (tagMatch) {
    const name = tagMatch[1]!;
    const head = next.branches.get(next.branch);
    if (!head) {
      return { state, output: message(`fatal: Failed to resolve 'HEAD' as a valid ref`, "error") };
    }
    if (next.tags.has(name)) {
      return { state, output: message(`fatal: tag '${name}' already exists`, "error") };
    }
    next.tags.set(name, head);
    return { state: next, output: message(`Tagged ${name} at ${head}`, "success") };
  }

  // git remote add <name> <url>
  const remoteAdd = trimmed.match(/^git remote add\s+(\S+)\s+(\S+)$/);
  if (remoteAdd) {
    next.remotes.set(remoteAdd[1]!, remoteAdd[2]!);
    return {
      state: next,
      output: message(`Added remote ${remoteAdd[1]} at ${remoteAdd[2]}`, "success"),
    };
  }
  if (sub === "remote -v") {
    const lines = [...next.remotes.entries()].map(
      ([name, url]) => `${name}\t${url} (fetch)\n${name}\t${url} (push)`,
    );
    return { state, output: message(lines.join("\n") || "(no remotes)", "output") };
  }

  // git push / pull / fetch — friendly simulation for the GitHub module.
  if (sub === "push") {
    return {
      state,
      output: message(
        "Everything up-to-date (simulated).\nIn real life, push uploads your commits to GitHub.",
        "success",
      ),
    };
  }
  if (sub === "pull" || sub === "fetch") {
    return {
      state,
      output: message(
        `Already up to date. (${sub} checked your remote for new work.)`,
        "success",
      ),
    };
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
export function cloneState(state: GitState): GitState {
  return {
    ...state,
    files: new Map([...state.files].map(([k, v]) => [k, { ...v }])),
    staged: new Set(state.staged),
    commits: state.commits.map((c) => ({ ...c, files: [...c.files], parents: [...c.parents] })),
    branches: new Map(state.branches),
    remotes: new Map(state.remotes),
    tags: new Map(state.tags),
  };
}

/**
 * Edit a working-tree file directly (used by editors and the staging-area
 * visualization). Returns a new state; never mutates the input.
 */
export function editFile(
  state: GitState,
  path: string,
  content: string,
): GitState {
  const next = cloneState(state);
  const existing = next.files.get(path);
  next.files.set(path, { content, original: existing?.original });
  return next;
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
