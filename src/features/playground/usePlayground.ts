/**
 * Playground — React hooks.
 *
 * Thin adapters so UI components only ever read state and call store actions.
 * `usePlaygroundRepository` subscribes to the engine directly (via
 * useSyncExternalStore), so components re-render exactly when a command changes
 * the repository — never on unrelated state.
 */

import { useCallback, useSyncExternalStore } from "react";
import type { GitRepository, GitSimulation } from "@/lib/git";
import { usePlaygroundStore } from "./playgroundStore";

/** The engine instance backing the current lesson (null before mount). */
export function usePlaygroundEngine(): GitSimulation | null {
  return usePlaygroundStore((state) => state.engine);
}

/**
 * The current repository snapshot. Re-renders the component only when the
 * engine's state changes identity (i.e. after a real command).
 */
export function usePlaygroundRepository(): GitRepository | null {
  const engine = usePlaygroundEngine();
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!engine) return () => {};
      return engine.subscribe(listener);
    },
    [engine],
  );
  const getSnapshot = useCallback(() => engine?.getState() ?? null, [engine]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function usePlaygroundSession(): {
  lastCommand: string;
  lastOutput: ReturnType<GitSimulation["run"]>["output"] | null;
  history: string[];
} {
  const lastCommand = usePlaygroundStore((state) => state.lastCommand);
  const lastOutput = usePlaygroundStore((state) => state.lastOutput);
  const history = usePlaygroundStore((state) => state.history);
  return { lastCommand, lastOutput, history };
}
