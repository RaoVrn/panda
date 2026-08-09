import { describe, expect, it } from "vitest";
import { createGitSimulation } from "@/lib/git";

function sim(files: Record<string, string> = { "README.md": "hi\n" }) {
  return createGitSimulation({ files, pwd: "~/project", initialized: true });
}

function run(s: ReturnType<typeof createGitSimulation>, ...cmds: string[]) {
  for (const c of cmds) s.run(c);
  return s;
}

describe("playground engine", () => {
  it("init then commit a file", () => {
    const s = run(sim(), "git init", "git add .", 'git commit -m "Start"');
    expect(s.getState().commits.length).toBe(1);
    expect(s.getState().head).toMatch(/^[0-9a-f]{7}$/);
  });

  it("add stages and commit snapshots", () => {
    const s = sim();
    run(s, "git init", "git add README.md");
    expect(s.getState().index.has("README.md")).toBe(true);
    run(s, 'git commit -m "Start"');
    expect(s.getState().index.size).toBe(0);
    expect(s.getState().commits[0]?.message).toBe("Start");
  });

  it("branch + switch + fast-forward merge", () => {
    const s = sim();
    run(s, "git init", "git add .", 'git commit -m "Start"', "git switch -c feature", "git switch main");
    expect(s.getState().branches.has("feature")).toBe(true);
    run(s, "git merge feature");
    expect(s.getState().reflog.some((e) => e.message.includes("merge feature"))).toBe(true);
  });

  it("reset --hard restores tree and moves HEAD", () => {
    const s = run(
      sim(),
      "git init",
      "git add .",
      'git commit -m "Start"',
      "touch junk.txt",
      "git add .",
      'git commit -m "Add junk"',
    );
    const before = s.getState().branches.get("main");
    run(s, "git reset --hard HEAD~1");
    const after = s.getState().branches.get("main");
    expect(after).not.toBe(before);
    expect(s.getState().workingTree.has("junk.txt")).toBe(false);
    expect(s.run("git status").output.text).toContain("nothing to commit");
  });

  it("reset --soft keeps the working tree and stages the diff", () => {
    const s = run(
      sim(),
      "git init",
      "git add .",
      'git commit -m "Start"',
      "touch junk.txt",
      "git add .",
      'git commit -m "Add junk"',
    );
    run(s, "git reset --soft HEAD~1");
    expect(s.getState().workingTree.has("junk.txt")).toBe(true);
    expect(s.getState().index.has("junk.txt")).toBe(true);
  });

  it("revert creates an undo commit and keeps history", () => {
    const s = run(
      sim({ "app.js": "a\n" }),
      "git init",
      "git add .",
      'git commit -m "Start"',
      'echo "b" >> app.js',
      "git add .",
      'git commit -m "Add bug"',
    );
    const before = s.getState().commits.length;
    run(s, "git revert HEAD");
    expect(s.getState().commits.length).toBe(before + 1);
    expect(s.getState().commits.at(-1)?.message).toBe('Revert "Add bug"');
  });

  it("stash then pop restores dirty work", () => {
    const s = run(sim(), "git init", "git add .", 'git commit -m "Start"', "touch wip.txt", "git add .");
    run(s, "git stash");
    expect(s.getState().stash.length).toBe(1);
    expect(s.getState().workingTree.has("wip.txt")).toBe(false);
    run(s, "git stash pop");
    expect(s.getState().stash.length).toBe(0);
    expect(s.getState().workingTree.has("wip.txt")).toBe(true);
  });

  it("cherry-pick copies a commit onto the current branch", () => {
    const s = run(
      sim(),
      "git init",
      "git add .",
      'git commit -m "Start"',
      "git switch -c feature",
      "touch fix.js",
      "git add .",
      'git commit -m "Fix bug"',
      "git switch main",
    );
    const fix = s.getState().commits.find((c) => c.message === "Fix bug");
    const before = s.getState().commits.length;
    run(s, `git cherry-pick ${fix?.hash ?? ""}`);
    expect(s.getState().commits.length).toBe(before + 1);
    expect(s.getState().workingTree.has("fix.js")).toBe(true);
  });

  it("rebase replays commits onto the target", () => {
    const s = run(
      sim(),
      "git init",
      "git add .",
      'git commit -m "Start"',
      "git switch -c feature",
      "touch f1.txt",
      "git add .",
      'git commit -m "F1"',
      "git switch main",
      "touch m1.txt",
      "git add .",
      'git commit -m "M1"',
      "git switch feature",
    );
    run(s, "git rebase main");
    const state = s.getState();
    expect(state.reflog.some((e) => e.message.includes("rebase onto main"))).toBe(true);
    expect(state.workingTree.has("f1.txt")).toBe(true);
    expect(state.workingTree.has("m1.txt")).toBe(true);
  });

  it("tag + checkout tag + push --tags", () => {
    const s = createGitSimulation({
      files: { "README.md": "hi\n" },
      pwd: "~/project",
      initialized: true,
      remote: { pwd: "github/x", initialized: true, files: {} },
    });
    run(s, "git init", "git add .", 'git commit -m "Start"', "git tag v1.0");
    expect(s.getState().tags.has("v1.0")).toBe(true);
    run(s, "git checkout v1.0");
    expect(s.getState().detached).toBe(true);
    run(s, "git switch main", "git push --tags");
    expect(s.getRemote()?.tags.has("v1.0")).toBe(true);
  });

  it("fetch then pull bring the remote's commits into the working tree", () => {
    const sim = createGitSimulation({
      files: { "README.md": "hi\n" },
      pwd: "~/project",
      initialized: true,
      remote: { pwd: "github/x", initialized: true, files: { "README.md": "hi\n" } },
    });
    run(sim, "git init", "git add .", 'git commit -m "Start"', "git remote add origin github/x");
    // Seed the remote with Start + a teammate commit.
    sim.runRemote("git add .");
    sim.runRemote('git commit -m "Start"');
    sim.runRemote("touch teammate.txt");
    sim.runRemote("git add .");
    sim.runRemote('git commit -m "Teammate adds file"');

    run(sim, "git fetch");
    expect(sim.getState().reflog.some((e) => e.message.includes("fetch:"))).toBe(true);
    expect(sim.getState().workingTree.has("teammate.txt")).toBe(false);
    run(sim, "git pull");
    expect(sim.getState().workingTree.has("teammate.txt")).toBe(true);
  });

  it("echo bare prints; echo redirect writes a file", () => {
    const s = sim();
    expect(s.run("echo hi").output.text).toBe("hi");
    expect(s.run('echo "hello world"').output.text).toBe("hello world");
    run(s, "echo note > n.txt");
    expect(s.getState().workingTree.has("n.txt")).toBe(true);
  });
});
