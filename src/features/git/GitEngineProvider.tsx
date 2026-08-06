import type { ReactNode } from "react";
import { GitEngineContext } from "@/features/git/gitEngineContext";
import { gitSimulation } from "@/features/git/simulation";

/**
 * GitEngineProvider — exposes the Git State Engine to the whole app.
 *
 * Future interactive lessons (terminal, sandbox, visualizations) consume the
 * engine through `useGitEngine()` instead of importing the simulation
 * directly, keeping one source of truth. The engine itself stays React-free.
 */
export function GitEngineProvider({ children }: { children: ReactNode }) {
  return (
    <GitEngineContext.Provider value={gitSimulation}>
      {children}
    </GitEngineContext.Provider>
  );
}
