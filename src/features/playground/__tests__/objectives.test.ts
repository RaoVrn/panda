import { describe, expect, it } from "vitest";
import { createGitSimulation } from "@/lib/git";
import {
  evaluateCheck,
  objectiveStatuses,
} from "@/features/playground/taskValidator";
import type { ContentPlaygroundObjective } from "@/content/schema";

function makeRepo() {
  const sim = createGitSimulation({
    files: { "README.md": "hi\n" },
    pwd: "~/project",
    initialized: true,
  });
  return sim;
}

describe("objective logic", () => {
  it("ranCommand objective is false without the command and true with it", () => {
    const repo = makeRepo().getState();
    expect(evaluateCheck(repo, { kind: "ranCommand", contains: "git add" }, null, [])).toBe(false);
    expect(
      evaluateCheck(repo, { kind: "ranCommand", contains: "git add" }, null, [
        "git add README.md",
      ]),
    ).toBe(true);
  });

  it("state objectives reflect the live repository", () => {
    const sim = makeRepo();
    expect(evaluateCheck(sim.getState(), { kind: "fileExists", path: "README.md" }, null, [])).toBe(true);
    expect(evaluateCheck(sim.getState(), { kind: "fileExists", path: "nope.txt" }, null, [])).toBe(false);
  });

  it("objectiveStatuses: nothing complete at mount, all complete after the solution", () => {
    const sim = makeRepo();
    const objectives: ContentPlaygroundObjective[] = [
      {
        id: "add",
        label: "Stage the file",
        checks: [
          { kind: "fileExists", path: "README.md" },
          { kind: "ranCommand", contains: "git add" },
        ],
      },
      {
        id: "commit",
        label: "Commit it",
        checks: [{ kind: "anyCommitMessage", message: "Start" }],
      },
    ];

    const mount = objectiveStatuses(sim.getState(), objectives, sim.getRemote(), []);
    expect(mount.every((s) => !s.done)).toBe(true);

    const history: string[] = [];
    for (const c of ["git add README.md", 'git commit -m "Start"']) {
      sim.run(c);
      history.push(c);
    }
    const after = objectiveStatuses(sim.getState(), objectives, sim.getRemote(), history);
    expect(after.every((s) => s.done)).toBe(true);
  });

  it("action objective cannot be satisfied by state alone when gated by ranCommand", () => {
    const sim = makeRepo();
    const objectives: ContentPlaygroundObjective[] = [
      {
        id: "inspect",
        label: "Inspect the remote",
        checks: [
          { kind: "remoteExists", name: "origin" },
          { kind: "ranCommand", contains: "git remote -v" },
        ],
      },
    ];
    // Remote exists (state true) but the command was never run.
    sim.run("git remote add origin github/x");
    const done = objectiveStatuses(sim.getState(), objectives, sim.getRemote(), []);
    expect(done.every((s) => !s.done)).toBe(true);
  });

  it("constraint objective (persist:false) evaluates live", () => {
    const sim = makeRepo();
    const objectives: ContentPlaygroundObjective[] = [
      {
        id: "leave-out",
        label: "Leave notes.txt untracked",
        persist: false,
        checks: [{ kind: "fileUntracked", path: "notes.txt" }],
      },
    ];
    // True at mount (nothing staged)...
    expect(objectiveStatuses(sim.getState(), objectives, sim.getRemote(), [])[0]?.done).toBe(true);
    // ...and false once the file is staged.
    sim.run("touch notes.txt");
    sim.run("git add .");
    expect(objectiveStatuses(sim.getState(), objectives, sim.getRemote(), [])[0]?.done).toBe(false);
  });
});
