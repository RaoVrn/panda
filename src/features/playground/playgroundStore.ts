/**
 * Playground — shared store.
 *
 * One Git simulation per lesson. The store owns the ENGINE (created from the
 * lesson's playground config + optional setup script) and the command session
 * (history, last output, AI reporting). Components NEVER touch repository state
 * directly — they call `run` / `writeFile` / `deleteFile` / `renameFile`, which
 * all delegate to the engine. Repository snapshots are read through
 * `usePlaygroundRepository()` (a useSyncExternalStore adapter), so renders only
 * happen when a command actually changes state.
 *
 * Objectives latch: every time the engine reports a state change, objectives
 * whose checks pass are marked complete and stay complete until the sandbox is
 * reset (constraint objectives with `persist: false` are re-evaluated live).
 */

import { create } from "zustand";
import { createGitSimulation } from "@/lib/git";
import type { GitCommandOutput, GitEvent, GitSimulation } from "@/lib/git";
import type { ContentLesson, ContentLessonPlayground, ContentPlaygroundObjective } from "@/content/schema";
import { useAiContextStore } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { summarizeRepository } from "./summarize";
import { objectiveStatuses } from "./taskValidator";
import {
  AREA_HIGHLIGHT_MS,
  DEFAULT_EVENT_TOASTS,
  EVENT_AREA_MAP,
  TOAST_DURATION_MS,
  getErrorHint,
} from "./animations";

export interface PlaygroundToast {
  id: string;
  message: string;
  kind: "success" | "error" | "info";
}

let toastSeq = 0;
function nextToastId(): string {
  return `toast-${Date.now().toString(36)}-${(toastSeq++).toString(36)}`;
}

export interface PlaygroundState {
  /** Lesson whose sandbox is currently loaded. */
  lessonId: string;
  /** The engine backing the sandbox (null until mounted). */
  engine: GitSimulation | null;
  /** The playground config of the mounted lesson (for resets). */
  config: ContentLessonPlayground | null;
  lastCommand: string;
  lastOutput: GitCommandOutput | null;
  /** Full command history of this sandbox session (for AI context). */
  history: string[];
  /** Objective ids latched as complete (persist:true only). */
  completedObjectives: string[];
  /** Active explanation toasts. */
  toasts: PlaygroundToast[];
  /** Visualizer columns currently highlighted (driven by events). */
  activeAreas: string[];
  /** Event-unsubscribe callback (so store can clean up on unmount). */
  _unsubEvents: (() => void) | null;

  /** Create (or keep) this lesson's sandbox and run its setup script. */
  mount: (lesson: ContentLesson) => void;
  /** Run one command through the engine; returns its output. */
  run: (command: string) => GitCommandOutput;
  writeFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (from: string, to: string) => void;
  /** Reset the sandbox to the lesson's starting state. */
  resetLesson: () => void;
  /** Tear down the mounted sandbox (navigating away). */
  unmount: () => void;
  /** Remove a toast by id. */
  dismissToast: (id: string) => void;
}

function runSetup(engine: GitSimulation, setup: string[] | undefined): void {
  for (const command of setup ?? []) engine.run(command);
}

function runRemoteSetup(
  engine: GitSimulation,
  remoteSetup: string[] | undefined,
): void {
  for (const command of remoteSetup ?? []) engine.runRemote(command);
}

/** Latch objectives that just passed (persist:true). */
function latchObjectives(
  engine: GitSimulation,
  objectives: ContentPlaygroundObjective[],
  completed: string[],
): string[] {
  const statuses = objectiveStatuses(engine.getState(), objectives, engine.getRemote());
  const next = new Set(completed);
  for (const status of statuses) {
    const objective = objectives.find((o) => o.id === status.objectiveId);
    if (status.done && (objective?.persist ?? true)) next.add(status.objectiveId);
  }
  return [...next];
}

