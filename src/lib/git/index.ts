/**
 * Git State Engine — entry point.
 *
 * `createGitSimulation()` returns a self-contained, React-free repository
 * runner: it holds the current state, runs commands immutably, and emits both
 * state-change notifications and granular events (for future animations).
 *
 *   const sim = createGitSimulation(demoRepository());
 *   sim.run("git add README.md");          // → { output, events }
 *   sim.onEvent((e) => ...);               // FILE_STAGED, COMMIT_CREATED …
 *   const snapshot = sim.getState();       // for rendering
 */

import { GitEventEmitter } from "./events";
import {
  cloneRepository,
  createRepository,
  deleteFromWorkingTree,
  writeWorkingTree,
  type CreateRepositoryOptions,
} from "./repository";
import { runCommand } from "./commands";
import type {
  GitCommandOutput,
  GitEvent,
  GitRepository,
} from "./types";
import { createEvent } from "./events";

export interface GitSimulation {
  /** Current repository snapshot (stable until the next command). */
  getState(): GitRepository;
  /** The remote repository (the simulated GitHub), if one exists. */
  getRemote(): GitRepository | null;
  /** Run a command against the remote repository (used to seed/setup the remote). */
  runRemote(command: string): void;
  /**
   * Run a command. Immutable: `getState()` returns the NEW state afterwards.
   * Returns the events emitted and the human-readable output.
   */
  run(command: string): { output: GitCommandOutput; events: GitEvent[] };
  /** Subscribe to state changes (for React's useSyncExternalStore). */
  subscribe(listener: () => void): () => void;
  /** Subscribe to granular events (animations, AI, telemetry). */
  onEvent(listener: (event: GitEvent) => void): () => void;
  /** Reset the repository to a fresh (optionally seeded) state. */
  reset(options?: CreateRepositoryOptions | GitRepository): void;
  /** Write (create or overwrite) a working-tree file. */
  writeFile(path: string, content: string): void;
  /** Delete a working-tree file. */
  deleteFile(path: string): void;
  /** Rename / move a working-tree file (and keep it staged if it was). */
  renameFile(from: string, to: string): void;
}

function isRepository(value: unknown): value is GitRepository {
  return Boolean(value) && typeof value === "object" && "workingTree" in (value as object);
}

export function createGitSimulation(
  initial?: CreateRepositoryOptions | GitRepository,
): GitSimulation {
  const opts = initial && !isRepository(initial) ? (initial as CreateRepositoryOptions) : undefined;
  let state: GitRepository = initial && isRepository(initial)
    ? cloneRepository(initial)
    : createRepository(initial as CreateRepositoryOptions | undefined);
  let remote: GitRepository | null = opts?.remote
    ? createRepository(opts.remote)
    : null;
  const listeners = new Set<() => void>();
  const emitter = new GitEventEmitter();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    getState: () => state,

    getRemote: () => remote,

    runRemote: (command) => {
      if (!remote) return;
      const result = runCommand(remote, command);
      remote = result.state;
    },

    run: (command) => {
      const result = runCommand(state, command, remote ?? undefined);
      state = result.state;
      if (result.remote) remote = result.remote;
      for (const event of result.events) emitter.emit(event);
      notify();
      return { output: result.output, events: result.events };
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    onEvent: (listener) => emitter.on(listener),

    reset: (options) => {
      state = options && isRepository(options)
        ? cloneRepository(options)
        : createRepository(options as CreateRepositoryOptions | undefined);
      const opts = options && !isRepository(options) ? (options as CreateRepositoryOptions) : undefined;
      remote = opts?.remote ? createRepository(opts.remote) : null;
      emitter.emit({ type: "VISUALIZATION_UPDATED", path: undefined, id: `reset-${Date.now()}`, timestamp: Date.now() });
      notify();
    },

    writeFile: (path, content) => {
      const existed = state.workingTree.has(path);
      const next = cloneRepository(state);
      writeWorkingTree(next, path, content);
      state = next;
      emitter.emit(createEvent(existed ? "FILE_MODIFIED" : "FILE_ADDED", path));
      emitter.emit(createEvent("STATUS_CHANGED"));
      notify();
    },

    deleteFile: (path) => {
      const next = cloneRepository(state);
      deleteFromWorkingTree(next, path);
      state = next;
      emitter.emit(createEvent("FILE_DELETED", path));
      emitter.emit(createEvent("STATUS_CHANGED"));
      notify();
    },

    renameFile: (from, to) => {
      if (from === to) return;
      const next = cloneRepository(state);
      const file = next.workingTree.get(from);
      if (!file) return;
      deleteFromWorkingTree(next, from);
      if (next.index.has(from)) {
        next.index.delete(from);
        next.index.add(to);
      }
      writeWorkingTree(next, to, file.content);
      state = next;
      emitter.emit(createEvent("FILE_DELETED", from));
      emitter.emit(createEvent("FILE_ADDED", to));
      emitter.emit(createEvent("STATUS_CHANGED"));
      notify();
    },
  };
}

export * from "./types";
export * from "./events";
export {
  createRepository,
  cloneRepository,
  fileStatusOf,
  statusRows,
  statusPaths,
  writeWorkingTree,
  deleteFromWorkingTree,
  stagePath,
  unstagePath,
  shortHash,
  buildCommit,
  isIgnored,
} from "./repository";
export { runCommand } from "./commands";
export type { CreateRepositoryOptions };
export { createDemoRepository } from "./demo";
