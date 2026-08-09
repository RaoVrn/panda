import { describe, expect, it } from "vitest";
import {
  createGitState,
  runCommand,
  type GitState,
} from "@/features/lesson/components/interactive/gitEngine";

function shell(initialized = true): GitState {
  return createGitState({ files: { "README.md": "hi\n" }, pwd: "~/project", initialized });
}

function run(state: GitState, ...cmds: string[]): GitState {
  let s = state;
  for (const c of cmds) s = runCommand(s, c).state;
  return s;
}

function out(state: GitState, cmd: string): string {
  return runCommand(state, cmd).output.lines.join("\n");
}

describe("terminal engine", () => {
  it("echo bare prints text; echo redirect writes a file", () => {
    expect(out(shell(), "echo hello")).toBe("hello");
    expect(out(shell(), 'echo "hello world"')).toBe("hello world");
    const s = run(shell(), "echo note > n.txt");
    expect(s.files.has("n.txt")).toBe(true);
  });

  it("init, add, commit, log", () => {
    const s = run(shell(false), "git init", "git add .", 'git commit -m "Start"');
    expect(s.initialized).toBe(true);
    expect(s.commits.length).toBe(1);
    expect(out(s, "git log --oneline")).toContain("Start");
  });

  it("branch + switch", () => {
    const s = run(shell(), "git init", "git add .", "git commit -m Start", "git branch dev");
    expect(s.branches.has("dev")).toBe(true);
    const s2 = run(s, "git switch dev");
    expect(s2.branch).toBe("dev");
  });

  it("reset --hard moves HEAD and clears the tree", () => {
    const s = run(
      shell(),
      "git init",
      "git add .",
      "git commit -m Start",
      "touch x.txt",
      "git add .",
      "git commit -m X",
      "git reset --hard HEAD~1",
    );
    expect(s.files.has("x.txt")).toBe(false);
  });

  it("stash + pop round-trips dirty work", () => {
    const st = run(shell(), "git init", "git add .", "git commit -m Start", "echo wip >> README.md", "git stash");
    expect(st.stash.length).toBe(1);
    const popped = run(st, "git stash pop");
    expect(popped.stash.length).toBe(0);
    expect(popped.files.get("README.md")?.content).toContain("wip");
  });

  it("rebase replays commits and reports them", () => {
    const s = run(
      shell(),
      "git init",
      "git add .",
      "git commit -m Start",
      "git switch -c feature",
      "touch f.txt",
      "git add .",
      "git commit -m F1",
      "git switch main",
      "touch m.txt",
      "git add .",
      "git commit -m M1",
      "git switch feature",
    );
    const output = out(s, "git rebase main");
    expect(output).toContain("Successfully rebased feature onto main");
    const rebased = run(s, "git rebase main");
    expect(rebased.reflog.some((e) => e.message.includes("rebase onto main"))).toBe(true);
  });

  it("unknown git command produces the panda hint", () => {
    expect(out(shell(), "git frobnicate")).toContain("unknown git command");
  });
});
