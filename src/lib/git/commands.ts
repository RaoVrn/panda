/**
 * Git State Engine — command execution (Phase 1).
 *
 * `runCommand` takes a repository and a raw command line, and returns a NEW
 * repository plus the events it emitted. Commands never mutate their input.
 *
 * Phase 1: init · status · add · restore · commit · log · diff
 * (push/pull/merge/rebase land in later phases — the model already holds the
 * state they will fill.)
 */

import { createEvent } from "./events";
import {
  cloneRepository,
  deleteFromWorkingTree,
  isIgnored,
  shortHash,
  stagePath,
  statusRows,
  unstagePath,
  writeWorkingTree,
  type CreateRepositoryOptions,
} from "./repository";
import type {
  GitChangedFile,
  GitCommandOutput,
  GitCommandResult,
  GitRepository,
} from "./types";

function ok(text: string, kind: GitCommandOutput["kind"] = "output"): GitCommandOutput {
  return { text, kind };
}

function notARepo(): GitCommandOutput {
  return ok(
    "fatal: not a git repository (or any of the parent directories): .git",
    "error",
  );
}

/** Parse `echo "text" > file` / `>> file`. Text may span lines. */
function parseEcho(raw: string): { text: string; file: string; append: boolean } | null {
  const match = raw.match(/^echo\s+(?:(["'])([\s\S]*?)\1|(\S+))\s*(>>|>)\s*(\S+)$/);
  if (!match) return null;
  return { text: match[2] ?? match[3] ?? "", file: match[5]!, append: match[4] === ">>" };
}

function parseAddArgs(sub: string): string[] | null {
  if (sub === "add ." || sub === "add -A" || sub === "add -a") return ["."];
  const match = sub.match(/^add\s+(.+)$/);
  return match ? match[1]!.trim().split(/\s+/) : null;
}

function parseCommitMessage(raw: string): string | null {
  const quoted = raw.match(/^git commit\s+(?:-m\s+)?(["'])((?:\\.|(?!\1)[\s\S])*)\1$/);
  if (quoted) return quoted[2]!.replace(/\\(["'\\])/g, "$1");
  const bare = raw.match(/^git commit\s+(?:-m\s+)?(\S+)$/);
  return bare ? bare[1]! : null;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Run one command against `repo`. Returns the new state, the events emitted
 * and the human-readable output. Never mutates `repo`.
 */
export function runCommand(repo: GitRepository, raw: string): GitCommandResult {
  const trimmed = raw.trim();
  const cmd = trimmed.split(/\s+/)[0] ?? "";
  const events: GitCommandResult["events"] = [];

  if (cmd === "") return { state: repo, events, output: ok("") };
  if (cmd === "pwd") return { state: repo, events, output: ok(repo.pwd) };
  if (cmd === "ls") {
    const names = [...repo.workingTree.keys()].sort();
    return { state: repo, events, output: ok(names.join("  ") || "(empty)") };
  }
  if (cmd === "clear") {
    return { state: repo, events, output: ok("", "muted") };
  }
  if (cmd === "touch") {
    const path = trimmed.slice(6).trim();
    if (!path) return { state: repo, events, output: ok("touch: missing file operand", "error") };
    const next = cloneRepository(repo);
    const existing = next.workingTree.get(path);
    writeWorkingTree(next, path, existing?.content ?? "");
    events.push(createEvent(existing ? "FILE_MODIFIED" : "FILE_ADDED", path));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: next, events, output: ok(existing ? `touch: ${path} updated` : `created ${path}`, "success") };
  }
  if (cmd === "rm") {
    const path = trimmed.slice(3).trim();
    if (!path) return { state: repo, events, output: ok("rm: missing operand", "error") };
    const next = cloneRepository(repo);
    if (!next.workingTree.has(path)) {
      return { state: repo, events, output: ok(`rm: cannot remove '${path}': No such file or directory`, "error") };
    }
    deleteFromWorkingTree(next, path);
    events.push(createEvent("FILE_DELETED", path));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: next, events, output: ok(`removed ${path}`, "success") };
  }
  if (cmd === "mv") {
    const match = trimmed.match(/^mv\s+(\S+)\s+(\S+)$/);
    if (!match) {
      return { state: repo, events, output: ok("usage: mv <source> <destination>", "error") };
    }
    const from = match[1]!;
    const to = match[2]!;
    const next = cloneRepository(repo);
    const file = next.workingTree.get(from);
    if (!file) {
      return { state: repo, events, output: ok(`mv: cannot stat '${from}': No such file or directory`, "error") };
    }
    if (next.workingTree.has(to)) {
      return { state: repo, events, output: ok(`mv: '${to}': destination exists`, "error") };
    }
    deleteFromWorkingTree(next, from);
    if (next.index.has(from)) {
      next.index.delete(from);
      next.index.add(to);
    }
    writeWorkingTree(next, to, file.content);
    events.push(createEvent("FILE_DELETED", from));
    events.push(createEvent("FILE_ADDED", to));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: next, events, output: ok(`${from} → ${to}`, "success") };
  }
  if (cmd === "help") {
    return {
      state: repo,
      events,
      output: ok(
        [
          "Panda Git Simulator — phase 1 commands:",
          "  git init                  create the repository",
          "  git status                show working tree + staging state",
          "  git add <file|.>          stage files",
          "  git restore <file>        discard unstaged changes",
          "  git restore --staged <f>  unstage",
          '  git commit -m "msg"       create a snapshot',
          "  git log [--oneline]       show history",
          "  git diff [--staged]       show changes",
          '  echo "hi" > file          write a file',
          "  touch <file>              create/update a file",
          "  rm <file> · mv <a> <b>    delete or rename a file",
          "  pwd · ls · cat <file> · clear · help",
        ].join("\n"),
        "muted",
      ),
    };
  }

  // Shell: cat + echo (files are how learners build the working tree).
  if (cmd === "cat") {
    const path = trimmed.slice(4).trim();
    const file = repo.workingTree.get(path);
    return { state: repo, events, output: file ? ok(file.content) : ok(`cat: ${path}: No such file or directory`, "error") };
  }
  if (!trimmed.startsWith("git ")) {
    const echo = parseEcho(trimmed);
    if (echo) {
      const next = cloneRepository(repo);
      const existing = next.workingTree.get(echo.file);
      const content = echo.append ? (existing?.content ?? "") + echo.text + "\n" : echo.text + "\n";
      writeWorkingTree(next, echo.file, content);
      events.push(createEvent(existing ? "FILE_MODIFIED" : "FILE_ADDED", echo.file));
      events.push(createEvent("STATUS_CHANGED"));
      return { state: next, events, output: ok(echo.append ? `${echo.file} updated` : `wrote ${echo.file}`, "success") };
    }
    return { state: repo, events, output: ok(`panda: command not found: ${cmd}\nType 'help' for available commands.`, "error") };
  }

  const sub = trimmed.slice(4).trim();
  const next = cloneRepository(repo);

  // ------------------------------------------------------------ git init
  if (sub === "init") {
    if (next.initialized) {
      return { state: repo, events, output: ok(`Reinitialized existing Git repository in ${next.pwd}/.git/`, "success") };
    }
    next.initialized = true;
    events.push(createEvent("REPOSITORY_INITIALIZED"));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: next, events, output: ok(`Initialized empty Git repository in ${next.pwd}/.git/`, "success") };
  }

  if (!next.initialized) return { state: repo, events, output: notARepo() };

  // ---------------------------------------------------------- git status
  if (sub === "status") {
    return { state: repo, events, output: ok(renderStatus(next), "muted") };
  }

  // ------------------------------------------------------------- git add
  const addArgs = parseAddArgs(sub);
  if (addArgs !== null) {
    const targets = addArgs.includes(".")
      ? [...new Set([...next.workingTree.keys(), ...trackedDeletedPaths(next)])].filter(
          (path) => !isIgnored(next, path),
        )
      : addArgs;
    const staged: string[] = [];
    for (const target of targets) {
      if (isIgnored(next, target) && !wasTrackedIn(next, target)) {
        if (addArgs.includes(".")) continue;
        return {
          state: repo,
          events,
          output: ok(
            `The following paths are ignored by one of your .gitignore files:\n${target}`,
            "error",
          ),
        };
      }
      const exists = next.workingTree.has(target);
      const isTrackedDeletion = !exists && wasTrackedIn(next, target);
      if (!exists && !isTrackedDeletion) {
        return { state: repo, events, output: ok(`fatal: pathspec '${target}' did not match any files`, "error") };
      }
      if (exists || isTrackedDeletion) {
        stagePath(next, target);
        staged.push(target);
        events.push(createEvent("FILE_STAGED", target));
      }
    }
    events.push(createEvent("STATUS_CHANGED"));
    if (staged.length === 0) {
      return { state: next, events, output: ok("Nothing to add. The working tree has no changes.", "muted") };
    }
    const noun = staged.length === 1 ? `${staged[0]} is` : `${staged.length} files are`;
    return { state: next, events, output: ok(`${noun} now staged and ready for their snapshot.`, "success") };
  }

  // ------------------------------------------------- git restore / unstage
  const restoreStaged = trimmed.match(/^git restore --staged\s+(\S+)$/);
  if (restoreStaged) {
    const path = restoreStaged[1]!;
    if (!next.index.has(path)) {
      return { state: repo, events, output: ok(`no changes staged for '${path}'`, "muted") };
    }
    unstagePath(next, path);
    events.push(createEvent("FILE_UNSTAGED", path));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: next, events, output: ok(`Unstaged '${path}'`, "success") };
  }
  const restoreMatch = trimmed.match(/^git restore\s+(\S+)$/);
  if (restoreMatch) {
    const path = restoreMatch[1]!;
    const file = next.workingTree.get(path);
    if (!file || file.original === undefined) {
      return { state: repo, events, output: ok(`fatal: '${path}' is not tracked`, "error") };
    }
    next.workingTree.set(path, { ...file, content: file.original });
    events.push(createEvent("FILE_RESTORED", path));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: next, events, output: ok(`Restored '${path}' from the last snapshot`, "success") };
  }

  // ------------------------------------------------------------ git commit
  const commitMessage = parseCommitMessage(trimmed);
  if (commitMessage !== null) {
    if (next.index.size === 0) {
      return { state: repo, events, output: ok("nothing to commit, working tree clean", "muted") };
    }
    const changed: GitChangedFile[] = [];
    for (const path of [...next.index].sort()) {
      const file = next.workingTree.get(path);
      if (!file) {
        changed.push({ path, status: "deleted" });
      } else {
        changed.push({ path, status: file.original === undefined ? "added" : "modified" });
        file.original = file.content;
      }
    }
    const timestamp = Date.now();
    const hash = shortHash(commitMessage, next.commits.length);
    next.commits.push({
      id: `commit-${hash}`,
      hash,
      message: commitMessage,
      author: { ...next.author },
      timestamp,
      parents: next.head ? [next.head] : [],
      branch: next.branch,
      changedFiles: changed,
    });
    next.head = hash;
    next.branches.set(next.branch, hash);
    next.index.clear();
    events.push(createEvent("COMMIT_CREATED", undefined, { hash, message: commitMessage }));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash }));
    events.push(createEvent("STATUS_CHANGED"));
    const root = next.commits.length === 1;
    const noun = changed.length === 1 ? "1 file changed" : `${changed.length} files changed`;
    return {
      state: next,
      events,
      output: ok(`[${next.branch}${root ? " (root-commit)" : ""} ${hash}] ${commitMessage}\n ${noun}`, "success"),
    };
  }

  // --------------------------------------------------------------- git log
  if (sub === "log" || sub === "log --oneline") {
    if (next.commits.length === 0) {
      return { state: repo, events, output: ok(`fatal: your current branch '${next.branch}' does not have any commits yet`, "error") };
    }
    const oneline = sub === "log --oneline";
    const lines: string[] = [];
    for (const commit of [...next.commits].reverse()) {
      const isHead = commit.hash === next.head;
      if (oneline) {
        lines.push(`${commit.hash}${isHead ? ` (HEAD -> ${next.branch})` : ""} ${commit.message}`);
      } else {
        lines.push(
          `commit ${commit.hash}`,
          `Author: ${commit.author.name} <${commit.author.email}>`,
          `Date:   ${formatDate(commit.timestamp)}`,
          "",
          `    ${commit.message}`,
          "",
        );
      }
    }
    return { state: repo, events, output: ok(lines.join("\n")) };
  }

  // --------------------------------------------------------------- git diff
  if (sub === "diff" || sub === "diff --staged" || sub === "diff --cached") {
    const stagedOnly = sub !== "diff";
    const out: string[] = [];
    for (const row of statusRows(next)) {
      const relevant = stagedOnly
        ? row.staged
        : row.state === "modified" || row.state === "deleted";
      if (!relevant) continue;
      const file = row.file;
      const original = file?.original ?? "";
      out.push(`diff --git a/${row.path} b/${row.path}`);
      out.push(`--- a/${row.path}`);
      out.push(`+++ b/${row.path}`);
      if (row.deleted) {
        out.push("@@ -1 +0,0 @@");
        out.push(`-${original.replace(/\n$/, "")}`);
      } else if (file) {
        const a = original.split("\n");
        const b = file.content.split("\n");
        const max = Math.max(a.length, b.length);
        for (let i = 0; i < max; i++) {
          if (a[i] === b[i]) continue;
          let end = i;
          while (end + 1 < max && a[end + 1] !== b[end + 1]) end++;
          out.push(`@@ -${i + 1},${end - i + 1} +${i + 1},${end - i + 1} @@`);
          for (let j = i; j <= end; j++) {
            if (a[j] !== undefined && a[j] !== b[j]) out.push("-" + a[j]);
            if (b[j] !== undefined && a[j] !== b[j]) out.push("+" + b[j]);
          }
          i = end;
        }
      }
    }
    if (out.length === 0) {
      return { state: repo, events, output: ok(stagedOnly ? "nothing staged to commit" : "no changes", "muted") };
    }
    return { state: repo, events, output: ok(out.join("\n"), "muted") };
  }

  return {
    state: repo,
    events,
    output: ok(`panda: unknown git command '${sub}'\nType 'help' for available commands.`, "error"),
  };
}

/** Paths that are tracked but currently absent from the working tree. */
function trackedDeletedPaths(repo: GitRepository): string[] {
  const tracked = new Set<string>();
  for (const commit of repo.commits) {
    for (const change of commit.changedFiles) {
      if (change.status !== "deleted") tracked.add(change.path);
    }
  }
  return [...tracked].filter((path) => !repo.workingTree.has(path));
}

function wasTrackedIn(repo: GitRepository, path: string): boolean {
  return trackedDeletedPaths(repo).includes(path);
}

function renderStatus(repo: GitRepository): string {
  const rows = statusRows(repo);
  const lines: string[] = [`On branch ${repo.branch}`];
  if (repo.commits.length === 0) lines.push("", "No commits yet");

  const staged = rows.filter((row) => row.staged);
  const unstaged = rows.filter((row) => !row.staged && (row.modified || row.deleted));
  const untracked = rows.filter((row) => row.untracked && !isIgnored(repo, row.path));

  if (staged.length > 0) {
    lines.push("", "Changes to be committed:", '  (use "git restore --staged <file>..." to unstage)');
    for (const row of staged) {
      const label = row.state === "staged-deleted" ? "deleted" : row.state === "staged-modified" ? "modified" : row.tracked ? "modified" : "new file";
      lines.push(`\t${label}:   ${row.path}`);
    }
  }
  if (unstaged.length > 0) {
    lines.push("", "Changes not staged for commit:");
    for (const row of unstaged) {
      lines.push(`\t${row.deleted ? "deleted" : "modified"}:   ${row.path}`);
    }
  }
  if (untracked.length > 0) {
    lines.push("", "Untracked files:", '  (use "git add <file>..." to include in what will be committed)');
    for (const row of untracked) lines.push(`\t${row.path}`);
  }
  if (staged.length + unstaged.length + untracked.length === 0) {
    lines.push("", "nothing to commit, working tree clean");
  }
  return lines.join("\n");
}

export type { CreateRepositoryOptions };