export const usePlaygroundStore = create<PlaygroundState>()((set, get) => {
  const report = (
    repo: Parameters<typeof summarizeRepository>[0],
    command?: string,
    output?: GitCommandOutput,
    history?: string[],
  ) => {
    useAiContextStore.getState().report({
      terminal: command,
      terminalState: summarizeRepository(repo, command, output, history),
    });
  };

  const syncTasks = () => {
    const { engine, config, completedObjectives } = get();
    if (!engine || !config) return;
    const next = latchObjectives(engine, config.objectives, completedObjectives);
    if (next.length !== completedObjectives.length) {
      set({ completedObjectives: next });
    }
  };

  return {
    lessonId: "",
    engine: null,
    config: null,
    lastCommand: "",
    lastOutput: null,
    history: [],
    completedObjectives: [],
    toasts: [],
    activeAreas: [],
    _unsubEvents: null,

    mount: (lesson) => {
      const current = get();
      if (current.lessonId === lesson.id && current.engine) return;
      if (!lesson.playground) return;

      // Unsubscribe previous event handler
      current._unsubEvents?.();

      const engine = createGitSimulation(lesson.playground.seed);
      runSetup(engine, lesson.playground.setup);
      runRemoteSetup(engine, lesson.playground.remoteSetup);

      // Subscribe to engine events → toasts + area highlights
      const unsub = engine.onEvent((event: GitEvent) => {
        const state = get();
        if (!state.config) return;

        // Only handle events from the CURRENT engine (ignore stragglers)
        const toastMessages = state.config.toasts;
        const areaKeys = EVENT_AREA_MAP[event.type];
        const message = toastMessages?.[event.type] ?? DEFAULT_EVENT_TOASTS[event.type];

        const updates: Partial<PlaygroundState> = {};

        if (message) {
          updates.toasts = [
            ...state.toasts,
            { id: nextToastId(), message, kind: "success" },
          ];
        }
        if (areaKeys && areaKeys.length > 0) {
          updates.activeAreas = areaKeys;
        }

        if (Object.keys(updates).length > 0) {
          set({ toasts: [...(updates.toasts ?? state.toasts)], activeAreas: [...(updates.activeAreas ?? state.activeAreas)] });
          if (updates.activeAreas) {
            window.setTimeout(() => {
              if (get().engine === engine) {
                set({ activeAreas: [] });
              }
            }, AREA_HIGHLIGHT_MS);
          }
        }

        // Auto-dismiss toasts
        if (message) {
          const toastId = updates.toasts?.[updates.toasts.length - 1]?.id;
          if (toastId) {
            window.setTimeout(() => {
              set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
            }, TOAST_DURATION_MS);
          }
        }
      });

      const completed = latchObjectives(engine, lesson.playground.objectives, []);
      report(engine.getState());
      set({
        lessonId: lesson.id,
        engine,
        config: lesson.playground,
        lastCommand: "",
        lastOutput: null,
        history: [],
        completedObjectives: completed,
        toasts: [],
        activeAreas: [],
        _unsubEvents: unsub,
      });
    },

    run: (command) => {
      const engine = get().engine;
      if (!engine) throw new Error("Playground: sandbox not mounted");
      const { output } = engine.run(command);
      const history = [...get().history, command];
      report(engine.getState(), command, output, history);
      useProgressStore.getState().recordCommand();

      // Error hint toast
      let additionalToasts: PlaygroundToast[] = [];
      if (output.kind === "error") {
        const hint = getErrorHint(output.text);
        if (hint) {
          additionalToasts = [{ id: nextToastId(), message: hint, kind: "error" }];
        }
      }

      set({
        lastCommand: command,
        lastOutput: output,
        history,
        toasts: [...get().toasts, ...additionalToasts],
      });

      // Auto-dismiss error hints
      if (additionalToasts.length > 0) {
        const id = additionalToasts[0]!.id;
        window.setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, TOAST_DURATION_MS);
      }

      syncTasks();
      return output;
    },

    writeFile: (path, content) => {
      const engine = get().engine;
      if (!engine) return;
      engine.writeFile(path, content);
      report(engine.getState(), `edit ${path}`);
      set({ lastCommand: `edit ${path}` });
      syncTasks();
    },

    deleteFile: (path) => {
      const engine = get().engine;
      if (!engine) return;
      engine.deleteFile(path);
      report(engine.getState(), `rm ${path}`);
      set({ lastCommand: `rm ${path}` });
      syncTasks();
    },

    renameFile: (from, to) => {
      const engine = get().engine;
      if (!engine) return;
      engine.renameFile(from, to);
      report(engine.getState(), `mv ${from} ${to}`);
      set({ lastCommand: `mv ${from} ${to}` });
      syncTasks();
    },

    resetLesson: () => {
      const engine = get().engine;
      const config = get().config;
      if (!engine || !config) return;
      engine.reset(config.seed);
      runSetup(engine, config.setup);
      runRemoteSetup(engine, config.remoteSetup);
      report(engine.getState());
      set({
        lastCommand: "",
        lastOutput: null,
        history: [],
        completedObjectives: [],
      });
      syncTasks();
    },

    /**
     * Called when the workspace unmounts (mode switch / navigation). The engine
     * and mission latch are KEPT so toggling Read ⇄ Interactive never wipes the
     * learner's sandbox — only the ephemeral command session is cleared.
     */
    unmount: () => {
      const current = get();
      if (current.lessonId === "") return;
      current._unsubEvents?.();
      set({
        lastCommand: "",
        lastOutput: null,
        history: [],
        toasts: [],
        activeAreas: [],
        _unsubEvents: null,
      });
    },

    dismissToast: (id) =>
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  };
});
