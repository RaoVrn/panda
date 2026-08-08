/**
 * Playground — contextual hints.
 *
 * Instead of only showing the lesson's static hint for the current objective,
 * this derives a hint from the LIVE repository state and the learner's last
 * command. It inspects the first failing check of the active objective and
 * tells the learner exactly what to do next — e.g. "You staged README.md.
 * Now commit those staged changes."
 */

import type { GitCommandOutput, GitRepository } from "@/lib/git";
import type { ContentPlaygroundObjective, PlaygroundCheck } from "@/content/schema";
import { fileStatusOf } from "@/lib/git";
import { getErrorHint } from "./animations";

export interface HintSession {
  lastCommand: string;
  lastOutput: GitCommandOutput | null;
  history: string[];
}

/** Guidance for a single failing check, derived from repository state. */
function guidanceFor(
  check: PlaygroundCheck,
  repo: GitRepository,
): string | null {
  switch (check.kind) {
    case "initialized":
      return "This folder isn't a Git repository yet. Run git init to wake Git up.";

    case "fileExists": {
      if (!repo.workingTree.has(check.path)) {
        return `That file isn't in the working tree yet. Create it with touch ${check.path} (or echo "..." > ${check.path}).`;
      }
      return null;
    }

    case "fileNotExists":
      if (repo.workingTree.has(check.path)) {
        return `Remove ${check.path} first with rm ${check.path}.`;
      }
      return null;

    case "fileStaged":
      if (!repo.index.has(check.path)) {
        const exists = repo.workingTree.has(check.path);
        return exists
          ? `${check.path} exists but isn't staged. Run git add ${check.path}.`
          : `Stage ${check.path}. First create it, then git add ${check.path}.`;
      }
      return null;

    case "fileNotStaged":
      if (repo.index.has(check.path)) {
        return `Unstage ${check.path} with git restore --staged ${check.path}.`;
      }
      return null;

    case "fileTracked": {
      const status = fileStatusOf(repo, check.path);
      if (!status.tracked) {
        return `${check.path} hasn't been saved in a snapshot yet. Create it, git add it, and commit.`;
      }
      return null;
    }

    case "fileContent": {
      const file = repo.workingTree.get(check.path);
      if (!file) return `Create ${check.path} first, then set its content.`;
      if (check.contains !== undefined && !file.content.includes(check.contains)) {
        return `${check.path} doesn't contain "${check.contains}" yet. Write that content into the file (echo "..." > ${check.path}).`;
      }
      if (check.equals !== undefined && file.content.trimEnd() !== check.equals.trimEnd()) {
        return `${check.path} should exactly equal: ${check.equals.trimEnd()}`;
      }
      return null;
    }

    case "workingTreeClean": {
      return "Your working tree has uncommitted changes. Commit them (git add . then git commit -m \"...\") or restore them.";
    }

    case "commitCountAtLeast":
    case "commitCountEquals":
      return "Make a commit to save a snapshot: git add . then git commit -m \"message\".";

    case "latestCommitMessage":
      return check.message
        ? `Your newest commit should say "${check.message}". Commit your changes with that exact message.`
        : "Commit your changes to advance.";

    case "anyCommitMessage":
    case "anyCommitMessageContains":
      return check.kind === "anyCommitMessage"
        ? `No commit says "${check.message}" yet. Check the message you used, it must match exactly.`
        : `No commit mentions "${check.text}". Make a commit whose message covers that.`;

    case "branch":
      return `You need to be on the ${check.name} branch. Run git switch ${check.name}.`;

    case "branchExists":
      return `Create the ${check.name} branch with git switch -c ${check.name}.`;

    case "branchNotExists":
      return `Delete the ${check.name} branch with git branch -d ${check.name} (from a different branch).`;

    case "branchAtCommit":
      return `The ${check.name} branch should point at commit ${check.hash.slice(0, 7)}. Check it out and reset it there if needed.`;

    case "branchDescendantOf":
      return `Your ${check.name} branch should sit on top of ${check.ancestor}. Stand on ${check.name} and run git rebase ${check.ancestor}.`;

    case "detachedHead":
      return "You need to be in detached HEAD state. Check out an older commit by hash with git checkout <hash>.";

    case "stashCountAtLeast":
      return "Set your current changes aside with git stash.";

    case "stashEmpty":
      return "Bring your stashed work back with git stash pop.";

    case "tagExists":
      return `Create the ${check.name} tag with git tag ${check.name}.`;

    case "tagNotExists":
      return `Delete the ${check.name} tag with git tag -d ${check.name}.`;

    case "remoteTagExists":
      return "Share your tags with the remote using git push --tags.";

    case "remoteExists":
      return `Add the ${check.name} remote with git remote add ${check.name} <url>.`;

    case "remoteHasCommit":
      return "Push your work to the remote so it has the commit it's waiting for.";

    case "pushSucceeded":
      return "Push your branch to the remote with git push.";

    case "reflogHas":
      return `The reflog should contain "${check.text}". Run the matching command to move HEAD.`;

    case "authorName":
      return `Set your Git name with git config --global user.name "${check.name}".`;

    case "authorEmail":
      return `Set your Git email with git config --global user.email "${check.email}".`;

    case "fileUntracked":
      return `Keep ${check.path} untracked for now, don't git add it.`;

    case "commitTouchesFile":
      return `Make a commit that changes ${check.path}: edit it, git add it, then commit.`;

    case "commitDoesNotTouchFile":
      return `Don't include ${check.path} in your next commit, leave it unstaged.`;

    case "remoteNotExists":
      return `Remove the ${check.name} remote with git remote remove ${check.name}.`;

    default:
      return null;
  }
}

