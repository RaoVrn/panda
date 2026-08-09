/**
 * Git State Engine  -  reusable React hooks.
 *
 * Thin adapters over the engine provided by <GitEngineProvider>. The UI only
 * ever RENDERS state; all Git logic lives in `src/lib/git`.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useGitEngine } from "@/features/git/gitEngineContext";
import { statusRows } from "@/lib/git";
import type {
  GitCommandOutput,
  GitCommit,
  GitEvent,
  GitFileStatus,
  GitRepository,
} from "@/lib/git";

/** The current repository snapshot (re-renders on every command). */
export function useGitRepository(): GitRepository {
  const engine = useGitEngine();
  const subscribe = useCallback(
    (listener: () => void) => engine.subscribe(listener),
    [engine],
  );
  const getSnapshot = useCallback(() => engine.getState(), [engine]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Derived status rows: every path with its tracked/staged/modified state. */
export function useGitStatus(): GitFileStatus[] {
  const repo = useGitRepository();
  return useMemo(() => statusRows(repo), [repo]);
}

/** History + refs for timelines and branch graphs. */
export function useGitHistory(): {
  commits: GitCommit[];
  head: string | null;
  branch: string;
} {
  const repo = useGitRepository();
  return useMemo(
    () => ({ commits: repo.commits, head: repo.head, branch: repo.branch }),
    [repo],
  );
}

/** A stable runner for terminal / sandbox inputs. */
export function useGitCommand(): (
  command: string,
) => { output: GitCommandOutput; events: GitEvent[] } {
  const engine = useGitEngine();
  return useCallback((command) => engine.run(command), [engine]);
}
