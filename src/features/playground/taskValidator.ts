/**
 * Playground — task validator.
 *
 * Objectives are never "did the learner type X". They are predicates over the
 * LIVE simulated repository, so a task completes only when Git's real state
 * satisfies it — exactly how the engine reports it. This file is the single
 * place that knows how to read a `PlaygroundCheck`; adding a check kind means
 * one case here (and, in the future, command support in the engine).
 */

import { fileStatusOf, statusRows } from "@/lib/git";
import type { GitRepository } from "@/lib/git";
import type { PlaygroundCheck } from "@/content/schema";

/** Whether one check passes for the given repository state. */
export function evaluateCheck(repo: GitRepository, check: PlaygroundCheck): boolean {
  switch (check.kind) {
    case "initialized":
      return repo.initialized;

    case "fileExists":
      return repo.workingTree.has(check.path);

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
      return repo.commits.length >= check.count;

    case "commitTouchesFile":
      return repo.commits.some((commit) =>
        commit.changedFiles.some((file) => file.path === check.path),
      );

    case "commitDoesNotTouchFile":
      return !repo.commits.some((commit) =>
        commit.changedFiles.some((file) => file.path === check.path),
      );

    case "latestCommitMessage": {
      const latest = repo.commits[repo.commits.length - 1];
      if (!latest) return false;
      return check.message === undefined || latest.message === check.message;
    }

    case "anyCommitMessage":
      return repo.commits.some((commit) => commit.message === check.message);

    case "branch":
      return repo.branch === check.name;
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
): PlaygroundObjectiveStatus[] {
  return objectives.map((objective) => ({
    objectiveId: objective.id,
    done: objective.checks.every((check) => evaluateCheck(repo, check)),
  }));
}

/** Number of objectives complete, out of the total. */
export function playgroundProgress(
  repo: GitRepository,
  objectives: ReadonlyArray<{ id: string; checks: PlaygroundCheck[] }>,
): { done: number; total: number } {
  const statuses = objectiveStatuses(repo, objectives);
  return {
    done: statuses.filter((status) => status.done).length,
    total: statuses.length,
  };
}
