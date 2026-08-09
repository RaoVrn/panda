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

export interface GitAuthor {
  name: string;
  email: string;
}

export interface GitChangedFile {
  path: string;
  status: "added" | "modified" | "deleted";
  content?: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  files: string[];
  /** Parent commit hashes (older first). Empty for the root commit. */
  parents: string[];
  /** Content-level changes, mirroring the playground engine. Enables revert/cherry-pick/rebase. */
  changedFiles: GitChangedFile[];
  author: GitAuthor;
  timestamp: number;
}

export interface GitStashEntry {
  id: string;
  message: string;
  files: Map<string, GitFile>;
}

export interface GitState {
  /** Has `git init` been run in this session? */
  initialized: boolean;
  /** Present working directory, printed by `pwd`. */
  pwd: string;
  /** The commit author stamps on new commits (configurable via git config). */
  author: GitAuthor;
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
  /** True when HEAD is detached (e.g. after `git checkout <tag>`). */
  detached: boolean;
  /** remote name -> url. */
  remotes: Map<string, string>;
  /** tag name -> commit hash. */
  tags: Map<string, string>;
  /** Saved working-tree stashes (`git stash`), oldest first. */
  stash: GitStashEntry[];
  /** HEAD movements (`git reset`, `git rebase`, `git commit` …). */
  reflog: Array<{ from: string | null; to: string | null; message: string }>;
  /**
   * The simulated remote (GitHub) repository this repo talks to, if one was
   * seeded. Mirrors the playground engine: clone/fetch/pull/push operate on
   * this real repository, so the terminal behaves exactly like the Playground.
   */
  remote?: GitState;
}

