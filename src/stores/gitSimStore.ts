/**
 * The shared Git simulation store.
 *
 * One repository per lesson. Every interactive element  -  the terminal sandbox,
 * the staging-area visualization, the branch graph  -  reads from and drives the
 * same state here, so `git add` typed in the terminal is instantly visible in
 * the staging area, and clicking a file to stage it shows up in `git status`.
 *
 * `sync` is called on mount by each interactive block. It resets the repo only
 * when the lesson (or the block's seed id) changes, so the first block in a
 * lesson establishes the starting files and later blocks continue from there.
 */

import { create } from "zustand";
import {
  createGitState,
  editFile,
  runCommand,
  type CommandOutput,
  type GitState,
} from "@/features/lesson/components/interactive/gitEngine";
import { summarizeGitState } from "@/features/ai/context/SandboxContext";
import { useAiContextStore } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";

export interface GitSimSeed {
  files?: Record<string, string>;
  pwd?: string;
  initialized?: boolean;
}

interface GitSimState {
  /** Lesson whose repository is currently loaded. */
  lessonId: string;
  /** Id of the block that last seeded the repository. */
  seedId: string;
  state: GitState;
  lastOutput: CommandOutput | null;
  lastCommand: string;
  history: string[];
  /** Ensure this lesson's repo exists (reset only on lesson/seed change). */
  sync: (lessonId: string, seedId: string, seed?: GitSimSeed) => void;
  /** Run one command against the shared repo; returns its output. */
  run: (command: string) => CommandOutput;
  /** Edit a working-tree file directly (used by editors). */
  writeFile: (path: string, content: string) => void;
  resetAll: () => void;
}

export const useGitSimStore = create<GitSimState>()((set, get) => ({
  lessonId: "",
  seedId: "",
  state: createGitState(),
  lastOutput: null,
  lastCommand: "",
  history: [],

  sync: (lessonId, seedId, seed) => {
    const current = get();
    if (current.lessonId === lessonId && current.seedId === seedId) return;
    const state = createGitState({
      files: seed?.files,
      pwd: seed?.pwd,
      initialized: seed?.initialized,
    });
    useAiContextStore.getState().report({
      terminalState: summarizeGitState(state),
    });
    set({ lessonId, seedId, state, lastOutput: null, lastCommand: "", history: [] });
  },

  run: (command) => {
    const result = runCommand(get().state, command);
    const history = [...get().history, command];
    useAiContextStore.getState().report({
      terminal: command,
      terminalState: summarizeGitState(result.state, command, result.output, history),
    });
    // Activity tracking: count every command the learner runs.
    useProgressStore.getState().recordCommand();
    set({
      state: result.state,
      lastOutput: result.output,
      lastCommand: command,
      history,
    });
    return result.output;
  },

  writeFile: (path, content) => {
    const state = editFile(get().state, path, content);
    useAiContextStore.getState().report({
      editor: `editing ${path}`,
      terminalState: summarizeGitState(state, get().lastCommand, get().lastOutput ?? undefined, get().history),
    });
    set({ state });
  },

  resetAll: () =>
    set({
      lessonId: "",
      seedId: "",
      state: createGitState(),
      lastOutput: null,
      lastCommand: "",
      history: [],
    }),
}));

/** Convenience hook: subscribe to the shared repo state and run commands. */
export function useGitSim(): {
  state: GitState;
  run: (command: string) => CommandOutput;
} {
  const state = useGitSimStore((s) => s.state);
  const run = useGitSimStore((s) => s.run);
  return { state, run };
}
