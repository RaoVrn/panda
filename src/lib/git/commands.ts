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
  makeCommitId,
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
  GitCommit,
  GitFileEntry,
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
 * Run one command against `repo` (and its `remote`, when provided). Returns the
 * new state(s), the events emitted and the human-readable output. Never mutates
 * its inputs.
 */
export function runCommand(
  repo: GitRepository,
  raw: string,
  remote?: GitRepository,
): GitCommandResult {
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
          "Panda Git Simulator. Phase 1 commands:",
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

  // ------------------------------------------------------- git config
  const configList = /^git config(?: --global)? --list$/;
  if (configList.test(trimmed)) {
    const lines = [`user.name=${next.author.name}`, `user.email=${next.author.email}`];
    return { state: repo, events, output: ok(lines.join("\n"), "output") };
  }
  const configSetName = trimmed.match(/^git config(?: --global)? user\.name\s+["'](.+)["']$/);
  if (configSetName) {
    const name = configSetName[1]!;
    if (!name.trim()) return { state: repo, events, output: ok("fatal: empty value", "error") };
    const n = cloneRepository(repo);
    n.author = { ...n.author, name: name.trim() };
    return { state: n, events, output: ok("", "success") };
  }
  const configSetEmail = trimmed.match(/^git config(?: --global)? user\.email\s+["'](.+)["']$/);
  if (configSetEmail) {
    const email = configSetEmail[1]!;
    if (!email.trim()) return { state: repo, events, output: ok("fatal: empty value", "error") };
    const n = cloneRepository(repo);
    n.author = { ...n.author, email: email.trim() };
    return { state: n, events, output: ok("", "success") };
  }
  const configGet = trimmed.match(/^git config(?: --global)? user\.(name|email)$/);
  if (configGet) {
    const value = configGet[1] === "name" ? next.author.name : next.author.email;
    return { state: repo, events, output: ok(value, "output") };
  }

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
        changed.push({
          path,
          status: file.original === undefined ? "added" : "modified",
          content: file.content,
        });
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
    recordReflog(next, next.head, hash, `commit: ${commitMessage}`);
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
  const logMatch = trimmed.match(/^git log(?:\s+(--oneline))?(?:\s+([\w/.-]+))?$/);
  if (logMatch) {
    const oneline = logMatch[1] === "--oneline";
    const target = logMatch[2] ? resolveRev(next, logMatch[2]!) : next.head;
    if (target === undefined || target === null) {
      return { state: repo, events, output: ok(`fatal: ambiguous argument '${logMatch[2]}': unknown revision`, "error") };
    }
    if (next.commits.length === 0) {
      return { state: repo, events, output: ok(`fatal: your current branch '${next.branch}' does not have any commits yet`, "error") };
    }
    const lines: string[] = [];
    const visible = [...commitsFromHead(next, target)].reverse();
    for (const commit of visible) {
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

  // ---------------------------------------------------------- git branch
  if (sub === "branch") {
    const lines = [...next.branches.keys()].map((b) =>
      b === next.branch ? `* ${b}` : `  ${b}`,
    );
    if (lines.length === 0) lines.push("(no branches)");
    return { state: repo, events, output: ok(lines.join("\n"), "output") };
  }
  const branchCreate = trimmed.match(/^git branch\s+([\w/.-]+)$/);
  if (branchCreate) {
    const name = branchCreate[1]!;
    if (next.branches.has(name)) {
      return { state: repo, events, output: ok(`fatal: a branch named '${name}' already exists`, "error") };
    }
    const base = next.branches.get(next.branch) ?? next.head ?? "";
    next.branches.set(name, base);
    events.push(createEvent("BRANCH_CHANGED"));
    return { state: next, events, output: ok(`Created branch '${name}'`, "success") };
  }

  // -------------------------------------------------------- git switch
  const switchCreate = trimmed.match(/^git switch -c\s+([\w/.-]+)$/);
  if (switchCreate) {
    const name = switchCreate[1]!;
    if (next.branches.has(name)) {
      return { state: repo, events, output: ok(`fatal: a branch named '${name}' already exists`, "error") };
    }
    const base = next.branches.get(next.branch) ?? next.head ?? "";
    next.branches.set(name, base);
    recordReflog(next, next.head, base || null, `switch: creating branch '${name}'`);
    next.branch = name;
    next.detached = false;
    next.head = base || null;
    restoreWorkingTreeForBranch(next, name);
    events.push(createEvent("BRANCH_CHANGED"));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: base || undefined }));
    return { state: next, events, output: ok(`Switched to a new branch '${name}'`, "success") };
  }
  const switchMatch = trimmed.match(/^git switch\s+([\w/.-]+)$/);
  if (switchMatch) {
    const name = switchMatch[1]!;
    if (!next.branches.has(name)) {
      return { state: repo, events, output: ok(`fatal: invalid reference: ${name}`, "error") };
    }
    const target = next.branches.get(name) ?? next.head;
    recordReflog(next, next.head, target, `switch: moving to ${name}`);
    next.branch = name;
    next.detached = false;
    next.head = target;
    restoreWorkingTreeForBranch(next, name);
    events.push(createEvent("BRANCH_CHANGED"));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: target ?? undefined }));
    return { state: next, events, output: ok(`Switched to branch '${name}'`, "success") };
  }

  // ------------------------------------------------------- git checkout
  const checkoutMatch = trimmed.match(/^git checkout\s+([\w/.-]+)$/);
  if (checkoutMatch) {
    const name = checkoutMatch[1]!;
    if (next.branches.has(name)) {
      const target = next.branches.get(name) ?? next.head;
      recordReflog(next, next.head, target, `checkout: moving to ${name}`);
      next.branch = name;
      next.detached = false;
      next.head = target;
      restoreWorkingTreeForBranch(next, name);
      events.push(createEvent("BRANCH_CHANGED"));
      events.push(createEvent("HEAD_CHANGED", undefined, { hash: target ?? undefined }));
      return { state: next, events, output: ok(`Switched to branch '${name}'`, "success") };
    }
    // Not a branch name. If it matches a tag, check out that version (detached).
    if (next.tags.has(name)) {
      const tagHash = next.tags.get(name)!;
      recordReflog(next, next.head, tagHash, `checkout: moving to ${name}`);
      next.branch = "HEAD";
      next.detached = true;
      next.head = tagHash;
      restoreWorkingTreeAt(next, tagHash);
      events.push(createEvent("HEAD_CHANGED", undefined, { hash: tagHash }));
      return { state: next, events, output: ok(`HEAD is now at ${name}`, "success") };
    }
    // Not a branch name. If it matches a commit hash, enter detached HEAD.
    const commit = next.commits.find((c) => c.hash === name);
    if (commit) {
      recordReflog(next, next.head, commit.hash, `checkout: moving to ${name}`);
      next.branch = "HEAD";
      next.detached = true;
      next.head = commit.hash;
      restoreWorkingTreeAt(next, commit.hash);
      events.push(createEvent("HEAD_CHANGED", undefined, { hash: commit.hash }));
      return { state: next, events, output: ok(`HEAD is now at ${name}`, "success") };
    }
    return { state: repo, events, output: ok(`error: pathspec '${name}' did not match any branch`, "error") };
  }

  // ---------------------------------------------------------- git merge
  const mergeMatch = trimmed.match(/^git merge\s+([\w/.-]+)$/);
  if (mergeMatch) {
    const name = mergeMatch[1]!;
    if (name === next.branch || !next.branches.has(name)) {
      return { state: repo, events, output: ok(`Already up to date.`, "muted") };
    }
    const headHash = next.branches.get(next.branch) ?? next.head ?? "";
    const targetHash = next.branches.get(name) ?? "";
    if (headHash && targetHash && isAncestor(next.commits, headHash, targetHash)) {
      next.branches.set(next.branch, targetHash);
      recordReflog(next, next.head, targetHash, `merge ${name}: fast-forward`);
      next.head = targetHash;
      events.push(createEvent("COMMIT_CREATED", undefined, { hash: targetHash, message: "Fast-forward" }));
      events.push(createEvent("HEAD_CHANGED", undefined, { hash: targetHash }));
      return { state: next, events, output: ok(`Updating ${headHash.slice(0, 7)}..${targetHash.slice(0, 7)}\nFast-forward`, "success") };
    }
    return { state: repo, events, output: ok(`merge: can't merge '${name}' yet in this exercise`, "error") };
  }

  // ------------------------------------------------------- git branch -d
  const branchDelete = trimmed.match(/^git branch -d\s+([\w/.-]+)$/);
  if (branchDelete) {
    const name = branchDelete[1]!;
    if (!next.branches.has(name)) {
      return { state: repo, events, output: ok(`error: branch '${name}' not found`, "error") };
    }
    if (name === next.branch) {
      return { state: repo, events, output: ok(`error: cannot delete branch '${name}' checked out at '${name}'`, "error") };
    }
    const headHash = next.branches.get(name) ?? "";
    // The reflog keeps the branch's commits reachable, so the branch can be
    // recovered even after deletion.
    next.branches.delete(name);
    recordReflog(next, next.head, next.head, `branch -d ${name}`);
    events.push(createEvent("BRANCH_CHANGED"));
    return { state: next, events, output: ok(`Deleted branch ${name} (was ${headHash.slice(0, 7)})`, "success") };
  }

  // ----------------------------------------------------------- git show
  const showMatch = trimmed.match(/^git show(?:\s+(\S+))?$/);
  if (showMatch) {
    const target = showMatch[1] ?? next.head ?? "";
    const commit = next.commits.find((c) => c.hash === target);
    if (!commit) {
      return { state: repo, events, output: ok(`fatal: ambiguous argument '${target || "HEAD"}': unknown revision`, "error") };
    }
    const lines: string[] = [
      `commit ${commit.hash}`,
      `Author: ${commit.author.name} <${commit.author.email}>`,
      `Date:   ${new Date(commit.timestamp).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`,
      "",
      `    ${commit.message}`,
      "",
    ];
    if (commit.changedFiles.length > 0) {
      lines.push(...commit.changedFiles.map((f) => ` ${f.status === "added" ? "A" : f.status === "deleted" ? "D" : "M"}  ${f.path}`));
    }
    return { state: repo, events, output: ok(lines.join("\n"), "output") };
  }

  // ---------------------------------------------------------- git blame
  const blameMatch = trimmed.match(/^git blame(?:\s+(\S+))?$/);
  if (blameMatch) {
    const path = blameMatch[1] ?? "";
    if (!path) return { state: repo, events, output: ok("usage: git blame <file>", "error") };
    const file = next.workingTree.get(path);
    if (!file) {
      return { state: repo, events, output: ok(`fatal: cannot stat path '${path}': No such file or directory`, "error") };
    }
    const content = file.content;
    if (!content.trim()) return { state: repo, events, output: ok("(empty file)", "muted") };
    // Find the last commit that touched this file.
    const touching = next.commits.filter((c) =>
      c.changedFiles.some((f) => f.path === path && f.status !== "deleted"),
    );
    const last = touching[touching.length - 1];
    const headHash = last?.hash.slice(0, 7) ?? "0000000";
    const author = last?.author.name ?? "Unknown";
    const lines = content.split("\n").filter((l) => l !== "");
    return {
      state: repo,
      events,
      output: ok(
        lines
          .map((line) => `${headHash} (${author} ${new Date(last?.timestamp ?? Date.now()).toLocaleDateString()}) ${line}`)
          .join("\n"),
        "muted",
      ),
    };
  }

  // ---------------------------------------------------------- git reflog
  if (sub === "reflog") {
    if (next.reflog.length === 0) return { state: repo, events, output: ok("(no reflog entries)", "muted") };
    const lines = [...next.reflog].reverse().map((entry, i) => {
      const to = entry.to?.slice(0, 7) ?? "0000000";
      return `${to} HEAD@{${next.reflog.length - 1 - i}}: ${entry.message}`;
    });
    return { state: repo, events, output: ok(lines.join("\n"), "output") };
  }

  // ---------------------------------------------------------- git remote
  if (sub === "remote") {
    const names = [...next.remotes.keys()];
    if (names.length === 0) return { state: repo, events, output: ok("(no remotes configured)", "muted") };
    return { state: repo, events, output: ok(names.join("\n"), "output") };
  }
  if (sub === "remote -v") {
    const lines = [...next.remotes.entries()].map(
      ([name, url]) => `${name}\t${url} (fetch)\n${name}\t${url} (push)`,
    );
    return { state: repo, events, output: ok(lines.join("\n") || "(no remotes configured)", "muted") };
  }
  const remoteAdd = trimmed.match(/^git remote add\s+(\S+)\s+(\S+)$/);
  if (remoteAdd) {
    const name = remoteAdd[1]!;
    const url = remoteAdd[2]!;
    if (next.remotes.has(name)) {
      return { state: repo, events, output: ok(`error: remote ${name} already exists`, "error") };
    }
    next.remotes.set(name, url);
    return { state: next, events, output: ok(`Added remote ${name} at ${url}`, "success") };
  }
  const remoteRename = trimmed.match(/^git remote rename\s+(\S+)\s+(\S+)$/);
  if (remoteRename) {
    const from = remoteRename[1]!;
    const to = remoteRename[2]!;
    if (!next.remotes.has(from)) {
      return { state: repo, events, output: ok(`error: no such remote: '${from}'`, "error") };
    }
    if (next.remotes.has(to)) {
      return { state: repo, events, output: ok(`error: remote ${to} already exists`, "error") };
    }
    const url = next.remotes.get(from)!;
    next.remotes.delete(from);
    next.remotes.set(to, url);
    return { state: next, events, output: ok(`Renamed remote ${from} to ${to}`, "success") };
  }
  const remoteRemove = trimmed.match(/^git remote remove\s+(\S+)$/);
  if (remoteRemove) {
    const name = remoteRemove[1]!;
    if (!next.remotes.has(name)) {
      return { state: repo, events, output: ok(`error: no such remote: '${name}'`, "error") };
    }
    next.remotes.delete(name);
    return { state: next, events, output: ok(`Removed remote ${name}`, "success") };
  }

  // ---------------------------------------------------------- git clone
  const cloneMatch = trimmed.match(/^git clone\s+(\S+)(?:\s+(\S+))?$/);
  if (cloneMatch) {
    if (!remote) {
      return { state: repo, events, output: ok(`fatal: could not clone '${cloneMatch[1]}'`, "error") };
    }
    const cloned = cloneRepository(remote);
    cloned.pwd = cloneMatch[2] ?? "~/project";
    cloned.initialized = true;
    // A clone sets up the remote automatically, named origin.
    if (cloneMatch[1] && !cloned.remotes.has("origin")) {
      cloned.remotes.set("origin", cloneMatch[1]);
    }
    events.push(createEvent("REPOSITORY_INITIALIZED"));
    events.push(createEvent("STATUS_CHANGED"));
    return { state: cloned, events, output: ok(`Cloning into '${cloneMatch[2] ?? "project"}'...\nDone.`, "success") };
  }

  // ---------------------------------------------------------- git fetch
  if (sub === "fetch") {
    if (!remote) return { state: repo, events, output: ok("fatal: no remote repository configured", "error") };
    const remoteHead = remote.branches.get(remote.branch) ?? remote.head;
    if (!remoteHead) return { state: repo, events, output: ok("Everything up-to-date", "muted") };
    const localHead = next.branches.get(next.branch) ?? next.head;
    if (remoteHead === localHead) return { state: repo, events, output: ok("Everything up-to-date", "muted") };
    const remoteOnly = remote.commits.filter(
      (c) => !next.commits.some((l) => l.hash === c.hash),
    );
    if (remoteOnly.length === 0) return { state: repo, events, output: ok("Everything up-to-date", "muted") };
    // Fetch is read-only: it reports what's available without touching local work.
    return {
      state: repo,
      events,
      output: ok(
        `Remote has ${remoteOnly.length} new commit${remoteOnly.length === 1 ? "" : "s"} (${remoteOnly.map((c) => c.hash.slice(0, 7)).join(", ")}).\nYour work is untouched. Run git pull to bring them in.`,
        "success",
      ),
    };
  }

  // ---------------------------------------------------------- git pull
  if (sub === "pull") {
    if (!remote) return { state: repo, events, output: ok("fatal: no remote repository configured", "error") };
    const remoteHead = remote.branches.get(remote.branch) ?? remote.head;
    if (!remoteHead) return { state: repo, events, output: ok("Everything up-to-date", "muted") };
    const localHead = next.branches.get(next.branch) ?? next.head;
    if (remoteHead === localHead) return { state: repo, events, output: ok("Already up to date.", "muted") };

    const remoteOnly = remote.commits.filter(
      (c) => !next.commits.some((l) => l.hash === c.hash),
    );
    if (remoteOnly.length === 0) return { state: repo, events, output: ok("Already up to date.", "muted") };
    next.commits.push(...remoteOnly.map((c) => ({ ...c })));
    next.branches.set(next.branch, remoteHead);
    recordReflog(next, next.head, remoteHead, `pull: fast-forward`);
    next.head = remoteHead;
    // Restore the working tree to the new head.
    const branchFiles = commitsFromHead(next, remoteHead);
    const tree = new Map<string, (typeof repo.workingTree extends Map<string, infer T> ? T : never)>();
    for (const commit of branchFiles) {
      for (const change of commit.changedFiles) {
        if (change.status === "deleted") tree.delete(change.path);
        else if (change.content !== undefined) {
          tree.set(change.path, {
            id: change.path,
            name: change.path.split("/").pop() ?? change.path,
            path: change.path,
            content: change.content,
            original: change.content,
          });
        }
      }
    }
    if (tree.size === 0) {
      for (const [path, entry] of remote.workingTree) {
        tree.set(path, {
          id: path,
          name: path.split("/").pop() ?? path,
          path,
          content: entry.content,
          original: entry.original,
        });
      }
    }
    next.workingTree = tree;
    events.push(createEvent("COMMIT_CREATED", undefined, { hash: remoteHead, message: "Pull" }));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: remoteHead }));
    return { state: next, events, output: ok(`Updating ${(localHead ?? "").slice(0, 7)}..${remoteHead.slice(0, 7)}\nFast-forward`, "success") };
  }

  // ---------------------------------------------------------- git push
  if (sub === "push") {
    if (!remote) return { state: repo, events, output: ok("fatal: no remote repository configured", "error") };
    const localHead = next.branches.get(next.branch) ?? next.head;
    if (!localHead) return { state: repo, events, output: ok("Everything up-to-date", "muted") };

    const remoteHead = remote.branches.get(remote.branch) ?? remote.head;
    // Non-fast-forward: remote has commits we don't have. Reject.
    if (remoteHead && remoteHead !== localHead && !isAncestor(next.commits, remoteHead, localHead)) {
      return {
        state: repo,
        events,
        output: ok(
          `! [rejected] ${next.branch} -> ${next.branch} (non-fast-forward)\nerror: failed to push some refs to the remote\nhint: the remote has commits you don't have. Pull first, then push.`,
          "error",
        ),
      };
    }
    const localOnly = next.commits.filter(
      (c) => !remote.commits.some((r) => r.hash === c.hash),
    );
    const nextRemote = cloneRepository(remote);
    nextRemote.commits.push(...localOnly.map((c) => ({ ...c })));
    // The pushed branch on the remote now points at the local head.
    nextRemote.branches.set(next.branch, localHead);
    // If the remote's default branch is unborn (""), adopt the pushed one.
    if (!nextRemote.branches.get(remote.branch)) {
      nextRemote.branches.set(remote.branch, localHead);
    }
    nextRemote.head = localHead;
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      remote: nextRemote,
      events,
      output: ok(
        localOnly.length === 0
          ? "Everything up-to-date"
          : `To the remote\n   ${(remoteHead ?? "").slice(0, 7)}..${localHead.slice(0, 7)}  ${next.branch} -> ${next.branch}\n  ${localOnly.length} commit${localOnly.length === 1 ? "" : "s"} pushed.`,
        "success",
      ),
    };
  }

  // ------------------------------------------------------------- git stash
  if (sub === "stash" || sub === "stash push" || /^git stash push\s+-m\s+/.test(trimmed)) {
    const messageMatch = trimmed.match(/^git stash(?: push)?(?:\s+-m\s+["']?([^"']+)["']?)?/);
    const dirtyPaths = statusRows(next)
      .filter((row) => row.modified || row.deleted || row.untracked)
      .map((row) => row.path)
      .filter((path) => !isIgnored(next, path));
    if (dirtyPaths.length === 0) {
      return { state: repo, events, output: ok("No local changes to save", "muted") };
    }
    const files = new Map<string, GitFileEntry>();
    for (const path of dirtyPaths) {
      const file = next.workingTree.get(path);
      if (file) files.set(path, { ...file });
    }
    const message = messageMatch?.[1]?.trim() || `WIP on ${next.branch}`;
    next.stash.push({ id: `stash-${next.stash.length}`, message, files });
    // Revert the working tree to HEAD.
    const headTree = commitTreeAt(next, next.head);
    const cleanTree = new Map<string, GitFileEntry>();
    for (const [path, content] of headTree) {
      cleanTree.set(path, {
        id: path,
        name: path.split("/").pop() ?? path,
        path,
        content,
        original: content,
      });
    }
    next.workingTree = cleanTree;
    next.index.clear();
    events.push(createEvent("STASH_CHANGED"));
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      events,
      output: ok(`Saved working directory and index state WIP on ${next.branch}: ${message}\nWork is safely set aside.`, "success"),
    };
  }
  if (sub === "stash list") {
    if (next.stash.length === 0) return { state: repo, events, output: ok("(no stashes)", "muted") };
    const lines = next.stash.map((entry, i) => `stash@{${i}}: ${entry.message}`);
    return { state: repo, events, output: ok(lines.join("\n"), "output") };
  }
  const stashPop = trimmed.match(/^git stash pop(?:\s+(?:\d+|stash@\{\d+\}))?$/);
  if (stashPop) {
    if (next.stash.length === 0) {
      return { state: repo, events, output: ok("No stash entries found.", "error") };
    }
    const index = Number(trimmed.match(/(\d+)/)?.[1] ?? 0);
    const entry = next.stash[index];
    if (!entry) return { state: repo, events, output: ok(`error: stash@{$index} does not exist`, "error") };
    for (const [path, file] of entry.files) {
      writeWorkingTree(next, path, file.content);
    }
    next.stash.splice(index, 1);
    events.push(createEvent("STASH_CHANGED"));
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      events,
      output: ok(`Dropped stash@{${index}} (${entry.message})\nWork is back in your working tree.`, "success"),
    };
  }

  // ------------------------------------------------------ git cherry-pick
  const cherryMatch = trimmed.match(/^git cherry-pick\s+(\S+)$/);
  if (cherryMatch) {
    const target = resolveRev(next, cherryMatch[1]!);
    if (!target) {
      return { state: repo, events, output: ok(`fatal: bad revision '${cherryMatch[1]}'`, "error") };
    }
    const picked = next.commits.find((c) => c.hash === target);
    if (!picked) return { state: repo, events, output: ok(`fatal: bad revision '${cherryMatch[1]}'`, "error") };
    if (!next.head) return { state: repo, events, output: ok("fatal: no commits yet", "error") };
    const changes = relocatableChanges(next, picked, false);
    applyChangesToTree(next, changes);
    const commit = commitChangedFiles(next, picked.message, changes, next.branch);
    events.push(createEvent("COMMIT_CREATED", undefined, { hash: commit.hash, message: picked.message }));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: commit.hash }));
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      events,
      output: ok(`[${next.branch} ${commit.hash}] ${picked.message}\nOne commit copied onto your branch.`, "success"),
    };
  }

  // ---------------------------------------------------------- git reset
  const resetMatch = trimmed.match(/^git reset(?:\s+(--soft|--mixed|--hard))?(?:\s+(\S+))?$/);
  if (resetMatch) {
    const mode = resetMatch[1] ?? "--mixed";
    const rev = resetMatch[2] ?? "HEAD";
    const target = resolveRev(next, rev);
    if (target === null || target === undefined) {
      return { state: repo, events, output: ok(`fatal: ambiguous argument '${rev}': unknown revision`, "error") };
    }
    if (next.detached) {
      return { state: repo, events, output: ok(`fatal: cannot reset in detached HEAD state`, "error") };
    }
    const branch = next.branch;
    const wasHead = next.head;
    recordReflog(next, wasHead, target, `reset: moving to ${rev}`);
    next.head = target;
    next.branches.set(branch, target);
    if (mode === "--hard") {
      const tree = commitTreeAt(next, target);
      const cleanTree = new Map<string, GitFileEntry>();
      for (const [path, content] of tree) {
        cleanTree.set(path, {
          id: path,
          name: path.split("/").pop() ?? path,
          path,
          content,
          original: content,
        });
      }
      next.workingTree = cleanTree;
      next.index.clear();
    } else if (mode === "--mixed") {
      next.index.clear();
    } else {
      // --soft: keep index + working tree, but stage the diff so a commit works.
      stageDiffFrom(next, target);
    }
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: target }));
    events.push(createEvent("STATUS_CHANGED"));
    const labels: Record<string, string> = { "--soft": "soft", "--mixed": "mixed", "--hard": "hard" };
    return {
      state: next,
      events,
      output: ok(`HEAD is now at ${target} (${labels[mode] ?? "mixed"} reset)`, "success"),
    };
  }

  // ---------------------------------------------------------- git revert
  const revertMatch = trimmed.match(/^git revert(?:\s+(\S+))?$/);
  if (revertMatch) {
    const rev = revertMatch[1] ?? "HEAD";
    const target = resolveRev(next, rev);
    if (!target) return { state: repo, events, output: ok(`fatal: bad revision '${rev}'`, "error") };
    const reverted = next.commits.find((c) => c.hash === target);
    if (!reverted) return { state: repo, events, output: ok(`fatal: bad revision '${rev}'`, "error") };
    const changes = relocatableChanges(next, reverted, true);
    applyChangesToTree(next, changes);
    const message = `Revert "${reverted.message}"`;
    const commit = commitChangedFiles(next, message, changes, next.branch);
    events.push(createEvent("COMMIT_CREATED", undefined, { hash: commit.hash, message }));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: commit.hash }));
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      events,
      output: ok(`[${next.branch} ${commit.hash}] ${message}\nA new commit undoes the old change. History stays intact.`, "success"),
    };
  }

  // ---------------------------------------------------------- git rebase
  const rebaseMatch = trimmed.match(/^git rebase\s+(\S+)$/);
  if (rebaseMatch) {
    const ontoRev = rebaseMatch[1]!;
    const onto = resolveRev(next, ontoRev);
    if (onto === null || onto === undefined) {
      return { state: repo, events, output: ok(`fatal: invalid upstream '${ontoRev}'`, "error") };
    }
    if (!next.head) return { state: repo, events, output: ok("fatal: no commits yet", "error") };
    if (next.branch === ontoRev) {
      return { state: repo, events, output: ok(`Current branch ${next.branch} is up to date.`, "muted") };
    }
    const currentBranch = next.branch;
    const fork = commitsBetween(next, next.head, onto);
    if (fork.length === 0) {
      return { state: repo, events, output: ok("Current branch is up to date.", "muted") };
    }
    // Replay each unique commit on top of the onto tip.
    let parentHash = onto;
    const replayMessages: string[] = [];
    for (const commit of fork) {
      const changes = relocatableChanges(next, commit, false);
      const hash = shortHash(commit.message, next.commits.length);
      const replayed: GitCommit = {
        id: makeCommitId(hash),
        hash,
        message: commit.message,
        author: { ...commit.author },
        timestamp: Date.now(),
        parents: [parentHash],
        branch: currentBranch,
        changedFiles: changes,
      };
      next.commits.push(replayed);
      parentHash = hash;
      replayMessages.push(hash.slice(0, 7));
    }
    next.head = parentHash;
    next.branches.set(currentBranch, parentHash);
    recordReflog(next, next.head, parentHash, `rebase onto ${ontoRev}`);
    // Remove the original (now unreachable) replayed commits from the model so
    // history reads as one clean, linear line.
    const oldHashes = new Set(fork.map((c) => c.hash));
    next.commits = next.commits.filter((c) => !oldHashes.has(c.hash));
    // Restore working tree to the replayed result.
    const tree = commitTreeAt(next, parentHash);
    const cleanTree = new Map<string, GitFileEntry>();
    for (const [path, content] of tree) {
      cleanTree.set(path, {
        id: path,
        name: path.split("/").pop() ?? path,
        path,
        content,
        original: content,
      });
    }
    next.workingTree = cleanTree;
    next.index.clear();
    events.push(createEvent("COMMIT_CREATED", undefined, { hash: parentHash, message: "Rebase" }));
    events.push(createEvent("HEAD_CHANGED", undefined, { hash: parentHash }));
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      events,
      output: ok(
        `Successfully rebased ${currentBranch} onto ${ontoRev}\nReplayed: ${replayMessages.join(", ")}\nYour branch now sits on top of ${ontoRev}.`,
        "success",
      ),
    };
  }

  // ------------------------------------------------------------ git tag
  const tagCreate = trimmed.match(/^git tag(?:\s+-a)?\s+([\w./-]+)(?:\s+-m\s+["']([^"']+)["'])?$/);
  if (tagCreate) {
    const name = tagCreate[1]!;
    if (next.tags.has(name)) {
      return { state: repo, events, output: ok(`fatal: tag '${name}' already exists`, "error") };
    }
    const target = next.head;
    if (!target) return { state: repo, events, output: ok(`fatal: no commits yet`, "error") };
    next.tags.set(name, target);
    events.push(createEvent("TAG_CREATED", undefined, { tag: name }));
    return {
      state: next,
      events,
      output: ok(`tag '${name}' created (${target.slice(0, 7)})`, "success"),
    };
  }
  if (sub === "tag" || sub === "tag --list" || sub === "tags") {
    if (next.tags.size === 0) return { state: repo, events, output: ok("(no tags)", "muted") };
    const lines = [...next.tags.entries()].map(
      ([name, hash]) => `${hash.slice(0, 7)} ${name}`,
    );
    return { state: repo, events, output: ok(lines.join("\n"), "output") };
  }
  const tagDelete = trimmed.match(/^git tag -d\s+(\S+)$/);
  if (tagDelete) {
    if (!next.tags.has(tagDelete[1]!)) {
      return { state: repo, events, output: ok(`error: tag '${tagDelete[1]}' not found`, "error") };
    }
    next.tags.delete(tagDelete[1]!);
    return { state: next, events, output: ok(`Deleted tag '${tagDelete[1]}'`, "success") };
  }

  // ----------------------------------------------------- git push --tags
  if (sub === "push --tags" || sub === "push --tag") {
    if (!remote) return { state: repo, events, output: ok("fatal: no remote repository configured", "error") };
    if (next.tags.size === 0) return { state: repo, events, output: ok("Everything up-to-date", "muted") };
    const nextRemote = cloneRepository(remote);
    let pushed = 0;
    for (const [name, hash] of next.tags) {
      if (!nextRemote.tags.has(name)) {
        nextRemote.tags.set(name, hash);
        pushed++;
      }
    }
    if (pushed === 0) return { state: repo, events, output: ok("Everything up-to-date", "muted") };
    events.push(createEvent("STATUS_CHANGED"));
    return {
      state: next,
      remote: nextRemote,
      events,
      output: ok(`To the remote\n * [new tag]   ${[...next.tags.keys()].join("\n   [new tag]   ")}\n${pushed} tag${pushed === 1 ? "" : "s"} pushed.`, "success"),
    };
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

/** Record a HEAD movement in the reflog (called whenever HEAD changes). */
function recordReflog(
  repo: GitRepository,
  from: string | null,
  to: string | null,
  message: string,
): void {
  repo.reflog.push({ from, to, message, timestamp: Date.now() });
}

/** Whether `ancestorHash` is reachable from `descendantHash` in the commit graph. */
function isAncestor(  commits: GitRepository["commits"],
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

/** All commits reachable from `headHash`, oldest-first, in file-update order. */
function commitsFromHead(
  repo: GitRepository,
  headHash: string | undefined,
): GitRepository["commits"] {
  if (!headHash) return [];
  const byHash = new Map(repo.commits.map((c) => [c.hash, c]));
  const ordered: GitRepository["commits"] = [];
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

/**
 * Resolve a revision reference to a commit hash. Accepts a full hash,
 * `HEAD`, `HEAD~N`, a branch name, or a tag name.
 */
function resolveRev(repo: GitRepository, rev: string): string | null {
  if (rev === "HEAD") return repo.head;
  const tilde = rev.match(/^HEAD~(\d+)$/);
  if (tilde) {
    let current: string | null | undefined = repo.head;
    for (let i = 0; i < Number(tilde[1]); i++) {
      const commit = repo.commits.find((c) => c.hash === current);
      if (!commit || commit.parents.length === 0) return null;
      current = commit.parents[0];
    }
    return current ?? null;
  }
  if (repo.branches.get(rev) !== undefined) return repo.branches.get(rev) || null;
  if (repo.tags.has(rev)) return repo.tags.get(rev) ?? null;
  if (repo.commits.some((c) => c.hash === rev)) return rev;
  return null;
}

/** Reconstruct the full file tree (path → content) at a given commit. */
function commitTreeAt(repo: GitRepository, hash: string | null): Map<string, string> {
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

/**
 * Commits reachable from `fromHash` but NOT from `baseHash`, oldest-first.
 * Used by rebase: these are the commits unique to the current branch.
 */
function commitsBetween(
  repo: GitRepository,
  fromHash: string | null,
  baseHash: string | null,
): GitRepository["commits"] {
  if (!fromHash) return [];
  const all = commitsFromHead(repo, fromHash);
  return all.filter((commit) => baseHash === null || !isAncestor(repo.commits, commit.hash, baseHash));
}

/**
 * Stage every file whose content differs between the tree at `targetHash`
 * and the current working tree. Emulates `git reset --soft` leaving the
 * changes staged, so a follow-up `git commit` works.
 */
function stageDiffFrom(repo: GitRepository, targetHash: string | null): void {
  const targetTree = commitTreeAt(repo, targetHash);
  for (const path of new Set([...repo.workingTree.keys(), ...targetTree.keys()])) {
    const working = repo.workingTree.get(path)?.content;
    const target = targetTree.get(path);
    if (working !== target) {
      if (working === undefined) {
        // File existed at target but is absent now: stage a deletion.
        repo.index.add(path);
      } else {
        repo.index.add(path);
      }
    }
  }
}

/**
 * Turn the changes of an existing commit into new `GitChangedFile[]` that can
 * be applied on top of a new parent. For cherry-pick (same direction) and
 * revert (inverse direction).
 */
function relocatableChanges(
  repo: GitRepository,
  commit: GitCommit,
  inverse: boolean,
): GitChangedFile[] {
  if (!inverse) {
    return commit.changedFiles.map((c) => ({ ...c }));
  }
  const parentTree = commitTreeAt(repo, commit.parents[0] ?? null);
  const inverseChanges: GitChangedFile[] = [];
  for (const change of commit.changedFiles) {
    if (change.status === "added") {
      inverseChanges.push({ path: change.path, status: "deleted" });
    } else if (change.status === "deleted") {
      const content = parentTree.get(change.path);
      inverseChanges.push({ path: change.path, status: "added", content });
    } else {
      const content = parentTree.get(change.path);
      inverseChanges.push({ path: change.path, status: content === undefined ? "added" : "modified", content });
    }
  }
  return inverseChanges;
}

/** Apply changed files to the working tree + index, returning staged paths. */
function applyChangesToTree(repo: GitRepository, changes: GitChangedFile[]): string[] {
  for (const change of changes) {
    if (change.status === "deleted") {
      repo.workingTree.delete(change.path);
    } else if (change.content !== undefined) {
      repo.workingTree.set(change.path, {
        id: change.path,
        name: change.path.split("/").pop() ?? change.path,
        path: change.path,
        content: change.content,
        // After the follow-up commit this content becomes the new baseline.
        original: change.content,
      });
    }
    repo.index.add(change.path);
  }
  return changes.map((c) => c.path);
}

/** Create a new commit on the current branch and update HEAD + working tree. */
function commitChangedFiles(
  repo: GitRepository,
  message: string,
  changedFiles: GitChangedFile[],
  branch: string,
): GitCommit {
  const hash = shortHash(message, repo.commits.length);
  const commit: GitCommit = {
    id: makeCommitId(hash),
    hash,
    message,
    author: { ...repo.author },
    timestamp: Date.now(),
    parents: repo.head ? [repo.head] : [],
    branch,
    changedFiles,
  };
  repo.commits.push(commit);
  repo.head = hash;
  repo.branches.set(branch, hash);
  repo.index.clear();
  recordReflog(repo, repo.head, hash, `commit: ${message}`);
  return commit;
}

/**
 * Restore the working tree to match the state committed on `branchName`.
 * Files the branch has are written with their committed content and baseline;
 * files that don't belong to the branch are removed. This makes switching
 * branches behave like real Git instead of just relabeling HEAD.
 */
function restoreWorkingTreeForBranch(repo: GitRepository, branchName: string): void {
  restoreWorkingTreeAt(repo, repo.branches.get(branchName) ?? "");
}

/** Restore the working tree to the files committed at `hash`. */
function restoreWorkingTreeAt(repo: GitRepository, hash: string): void {
  const files = new Map<string, string>();
  for (const commit of commitsFromHead(repo, hash)) {
    for (const change of commit.changedFiles) {
      if (change.status === "deleted") files.delete(change.path);
      else if (change.content !== undefined) files.set(change.path, change.content);
    }
  }
  const nextTree = new Map<string, (typeof repo.workingTree extends Map<string, infer T> ? T : never)>();
  for (const [path, content] of files) {
    nextTree.set(path, {
      id: path,
      name: path.split("/").pop() ?? path,
      path,
      content,
      original: content,
    });
  }
  repo.workingTree = nextTree;
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