/** First check that isn't satisfied yet, or null when the objective is done. */
function firstFailingCheck(
  objective: ContentPlaygroundObjective,
  repo: GitRepository,
): PlaygroundCheck | null {
  for (const check of objective.checks) {
    if (!checkPasses(check, repo)) return check;
  }
  return null;
}

function checkPasses(check: PlaygroundCheck, repo: GitRepository): boolean {
  switch (check.kind) {
    case "initialized":
      return repo.initialized;
    case "fileExists":
      return repo.workingTree.has(check.path);
    case "fileNotExists":
      return !repo.workingTree.has(check.path);
    case "fileStaged":
      return repo.index.has(check.path);
    case "fileNotStaged":
      return !repo.index.has(check.path);
    case "fileTracked":
      return fileStatusOf(repo, check.path).tracked;
    case "fileUntracked":
      return fileStatusOf(repo, check.path).untracked && !repo.index.has(check.path);
    case "fileContent": {
      const file = repo.workingTree.get(check.path);
      if (!file) return false;
      if (check.contains !== undefined) return file.content.includes(check.contains);
      if (check.equals !== undefined) return file.content.trimEnd() === check.equals.trimEnd();
      return true;
    }
    case "workingTreeClean":
      return [...repo.workingTree.keys()].every((p) => {
        const s = fileStatusOf(repo, p);
        return !s.modified && !s.deleted && !s.untracked && !repo.index.has(p);
      });
    case "commitCountAtLeast":
      return repo.commits.length >= check.count;
    case "commitCountEquals":
      return repo.commits.length === check.count;
    case "commitTouchesFile":
      return repo.commits.some((c) => c.changedFiles.some((f) => f.path === check.path));
    case "commitDoesNotTouchFile":
      return !repo.commits.some((c) => c.changedFiles.some((f) => f.path === check.path));
    case "latestCommitMessage": {
      const last = repo.commits[repo.commits.length - 1];
      return Boolean(last && (check.message === undefined || last.message === check.message));
    }
    case "anyCommitMessage":
      return repo.commits.some((c) => c.message === check.message);
    case "anyCommitMessageContains":
      return repo.commits.some((c) => c.message.includes(check.text));
    case "branch":
      return repo.branch === check.name;
    case "branchExists":
      return repo.branches.has(check.name);
    case "branchNotExists":
      return !repo.branches.has(check.name);
    case "branchAtCommit":
      return repo.branches.get(check.name) === check.hash;
    case "branchDescendantOf":
      return false; // structural check; guidance covers it
    case "reflogHas":
      return repo.reflog.some((e) => e.message.includes(check.text));
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
      return false; // needs remote; guidance covers it
    case "remoteExists":
      return repo.remotes.has(check.name);
    case "remoteNotExists":
      return !repo.remotes.has(check.name);
    case "remoteHasCommit":
      return false; // needs remote; guidance covers it
    case "pushSucceeded":
      return false; // needs remote; guidance covers it
    case "authorName":
      return repo.author.name === check.name;
    case "authorEmail":
      return repo.author.email === check.email;
    default:
      return true;
  }
}

/**
 * Build a contextual hint for the current objective. Prefers state-derived
 * guidance over the static lesson hint, and mentions the last error when one
 * just happened.
 */
export function buildContextualHint(
  objective: ContentPlaygroundObjective,
  repo: GitRepository,
  session: HintSession,
  staticHint?: string,
): string {
  const parts: string[] = [];

  const failing = firstFailingCheck(objective, repo);
  if (failing) {
    const guidance = guidanceFor(failing, repo);
    if (guidance) parts.push(guidance);
  }

  if (session.lastOutput?.kind === "error") {
    const errHint = getErrorHint(session.lastOutput.text);
    if (errHint) parts.push(`That command didn't work: ${errHint}`);
  }

  const combined = parts.join(" ");
  if (combined) return combined;

  return staticHint ?? objective.label;
}
