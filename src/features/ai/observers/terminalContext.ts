/**
 * TerminalObserver helpers  -  a compact, human summary of the live Git
 * simulation so the AI can answer "what did I do wrong?" from real state.
 */

import {
  fileStatus,
  type CommandOutput,
  type GitState,
} from "@/features/lesson/components/interactive/gitEngine";

export function summarizeGitState(
  state: GitState,
  lastCommand?: string,
  lastOutput?: CommandOutput,
  history: string[] = [],
): string {
  const parts: string[] = [`branch ${state.branch}`];

  const staged = [...state.staged];
  const modified = [...state.files.keys()].filter(
    (p) => fileStatus(state, p) === "modified",
  );
  const untracked = [...state.files.keys()].filter(
    (p) => fileStatus(state, p) === "untracked",
  );

  if (staged.length > 0) parts.push(`${staged.length} staged (${staged.join(", ")})`);
  if (modified.length > 0) parts.push(`${modified.length} modified (${modified.join(", ")})`);
  if (untracked.length > 0) parts.push(`${untracked.length} untracked (${untracked.join(", ")})`);

  const head = state.commits.length > 0 ? state.branches.get(state.branch) : undefined;
  parts.push(head ? `HEAD ${head}` : "no commits yet");

  let summary = parts.join(" · ");
  if (lastCommand) summary += `\nlast command: ${lastCommand}`;
  if (lastOutput && lastOutput.lines.length > 0) {
    summary += `\noutput: ${lastOutput.lines.join(" | ").slice(0, 160)}`;
  }
  if (history.length > 1) {
    summary += `\nrecent commands: ${history.slice(-5).join(" → ")}`;
  }
  return summary;
}