/** Options for building a fresh GitState, including a nested remote seed. */
export interface CreateGitStateOptions {
  files?: Record<string, string>;
  pwd?: string;
  initialized?: boolean;
  remote?: CreateGitStateOptions;
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

export function createGitState(options?: CreateGitStateOptions): GitState {
  const files = new Map<string, GitFile>();
  const seed = options?.files ?? DEFAULT_FILES;
  for (const [path, content] of Object.entries(seed)) {
    files.set(path, { content });
  }
  return {
    initialized: options?.initialized ?? false,
    pwd: options?.pwd ?? "~/project",
    author: { name: "Git Learner", email: "learner@example.com" },
    files,
    staged: new Set(),
    commits: [],
    branches: new Map([["main", ""]]),
    branch: "main",
    detached: false,
    remotes: new Map(),
    tags: new Map(),
    stash: [],
    reflog: [],
    remote: options?.remote ? createGitState(options.remote) : undefined,
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

/**
 * Fixed reference clock so terminal `git log` / `git show` dates are stable and
 * reproducible across sessions (the playground uses the wall clock; the
 * documentary terminal needs dates that scripted output can match exactly).
 * Commits advance one minute per commit.
 */
const SESSION_BASE_MS = Date.UTC(2026, 7, 9, 0, 0, 0);

function commitTimestamp(index: number): number {
  return SESSION_BASE_MS + index * 60_000;
}

/** Match the playground's `formatDate` (commands.ts). */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const match = raw.match(/^echo\s+(?:(["'])([\s\S]*?)\1|(\S+))\s*(>>|>)\s*(\S+)$/);
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
    if (trimmed.trim() !== "ls") {
      const path = trimmed.slice(3).trim();
      return {
        state,
        output: message(`ls: cannot access '${path}': No such file or directory`, "error"),
      };
    }
    const names = [...state.files.keys()].sort();
    return {
      state,
      output: message(names.join("  ") || "(empty)", "output"),
    };
  }
  if (cmd === "git" && trimmed.trim() === "git") {
    return {
      state,
      output: message("Git needs a subcommand. Try `git status`.", "muted"),
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
  if (cmd === "touch") {
    const path = trimmed.slice(6).trim();
    if (!path) return { state, output: message("touch: missing file operand", "error") };
    const next = cloneState(state);
    const existing = next.files.get(path);
    next.files.set(path, { content: existing?.content ?? "", original: existing?.original });
    return {
      state: next,
      output: message(existing ? `touch: ${path} updated` : `created ${path}`, "success"),
    };
  }
  if (cmd === "rm") {
    const path = trimmed.slice(3).trim();
    if (!path) return { state, output: message("rm: missing operand", "error") };
    const next = cloneState(state);
    if (!next.files.has(path)) {
      return { state, output: message(`rm: cannot remove '${path}': No such file or directory`, "error") };
    }
    next.files.delete(path);
    return { state: next, output: message(`removed ${path}`, "success") };
  }
  if (cmd === "mv") {
    const match = trimmed.match(/^mv\s+(\S+)\s+(\S+)$/);
    if (!match) {
      return { state, output: message("usage: mv <source> <destination>", "error") };
    }
    const from = match[1]!;
    const to = match[2]!;
    const next = cloneState(state);
    const file = next.files.get(from);
    if (!file) {
      return { state, output: message(`mv: cannot stat '${from}': No such file or directory`, "error") };
    }
    if (next.files.has(to)) {
      return { state, output: message(`mv: '${to}': destination exists`, "error") };
    }
    next.files.delete(from);
    if (next.staged.has(from)) {
      next.staged.delete(from);
      next.staged.add(to);
    }
    next.files.set(to, { content: file.content });
    return { state: next, output: message(`${from} → ${to}`, "success") };
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
          "  git stash / pop         set work aside and bring it back",
          "  git cherry-pick <rev>   copy one commit onto your branch",
          "  git reset [--soft|--mixed|--hard] [<rev>]",
          "  git revert [<rev>]      undo with a new commit",
          "  git rebase <branch>     replay commits onto another branch",
          "  git remote add origin <url>",
          "  git clone <url> <dir>     copy a remote repository",
          "  git fetch                 check the remote for new work",
          "  git pull                  bring remote work into your branch",
          "  git push                  send your commits to the remote",
        ].join("\n"),
        "muted",
      ),
    };
  }
  if (!trimmed.startsWith("git ")) {
    // echo writes files; bare echo prints the supplied text.
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
    if (cmd === "echo") {
      let text = trimmed.slice(5).trim();
      if (
        (text.startsWith('"') && text.endsWith('"')) ||
        (text.startsWith("'") && text.endsWith("'"))
      ) {
        text = text.slice(1, -1);
      }
      return { state, output: message(text, "output") };
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

  // git --version / git config work anywhere, like real Git (and the playground).
  if (sub === "--version" || sub === "-v") {
    return { state, output: message("git version 2.39.2", "success") };
  }
  if (/^git config(?: --global)? --list$/.test(trimmed)) {
    return {
      state,
      output: message(
        `user.name=${next.author.name}\nuser.email=${next.author.email}`,
        "output",
      ),
    };
  }
  const configSetName = trimmed.match(/^git config(?: --global)? user\.name\s+(?:["'](.+?)["']|(\S+))$/);
  if (configSetName) {
    const name = (configSetName[1] ?? configSetName[2] ?? "").trim();
    if (!name) return { state, output: message("fatal: empty value", "error") };
    next.author = { ...next.author, name };
    return { state: next, output: message("", "success") };
  }
  const configSetEmail = trimmed.match(/^git config(?: --global)? user\.email\s+(?:["'](.+?)["']|(\S+))$/);
  if (configSetEmail) {
    const email = (configSetEmail[1] ?? configSetEmail[2] ?? "").trim();
    if (!email) return { state, output: message("fatal: empty value", "error") };
    next.author = { ...next.author, email };
    return { state: next, output: message("", "success") };
  }
  const configGet = trimmed.match(/^git config(?: --global)? user\.(name|email)$/);
  if (configGet) {
    const value = configGet[1] === "name" ? next.author.name : next.author.email;
    return { state, output: message(value, "output") };
  }

  if (!next.initialized) return notARepo(state);

  // git status
  if (sub === "status") {
    const lines: string[] = [`On branch ${next.branch}`];
    if (next.commits.length === 0) lines.push("", "No commits yet");
    const stagedNew: string[] = [];
    const stagedMod: string[] = [];
    const stagedDel: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    const deletedUnstaged = new Set(
      trackedDeletedPaths(next).filter((p) => !next.staged.has(p)),
    );
    const paths = new Set<string>([...next.files.keys(), ...next.staged, ...trackedDeletedPaths(next)]);
    for (const path of [...paths].sort()) {
      const present = next.files.has(path);
      const inIndex = next.staged.has(path);
      if (inIndex && !present) {
        stagedDel.push(path);
        continue;
      }
      if (deletedUnstaged.has(path)) {
        unstaged.push(path);
        continue;
      }
      const status = fileStatus(next, path);
      if (status === "staged") stagedNew.push(path);
      else if (status === "staged-modified") stagedMod.push(path);
      else if (status === "modified") unstaged.push(path);
      else if (status === "untracked") {
        if (!isIgnored(next, path)) untracked.push(path);
      }
    }
    if (stagedNew.length + stagedMod.length + stagedDel.length > 0) {
      lines.push("", "Changes to be committed:", '  (use "git restore --staged <file>..." to unstage)');
      for (const p of stagedNew) lines.push(`\tnew file:   ${p}`);
      for (const p of stagedMod) lines.push(`\tmodified:   ${p}`);
      for (const p of stagedDel) lines.push(`\tdeleted:    ${p}`);
    }
    if (unstaged.length > 0) {
      lines.push("", "Changes not staged for commit:");
      for (const p of unstaged) {
        lines.push(`\t${next.files.has(p) ? "modified" : "deleted"}:   ${p}`);
      }
    }
    if (untracked.length > 0) {
      lines.push("", "Untracked files:", '  (use "git add <file>..." to include in what will be committed)');
      for (const p of untracked) lines.push(`\t${p}`);
    }
    if (
      stagedNew.length + stagedMod.length + stagedDel.length + unstaged.length + untracked.length === 0
    ) {
      lines.push("", "nothing to commit, working tree clean");
    }
    return { state, output: message(lines.join("\n"), "muted") };
  }

  // git add <path...>
  const addTargets = parseAdd(sub);
  if (addTargets !== null) {
    const requested = addTargets.includes(".")
      ? [...next.files.keys(), ...trackedDeletedPaths(next)]
      : addTargets;
    const targets = requested
      .filter((p) => next.files.has(p) || wasTrackedIn(next, p))
      .filter((p) => !isIgnored(next, p));
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
    const pronoun = targets.length === 1 ? "its" : "their";
    return {
      state: next,
      output: message(
        `${nouns} now staged and ready for ${pronoun} snapshot.`,
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
    const changedFiles: GitChangedFile[] = [];
    for (const p of files) {
      const file = next.files.get(p);
      changedFiles.push({
        path: p,
        status: file ? (file.original !== undefined ? "modified" : "added") : "deleted",
        content: file?.content,
      });
    }
    next.commits.push({
      hash,
      message: commitMessage,
      files,
      parents: parent ? [parent] : [],
      changedFiles,
      author: { ...next.author },
      timestamp: commitTimestamp(next.commits.length),
    });
    next.branches.set(next.branch, hash);
    recordReflog(next, parent ?? null, hash, `commit: ${commitMessage}`);
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

  // git log [--oneline] [<rev>]
  const logMatch = trimmed.match(/^git log(?:\s+(--oneline))?(?:\s+([\w/.-]+))?$/);
  if (logMatch) {
    if (next.commits.length === 0) {
      return {
        state,
        output: message(
          "fatal: your current branch 'main' does not have any commits yet",
          "error",
        ),
      };
    }
    const oneline = logMatch[1] === "--oneline";
    const explicit = logMatch[2];
    const target = explicit ? resolveRev(next, explicit) : next.branches.get(next.branch) ?? null;
    if (explicit && (target === null || target === undefined)) {
      return {
        state,
        output: message(`fatal: ambiguous argument '${explicit}': unknown revision`, "error"),
      };
    }
    if (target === null || target === undefined) {
      return {
        state,
        output: message(
          "fatal: your current branch 'main' does not have any commits yet",
          "error",
        ),
      };
    }
      const head = next.branches.get(next.branch);
      const lines = [...commitsFromHead(next, target)].reverse().flatMap((c) => {
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
          `Author: ${c.author.name} <${c.author.email}>`,
          `Date:   ${formatDate(c.timestamp)}`,
          ...tags,
          "",
          `    ${c.message}`,
          "",
        ];
      });
      return { state, output: message(lines.join("\n"), "output") };
    }

  // git show [<rev>]
  const showMatch = trimmed.match(/^git show(?:\s+(\S+))?$/);
  if (showMatch) {
    const target = showMatch[1] ?? next.branches.get(next.branch) ?? "";
    const commit = next.commits.find((c) => c.hash === target);
    if (!commit) {
      return {
        state,
        output: message(`fatal: ambiguous argument '${target || "HEAD"}': unknown revision`, "error"),
      };
    }
    const showLines = [
      `commit ${commit.hash}`,
      `Author: ${commit.author.name} <${commit.author.email}>`,
      `Date:   ${formatDate(commit.timestamp)}`,
      "",
      `    ${commit.message}`,
      "",
    ];
    if (commit.changedFiles.length > 0) {
      showLines.push(
        ...commit.changedFiles.map(
          (f) => ` ${f.status === "added" ? "A" : f.status === "deleted" ? "D" : "M"}  ${f.path}`,
        ),
      );
    }
    return { state, output: message(showLines.join("\n"), "output") };
  }

  // git blame <file>
  const blameMatch = trimmed.match(/^git blame(?:\s+(\S+))?$/);
  if (blameMatch) {
    const path = blameMatch[1] ?? "";
    if (!path) return { state, output: message("usage: git blame <file>", "error") };
    const file = next.files.get(path);
    if (!file) {
      return { state, output: message(`fatal: cannot stat path '${path}': No such file or directory`, "error") };
    }
    const content = file.content;
    if (!content.trim()) return { state, output: message("(empty file)", "muted") };
    const touching = next.commits.filter((c) =>
      c.changedFiles.some((f) => f.path === path && f.status !== "deleted"),
    );
    const last = touching[touching.length - 1];
    const headHash = last?.hash.slice(0, 7) ?? "0000000";
    const author = last?.author.name ?? "Unknown";
    const lines = content.split("\n").filter((l) => l !== "");
    return {
      state,
      output: message(
        lines
          .map(
            (line) =>
              `${headHash} (${author} ${new Date(last?.timestamp ?? Date.now()).toLocaleDateString()}) ${line}`,
          )
          .join("\n"),
        "muted",
      ),
    };
  }

  // git reflog
  if (sub === "reflog") {
    if (next.reflog.length === 0) return { state, output: message("(no reflog entries)", "muted") };
    const lines = [...next.reflog].reverse().map((entry, i) => {
      const to = entry.to?.slice(0, 7) ?? "0000000";
      return `${to} HEAD@{${next.reflog.length - 1 - i}}: ${entry.message}`;
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
    const base = next.branches.get(next.branch) ?? "";
    next.branches.set(name, base);
    recordReflog(next, next.branches.get(next.branch) ?? null, base || null, `switch: creating branch '${name}'`);
    next.branch = name;
    next.detached = false;
    return { state: next, output: message(`Switched to a new branch '${name}'`, "success") };
  }
  const switchMatch = trimmed.match(/^git switch\s+([\w/.-]+)$/);
  if (switchMatch) {
    const name = switchMatch[1]!;
    if (!next.branches.has(name)) {
      return { state, output: message(`fatal: invalid reference: ${name}`, "error") };
    }
    const target = next.branches.get(name) ?? null;
    recordReflog(next, next.branches.get(next.branch) ?? null, target, `switch: moving to ${name}`);
    next.branch = name;
    next.detached = false;
    return { state: next, output: message(`Switched to branch '${name}'`, "success") };
  }

  // git branch -d <name>
  const branchDelete = trimmed.match(/^git branch -d\s+([\w/.-]+)$/);
  if (branchDelete) {
    const name = branchDelete[1]!;
    if (!next.branches.has(name)) {
      return { state, output: message(`error: branch '${name}' not found`, "error") };
    }
    if (name === next.branch) {
      return { state, output: message(`error: cannot delete branch '${name}' checked out at '${name}'`, "error") };
    }
    const headHash = next.branches.get(name) ?? "";
    next.branches.delete(name);
    recordReflog(next, next.branches.get(next.branch) ?? null, next.branches.get(next.branch) ?? null, `branch -d ${name}`);
    return { state: next, output: message(`Deleted branch ${name} (was ${headHash.slice(0, 7)})`, "success") };
  }

  // git checkout <branch|tag|hash>
  const checkoutMatch = trimmed.match(/^git checkout\s+([\w/.-]+)$/);
  if (checkoutMatch) {
    const name = checkoutMatch[1]!;
    if (next.branches.has(name)) {
      const target = next.branches.get(name) ?? null;
      recordReflog(next, next.branches.get(next.branch) ?? null, target, `checkout: moving to ${name}`);
      next.branch = name;
      next.detached = false;
      return { state: next, output: message(`Switched to branch '${name}'`, "success") };
    }
    // A tag name detaches HEAD at the tagged commit, like the playground engine.
    if (next.tags.has(name)) {
      const tagHash = next.tags.get(name)!;
      recordReflog(next, next.branches.get(next.branch) ?? null, tagHash, `checkout: moving to ${name}`);
      next.branch = "HEAD";
      next.detached = true;
      next.files = treeToFiles(commitTreeAt(next, tagHash));
      next.staged.clear();
      return { state: next, output: message(`HEAD is now at ${name}`, "success") };
    }
    // A commit hash enters detached HEAD at that commit.
    const commit = next.commits.find((c) => c.hash === name);
    if (commit) {
      recordReflog(next, next.branches.get(next.branch) ?? null, commit.hash, `checkout: moving to ${name}`);
      next.branch = "HEAD";
      next.detached = true;
      next.files = treeToFiles(commitTreeAt(next, commit.hash));
      next.staged.clear();
      return { state: next, output: message(`HEAD is now at ${name}`, "success") };
    }
    return { state, output: message(`error: pathspec '${name}' did not match any branch`, "error") };
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
    const stagedFiles = [...next.staged];
    const changedFiles: GitChangedFile[] = stagedFiles.map((p) => {
      const file = next.files.get(p);
      return {
        path: p,
        status: file ? (file.original !== undefined ? "modified" : "added") : "deleted",
        content: file?.content,
      };
    });
    next.commits.push({
      hash,
      message: `Merge branch '${name}'`,
      files: stagedFiles,
      parents: head && target ? [head, target] : [],
      changedFiles,
      author: { ...next.author },
      timestamp: commitTimestamp(next.commits.length),
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

  // git tag [--list]  -  list tags
  if (sub === "tag" || sub === "tag --list") {
    if (next.tags.size === 0) return { state, output: message("(no tags)", "muted") };
    const lines = [...next.tags.entries()].map(
      ([name, hash]) => `${hash.slice(0, 7)} ${name}`,
    );
    return { state, output: message(lines.join("\n"), "output") };
  }

  // git tag -d <name>
  const tagDelete = trimmed.match(/^git tag -d\s+([\w./-]+)$/);
  if (tagDelete) {
    const name = tagDelete[1]!;
    if (!next.tags.has(name)) {
      return { state, output: message(`error: tag '${name}' not found`, "error") };
    }
    next.tags.delete(name);
    return { state: next, output: message(`Deleted tag '${name}'`, "success") };
  }

  // git tag <name>
  const tagMatch = trimmed.match(/^git tag\s+([\w./-]+)$/);
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
    return { state: next, output: message(`tag '${name}' created (${head.slice(0, 7)})`, "success") };
  }

  // git remote add <name> <url>
  const remoteAdd = trimmed.match(/^git remote add\s+(\S+)\s+(\S+)$/);
  if (remoteAdd) {
    const name = remoteAdd[1]!;
    const url = remoteAdd[2]!;
    if (next.remotes.has(name)) {
      return {
        state,
        output: message(`error: remote ${name} already exists`, "error"),
      };
    }
    next.remotes.set(name, url);
    return {
      state: next,
      output: message(`Added remote ${name} at ${url}`, "success"),
    };
  }

  // git remote (bare)
  if (sub === "remote") {
    const names = [...next.remotes.keys()];
    if (names.length === 0) {
      return { state, output: message("(no remotes configured)", "muted") };
    }
    return { state, output: message(names.join("\n"), "output") };
  }

  // git remote -v
  if (sub === "remote -v") {
    const lines = [...next.remotes.entries()].map(
      ([name, url]) => `${name}\t${url} (fetch)\n${name}\t${url} (push)`,
    );
    return {
      state,
      output: message(lines.join("\n") || "(no remotes configured)", "output"),
    };
  }

  // git remote rename <from> <to>
  const remoteRename = trimmed.match(/^git remote rename\s+(\S+)\s+(\S+)$/);
  if (remoteRename) {
    const from = remoteRename[1]!;
    const to = remoteRename[2]!;
    if (!next.remotes.has(from)) {
      return { state, output: message(`error: no such remote: '${from}'`, "error") };
    }
    if (next.remotes.has(to)) {
      return { state, output: message(`error: remote ${to} already exists`, "error") };
    }
    const url = next.remotes.get(from)!;
    next.remotes.delete(from);
    next.remotes.set(to, url);
    return {
      state: next,
      output: message(`Renamed remote ${from} to ${to}`, "success"),
    };
  }

  // git remote remove <name>
  const remoteRemove = trimmed.match(/^git remote remove\s+(\S+)$/);
  if (remoteRemove) {
    const name = remoteRemove[1]!;
    if (!next.remotes.has(name)) {
      return { state, output: message(`error: no such remote: '${name}'`, "error") };
    }
    next.remotes.delete(name);
    return { state: next, output: message(`Removed remote ${name}`, "success") };
  }

  // git clone <url> [<dir>]  -  copies the seeded remote repository.
  const cloneMatch = trimmed.match(/^git clone\s+(\S+)(?:\s+(\S+))?$/);
  if (cloneMatch) {
    if (!next.remote) {
      return {
        state,
        output: message(`fatal: could not clone '${cloneMatch[1]}'`, "error"),
      };
    }
    const cloned = cloneState(next.remote);
    cloned.pwd = cloneMatch[2] ?? "~/project";
    cloned.initialized = true;
    // A clone sets up the remote automatically, named origin.
    if (!cloned.remotes.has("origin")) cloned.remotes.set("origin", cloneMatch[1]!);
    // Keep the simulated remote wired up so fetch/pull/push work afterwards.
    cloned.remote = next.remote;
    return {
      state: cloned,
      output: message(`Cloning into '${cloneMatch[2] ?? "project"}'...\nDone.`, "success"),
    };
  }

  // git fetch  -  checks the remote and reports what's new, never touches work.
  if (sub === "fetch") {
    if (!next.remote) {
      return { state, output: message("fatal: no remote repository configured", "error") };
    }
    const remoteHead = next.remote.branches.get(next.remote.branch);
    if (!remoteHead) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    const localHead = next.branches.get(next.branch);
    if (remoteHead === localHead) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    const remoteOnly = next.remote.commits.filter(
      (c) => !next.commits.some((l) => l.hash === c.hash),
    );
    if (remoteOnly.length === 0) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    const noun = remoteOnly.length === 1 ? "commit" : "commits";
    const hashes = remoteOnly.map((c) => c.hash.slice(0, 7)).join(", ");
    return {
      state,
      output: message(
        `Remote has ${remoteOnly.length} new ${noun} (${hashes}).\nYour work is untouched. Run git pull to bring them in.`,
        "success",
      ),
    };
  }

  // git pull  -  fast-forward the current branch with the remote's new work.
  if (sub === "pull") {
    if (!next.remote) {
      return { state, output: message("fatal: no remote repository configured", "error") };
    }
    const remoteHead = next.remote.branches.get(next.remote.branch);
    if (!remoteHead) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    const localHead = next.branches.get(next.branch);
    if (remoteHead === localHead) {
      return { state, output: message("Already up to date.", "muted") };
    }
    const remoteOnly = next.remote.commits.filter(
      (c) => !next.commits.some((l) => l.hash === c.hash),
    );
    if (remoteOnly.length === 0) {
      return { state, output: message("Already up to date.", "muted") };
    }
    next.commits.push(...remoteOnly.map((c) => ({ ...c })));
    next.branches.set(next.branch, remoteHead);
    // Bring the working tree along: remote files win, local-only files stay.
    const files = new Map<string, GitFile>();
    for (const [path, file] of next.remote.files) files.set(path, { ...file });
    for (const [path, file] of next.files) {
      if (!files.has(path)) files.set(path, { ...file });
    }
    next.files = files;
    next.staged.clear();
    return {
      state: next,
      output: message(
        `Updating ${(localHead ?? "").slice(0, 7)}..${remoteHead.slice(0, 7)}\nFast-forward`,
        "success",
      ),
    };
  }

  // git push  -  copy local commits to the remote, rejecting non-fast-forward.
  if (sub === "push") {
    if (!next.remote) {
      return { state, output: message("fatal: no remote repository configured", "error") };
    }
    const remote = next.remote;
    const localHead = next.branches.get(next.branch);
    if (!localHead) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    const remoteHead = remote.branches.get(remote.branch);
    if (
      remoteHead &&
      remoteHead !== localHead &&
      !isAncestor(next.commits, remoteHead, localHead)
    ) {
      return {
        state,
        output: message(
          `! [rejected] ${next.branch} -> ${next.branch} (non-fast-forward)\nerror: failed to push some refs to the remote\nhint: the remote has commits you don't have. Pull first, then push.`,
          "error",
        ),
      };
    }
    const localOnly = next.commits.filter(
      (c) => !remote.commits.some((r) => r.hash === c.hash),
    );
    const nextRemote = cloneState(remote);
    nextRemote.commits.push(...localOnly.map((c) => ({ ...c })));
    nextRemote.branches.set(next.branch, localHead);
    if (!nextRemote.branches.get(nextRemote.branch)) {
      nextRemote.branches.set(nextRemote.branch, localHead);
    }
    next.remote = nextRemote;
    const noun = localOnly.length === 1 ? "commit" : "commits";
    return {
      state: next,
      output: message(
        localOnly.length === 0
          ? "Everything up-to-date"
          : `To the remote\n   ${(remoteHead ?? "").slice(0, 7)}..${localHead.slice(0, 7)}  ${next.branch} -> ${next.branch}\n  ${localOnly.length} ${noun} pushed.`,
        "success",
      ),
    };
  }

  // ------------------------------------------------- git push --tags
  if (sub === "push --tags" || sub === "push --tag") {
    if (!next.remote) {
      return { state, output: message("fatal: no remote repository configured", "error") };
    }
    if (next.tags.size === 0) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    const nextRemote = cloneState(next.remote);
    let pushed = 0;
    for (const [name, hash] of next.tags) {
      if (!nextRemote.tags.has(name)) {
        nextRemote.tags.set(name, hash);
        pushed++;
      }
    }
    if (pushed === 0) {
      return { state, output: message("Everything up-to-date", "muted") };
    }
    next.remote = nextRemote;
    return {
      state: next,
      output: message(
        `To the remote\n * [new tag]   ${[...next.tags.keys()].join("\n   [new tag]   ")}\n${pushed} tag${pushed === 1 ? "" : "s"} pushed.`,
        "success",
      ),
    };
  }

  // ----------------------------------------------------------- git stash
  if (sub === "stash" || sub === "stash push" || /^git stash push\s+-m\s+/.test(trimmed)) {
    const messageMatch = trimmed.match(/^git stash(?: push)?(?:\s+-m\s+["']?([^"']+)["']?)?/);
    const dirtyPaths: string[] = [];
    for (const [path, file] of next.files) {
      const status = fileStatus(next, path);
      if (
        status === "modified" ||
        status === "untracked" ||
        status === "staged-modified" ||
        (status === "staged" && file.original === undefined)
      ) {
        dirtyPaths.push(path);
      }
    }
    if (dirtyPaths.length === 0) {
      return { state, output: message("No local changes to save", "muted") };
    }
    const files = new Map<string, GitFile>();
    for (const path of dirtyPaths) {
      const file = next.files.get(path);
      if (file) files.set(path, { ...file });
    }
    const stashMessage = messageMatch?.[1]?.trim() || `WIP on ${next.branch}`;
    next.stash.push({ id: `stash-${next.stash.length}`, message: stashMessage, files });
    // Revert the working tree to HEAD.
    const headTree = commitTreeAt(next, next.branches.get(next.branch) ?? null);
    const cleanTree = new Map<string, GitFile>();
    for (const [path, content] of headTree) cleanTree.set(path, { content, original: content });
    next.files = cleanTree;
    next.staged.clear();
    return {
      state: next,
      output: message(
        `Saved working directory and index state WIP on ${next.branch}: ${stashMessage}\nWork is safely set aside.`,
        "success",
      ),
    };
  }
  if (sub === "stash list") {
    if (next.stash.length === 0) return { state, output: message("(no stashes)", "muted") };
    const lines = next.stash.map((entry, i) => `stash@{${i}}: ${entry.message}`);
    return { state, output: message(lines.join("\n"), "output") };
  }
  const stashPop = trimmed.match(/^git stash pop(?:\s+(?:\d+|stash@\{\d+\}))?$/);
  if (stashPop) {
    if (next.stash.length === 0) {
      return { state, output: message("No stash entries found.", "error") };
    }
    const index = Number(trimmed.match(/(\d+)/)?.[1] ?? 0);
    const entry = next.stash[index];
    if (!entry) {
      return { state, output: message(`error: stash@{$index} does not exist`, "error") };
    }
    for (const [path, file] of entry.files) {
      next.files.set(path, { ...file });
    }
    next.stash.splice(index, 1);
    return {
      state: next,
      output: message(
        `Dropped stash@{${index}} (${entry.message})\nWork is back in your working tree.`,
        "success",
      ),
    };
  }

  // ------------------------------------------------------ git cherry-pick
  const cherryMatch = trimmed.match(/^git cherry-pick\s+(\S+)$/);
  if (cherryMatch) {
    const target = resolveRev(next, cherryMatch[1]!);
    if (!target) {
      return { state, output: message(`fatal: bad revision '${cherryMatch[1]}'`, "error") };
    }
    const picked = next.commits.find((c) => c.hash === target);
    if (!picked) {
      return { state, output: message(`fatal: bad revision '${cherryMatch[1]}'`, "error") };
    }
    const branchHead = next.branches.get(next.branch);
    if (!branchHead) {
      return { state, output: message("fatal: no commits yet", "error") };
    }
    const changes = relocatableChanges(next, picked, false);
    applyChangesToTree(next, changes);
    const commit = commitChangedFiles(next, picked.message, changes, next.branch);
    return {
      state: next,
      output: message(
        `[${next.branch} ${commit.hash}] ${picked.message}\nOne commit copied onto your branch.`,
        "success",
      ),
    };
  }

  // ------------------------------------------------------------ git reset
  const resetMatch = trimmed.match(/^git reset(?:\s+(--soft|--mixed|--hard))?(?:\s+(\S+))?$/);
  if (resetMatch) {
    const mode = resetMatch[1] ?? "--mixed";
    const rev = resetMatch[2] ?? "HEAD";
    const target = resolveRev(next, rev);
    if (target === null || target === undefined) {
      return { state, output: message(`fatal: ambiguous argument '${rev}': unknown revision`, "error") };
    }
    if (next.detached) {
      return { state, output: message("fatal: cannot reset in detached HEAD state", "error") };
    }
    const branch = next.branch;
    const wasHead = next.branches.get(branch) ?? null;
    recordReflog(next, wasHead, target, `reset: moving to ${rev}`);
    next.branches.set(branch, target);
    if (mode === "--hard") {
      const tree = commitTreeAt(next, target);
      const cleanTree = new Map<string, GitFile>();
      for (const [path, content] of tree) cleanTree.set(path, { content, original: content });
      next.files = cleanTree;
      next.staged.clear();
    } else if (mode === "--mixed") {
      next.staged.clear();
    } else {
      // --soft: keep the working tree, stage the diff so a recommit works
      // (Panda's simplified --soft, mirroring the playground engine).
      stageDiffFrom(next, target);
    }
    const labels: Record<string, string> = { "--soft": "soft", "--mixed": "mixed", "--hard": "hard" };
    return {
      state: next,
      output: message(`HEAD is now at ${target} (${labels[mode] ?? "mixed"} reset)`, "success"),
    };
  }

  // ------------------------------------------------------------ git revert
  const revertMatch = trimmed.match(/^git revert(?:\s+(\S+))?$/);
  if (revertMatch) {
    const rev = revertMatch[1] ?? "HEAD";
    const target = resolveRev(next, rev);
    if (!target) {
      return { state, output: message(`fatal: bad revision '${rev}'`, "error") };
    }
    const reverted = next.commits.find((c) => c.hash === target);
    if (!reverted) {
      return { state, output: message(`fatal: bad revision '${rev}'`, "error") };
    }
    const changes = relocatableChanges(next, reverted, true);
    applyChangesToTree(next, changes);
    const revertMessage = `Revert "${reverted.message}"`;
    const commit = commitChangedFiles(next, revertMessage, changes, next.branch);
    return {
      state: next,
      output: message(
        `[${next.branch} ${commit.hash}] ${revertMessage}\nA new commit undoes the old change. History stays intact.`,
        "success",
      ),
    };
  }

  // ------------------------------------------------------------ git rebase
  const rebaseMatch = trimmed.match(/^git rebase\s+(\S+)$/);
  if (rebaseMatch) {
    const ontoRev = rebaseMatch[1]!;
    const onto = resolveRev(next, ontoRev);
    if (onto === null || onto === undefined) {
      return { state, output: message(`fatal: invalid upstream '${ontoRev}'`, "error") };
    }
    const branchHead = next.branches.get(next.branch);
    if (!branchHead) {
      return { state, output: message("fatal: no commits yet", "error") };
    }
    if (next.branch === ontoRev) {
      return { state, output: message(`Current branch ${next.branch} is up to date.`, "muted") };
    }
    const currentBranch = next.branch;
    const fork = commitsBetween(next, branchHead, onto);
    if (fork.length === 0) {
      return { state, output: message("Current branch is up to date.", "muted") };
    }
    let parentHash = onto;
    const replayMessages: string[] = [];
    for (const commit of fork) {
      const changes = relocatableChanges(next, commit, false);
      const hash = shortHash(commit.message, next.commits.length);
      const replayed: GitCommit = {
        hash,
        message: commit.message,
        files: changes.filter((c) => c.status !== "deleted").map((c) => c.path),
        parents: [parentHash],
        changedFiles: changes.map((c) => ({ ...c })),
        author: { ...commit.author },
        timestamp: commitTimestamp(next.commits.length),
      };
      next.commits.push(replayed);
      parentHash = hash;
      replayMessages.push(hash.slice(0, 7));
    }
    next.branches.set(currentBranch, parentHash);
    recordReflog(next, branchHead, parentHash, `rebase onto ${ontoRev}`);
    const oldHashes = new Set(fork.map((c) => c.hash));
    next.commits = next.commits.filter((c) => !oldHashes.has(c.hash));
    next.files = treeToFiles(commitTreeAt(next, parentHash));
    next.staged.clear();
    return {
      state: next,
      output: message(
        `Successfully rebased ${currentBranch} onto ${ontoRev}\nReplayed: ${replayMessages.join(", ")}\nYour branch now sits on top of ${ontoRev}.`,
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
    commits: state.commits.map((c) => ({
      ...c,
      files: [...c.files],
      parents: [...c.parents],
      changedFiles: c.changedFiles.map((f) => ({ ...f })),
    })),
    branches: new Map(state.branches),
    remotes: new Map(state.remotes),
    tags: new Map(state.tags),
    stash: state.stash.map((entry) => ({
      ...entry,
      files: new Map([...entry.files].map(([p, f]) => [p, { ...f }])),
    })),
    reflog: state.reflog.map((entry) => ({ ...entry })),
    remote: state.remote ? cloneState(state.remote) : undefined,
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

/* ------------------------------------------------------------------ */
/* Advanced command helpers (mirror src/lib/git/commands.ts)           */
/* ------------------------------------------------------------------ */

/** Record a HEAD movement in the reflog. */
function recordReflog(
  repo: GitState,
  from: string | null,
  to: string | null,
  message: string,
): void {
  repo.reflog.push({ from, to, message });
}

/** Commits reachable from `headHash`, oldest-first. */
function commitsFromHead(repo: GitState, headHash: string | null): GitCommit[] {
  if (!headHash) return [];
  const byHash = new Map(repo.commits.map((c) => [c.hash, c]));
  const ordered: GitCommit[] = [];
  const seen = new Set<string>();
  const stack: string[] = [];
  let current: string | undefined = headHash;
  while (current && !seen.has(current)) {
    stack.push(current);
    seen.add(current);
    const commit = byHash.get(current);
    current = commit?.parents[0];
  }
  for (const hash of stack.reverse()) {
    const commit = byHash.get(hash);
    if (commit) ordered.push(commit);
  }
  return ordered;
}

/** Commits reachable from `fromHash` but NOT from `baseHash`, oldest-first. */
function commitsBetween(
  repo: GitState,
  fromHash: string,
  baseHash: string,
): GitCommit[] {
  const all = commitsFromHead(repo, fromHash);
  return all.filter(
    (commit) => !isAncestor(repo.commits, commit.hash, baseHash),
  );
}

/**
 * Resolve a revision reference to a commit hash. Accepts `HEAD`, `HEAD~N`, a
 * branch name, a tag name, or a full commit hash.
 */
function resolveRev(repo: GitState, rev: string): string | null {
  if (rev === "HEAD") return repo.branches.get(repo.branch) || null;
  const tilde = rev.match(/^HEAD~(\d+)$/);
  if (tilde) {
    let current: string | null = repo.branches.get(repo.branch) ?? null;
    for (let i = 0; i < Number(tilde[1]); i++) {
      const commit = repo.commits.find((c) => c.hash === current);
      if (!commit || commit.parents.length === 0) return null;
      current = commit.parents[0] ?? null;
    }
    return current;
  }
  if (repo.branches.get(rev) !== undefined) return repo.branches.get(rev) || null;
  if (repo.tags.has(rev)) return repo.tags.get(rev) ?? null;
  if (repo.commits.some((c) => c.hash === rev)) return rev;
  return null;
}

/** Reconstruct the full file tree (path → content) at a given commit. */
function commitTreeAt(repo: GitState, hash: string | null): Map<string, string> {
  const tree = new Map<string, string>();
  if (!hash) return tree;
  for (const commit of commitsFromHead(repo, hash)) {
    for (const change of commit.changedFiles) {
      if (change.status === "deleted") tree.delete(change.path);
      else if (change.content !== undefined) tree.set(change.path, change.content);
    }
  }
  return tree;
}

/** Turn a path→content map into working-tree GitFile entries. */
function treeToFiles(tree: Map<string, string>): Map<string, GitFile> {
  const files = new Map<string, GitFile>();
  for (const [path, content] of tree) files.set(path, { content, original: content });
  return files;
}

/** Copy a commit's changes (optionally inverted) for revert / cherry-pick / rebase. */
function relocatableChanges(
  repo: GitState,
  commit: GitCommit,
  inverse: boolean,
): GitChangedFile[] {
  if (!inverse) return commit.changedFiles.map((c) => ({ ...c }));
  const parentTree = commitTreeAt(repo, commit.parents[0] ?? null);
  const inverseChanges: GitChangedFile[] = [];
  for (const change of commit.changedFiles) {
    if (change.status === "added") {
      inverseChanges.push({ path: change.path, status: "deleted" });
    } else if (change.status === "deleted") {
      inverseChanges.push({ path: change.path, status: "added", content: parentTree.get(change.path) });
    } else {
      const content = parentTree.get(change.path);
      inverseChanges.push({
        path: change.path,
        status: content === undefined ? "added" : "modified",
        content,
      });
    }
  }
  return inverseChanges;
}

/** Apply changed files to the working tree + index, returning staged paths. */
function applyChangesToTree(repo: GitState, changes: GitChangedFile[]): string[] {
  for (const change of changes) {
    if (change.status === "deleted") {
      repo.files.delete(change.path);
    } else if (change.content !== undefined) {
      repo.files.set(change.path, { content: change.content, original: change.content });
    }
    repo.staged.add(change.path);
  }
  return changes.map((c) => c.path);
}

/** Create a commit from explicit changed files, updating branch + working tree. */
function commitChangedFiles(
  repo: GitState,
  message: string,
  changedFiles: GitChangedFile[],
  branch: string,
): GitCommit {
  const parent = repo.branches.get(branch) ?? undefined;
  const hash = shortHash(message, repo.commits.length);
  const commit: GitCommit = {
    hash,
    message,
    files: changedFiles.filter((c) => c.status !== "deleted").map((c) => c.path),
    parents: parent ? [parent] : [],
    changedFiles: changedFiles.map((c) => ({ ...c })),
    author: { ...repo.author },
    timestamp: commitTimestamp(repo.commits.length),
  };
  repo.commits.push(commit);
  repo.branches.set(branch, hash);
  for (const change of changedFiles) {
    const file = repo.files.get(change.path);
    if (file && change.content !== undefined) file.original = change.content;
  }
  repo.staged.clear();
  recordReflog(repo, parent ?? null, hash, `commit: ${message}`);
  return commit;
}

/** Stage every path whose content differs from the tree at `targetHash`. */
function stageDiffFrom(repo: GitState, targetHash: string): void {
  const targetTree = commitTreeAt(repo, targetHash);
  for (const path of new Set([...repo.files.keys(), ...targetTree.keys()])) {
    const working = repo.files.get(path)?.content;
    const target = targetTree.get(path);
    if (working !== target) repo.staged.add(path);
  }
}

/** Whether a path is tracked by any commit reachable from HEAD. */
function wasTrackedIn(repo: GitState, path: string): boolean {
  return commitsFromHead(repo, repo.branches.get(repo.branch) ?? null).some((c) =>
    c.changedFiles.some((f) => f.path === path && f.status !== "deleted"),
  );
}

/** Tracked paths (by a reachable commit) currently absent from the working tree. */
function trackedDeletedPaths(repo: GitState): string[] {
  const tracked = new Set<string>();
  for (const commit of commitsFromHead(repo, repo.branches.get(repo.branch) ?? null)) {
    for (const change of commit.changedFiles) {
      if (change.status !== "deleted") tracked.add(change.path);
    }
  }
  return [...tracked].filter((path) => !repo.files.has(path));
}

/** Minimal `.gitignore` support (mirrors repository.ts). */
function isIgnored(repo: GitState, path: string): boolean {
  const ignoreFile = repo.files.get(".gitignore");
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
  }
  return false;
}
