/**
 * Playground  -  task validator.
 *
 * Objectives are never "did the learner type X". They are predicates over the
 * LIVE simulated repository, so a task completes only when Git's real state
 * satisfies it  -  exactly how the engine reports it. This file is the single
 * place that knows how to read a `PlaygroundCheck`; adding a check kind means
 * one case here (and, in the future, command support in the engine).
 */

import { fileStatusOf, statusRows } from "@/lib/git";
import type { GitRepository } from "@/lib/git";
import type { PlaygroundCheck } from "@/content/schema";

/** Commits reachable from HEAD, oldest-first (matches what `git log` shows). */
function reachableCommits(repo: GitRepository): GitRepository["commits"] {
  if (!repo.head) return [];
  const byHash = new Map(repo.commits.map((c) => [c.hash, c]));
  const ordered: GitRepository["commits"] = [];
  const seen = new Set<string>();
  const stack: string[] = [];
  let current: string | null = repo.head;
  while (current && !seen.has(current)) {
    stack.push(current);
    seen.add(current);
    const commit = byHash.get(current);
    current = commit?.parents[0] ?? null;
  }
  for (const hash of stack.reverse()) {
    const commit = byHash.get(hash);
    if (commit) ordered.push(commit);
  }
  return ordered;
}

/** Whether `ancestorHash` is reachable from `descendantHash` in the commit graph. */
function isAncestor(
  commits: GitRepository["commits"],
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

/** Whether one check passes for the given repository state. */
export function evaluateCheck(
  repo: GitRepository,
  check: PlaygroundCheck,
  remote?: GitRepository | null,
  history?: string[],
): boolean {
  switch (check.kind) {
    case "initialized":
      return repo.initialized;

    case "authorName":
      return repo.author.name === check.name;

    case "authorEmail":
      return repo.author.email === check.email;

    case "fileExists":
      return repo.workingTree.has(check.path);

    case "fileNotExists":
      return !repo.workingTree.has(check.path);

    case "fileUntracked": {
      const status = fileStatusOf(repo, check.path);
      return status.untracked && !status.staged;
    }

    case "fileStaged":
      return repo.index.has(check.path);

    case "fileNotStaged":
      return !repo.index.has(check.path);

    case "fileTracked": {
      const status = fileStatusOf(repo, check.path);
      return status.tracked;
    }

    case "fileContent": {
      const file = repo.workingTree.get(check.path);
      if (!file) return false;
      if (check.equals !== undefined) return file.content.trimEnd() === check.equals.trimEnd();
      if (check.contains !== undefined) return file.content.includes(check.contains);
      return true;
    }

    case "workingTreeClean":
      return statusRows(repo).every((row) => !row.staged && !row.modified && !row.deleted && !row.untracked);

    case "commitCountAtLeast":
      return reachableCommits(repo).length >= check.count;

    case "commitCountEquals":
      return reachableCommits(repo).length === check.count;

    case "commitTouchesFile":
      return reachableCommits(repo).some((commit) =>
        commit.changedFiles.some((file) => file.path === check.path),
      );

    case "commitDoesNotTouchFile":
      return !reachableCommits(repo).some((commit) =>
        commit.changedFiles.some((file) => file.path === check.path),
      );

    case "latestCommitMessage": {
      const reachable = reachableCommits(repo);
      const latest = reachable[reachable.length - 1] ?? repo.commits[repo.commits.length - 1];
      if (!latest) return false;
      return check.message === undefined || latest.message === check.message;
    }

    case "anyCommitMessage":
      // Only commits HEAD can actually see count, so setup commits on other
      // branches never satisfy a "commit X" objective before the learner acts.
      return reachableCommits(repo).some((commit) => commit.message === check.message);

    case "anyCommitMessageContains":
      return reachableCommits(repo).some((commit) => commit.message.includes(check.text));

    case "branch":
      return repo.branch === check.name;

    case "branchExists":
      return repo.branches.has(check.name);

    case "branchNotExists":
      return !repo.branches.has(check.name);

    case "branchAtCommit":
      return repo.branches.get(check.name) === check.hash;

    case "branchDescendantOf":
      if (!repo.branches.has(check.name) || !repo.branches.has(check.ancestor)) return false;
      return isAncestor(repo.commits, repo.branches.get(check.ancestor) ?? "", repo.branches.get(check.name) ?? "");

    case "reflogHas":
      return repo.reflog.some((entry) => entry.message.includes(check.text));

    case "detachedHead":
      return repo.detached;

    case "stashCountAtLeast":
      return repo.stash.length >= check.count;

    case "stashEmpty":
      return repo.stash.length === 0;

    case "tagExists":
      return repo.tags.has(check.name);

    case "tagNotExists":
      return !repo.tags.has(check.name);

    case "remoteTagExists":
      if (!remote) return false;
      return remote.tags.has(check.name);

    case "remoteExists":
      return repo.remotes.has(check.name);

    case "remoteNotExists":
      return !repo.remotes.has(check.name);

    case "remoteHasCommit":
      if (!remote) return false;
      return remote.commits.some((commit) => commit.message === check.message);

    case "pushSucceeded":
      if (!remote) return false;
      // The remote's current branch head must match the local head: the push landed.
      return remote.branches.get(repo.branch) === (repo.branches.get(repo.branch) ?? repo.head);

    case "ranCommand":
      // Verifies the learner actually ran a command (e.g. `git log`) rather
      // than reaching the state some other way. Matches a substring so both
      // `git log` and `git log --oneline` count.
      return (history ?? []).some((command) => command.includes(check.contains));
  }
}

export interface PlaygroundObjectiveStatus {
  objectiveId: string;
  done: boolean;
}

/** Per-objective completion, derived from repository state. */
export function objectiveStatuses(
  repo: GitRepository,
  objectives: ReadonlyArray<{ id: string; checks: PlaygroundCheck[] }>,
  remote?: GitRepository | null,
  history?: string[],
): PlaygroundObjectiveStatus[] {
  return objectives.map((objective) => ({
    objectiveId: objective.id,
    done: objective.checks.every((check) => evaluateCheck(repo, check, remote, history)),
  }));
}
