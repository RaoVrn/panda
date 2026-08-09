/**
 * Playground  -  repository summarizer for the AI context.
 *
 * Turns the live simulated repository into a compact human summary so Panda AI
 * can answer "what went wrong?" from real state instead of guesses.
 */

import { headCommit, statusRows } from "@/lib/git";
import type { GitCommandOutput, GitRepository } from "@/lib/git";

export function summarizeRepository(
  repo: GitRepository,
  lastCommand?: string,
  lastOutput?: GitCommandOutput,
  history: string[] = [],
): string {
  const parts: string[] = [
    repo.initialized ? "initialized" : "not initialized",
    `branch ${repo.branch}`,
  ];

  const rows = statusRows(repo);
  const staged = rows.filter((row) => row.staged);
  const modified = rows.filter((row) => !row.staged && row.modified);
  const untracked = rows.filter((row) => row.untracked);

  if (staged.length > 0) parts.push(`${staged.length} staged (${staged.map((r) => r.path).join(", ")})`);
  if (modified.length > 0) parts.push(`${modified.length} modified (${modified.map((r) => r.path).join(", ")})`);
  if (untracked.length > 0) parts.push(`${untracked.length} untracked (${untracked.map((r) => r.path).join(", ")})`);

  const head = headCommit(repo);
  parts.push(head ? `HEAD ${head.hash} "${head.message}"` : "no commits yet");

  let summary = parts.join(" · ");
  if (lastCommand) summary += `\nlast command: ${lastCommand}`;
  if (lastOutput && lastOutput.text) {
    summary += `\noutput: ${lastOutput.text.split("\n").join(" | ").slice(0, 160)}`;
  }
  if (history.length > 1) {
    summary += `\nrecent commands: ${history.slice(-5).join(" → ")}`;
  }
  return summary;
}
