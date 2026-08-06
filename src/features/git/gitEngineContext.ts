import { createContext, useContext } from "react";
import type { GitSimulation } from "@/lib/git";
import { gitSimulation } from "@/features/git/simulation";

/**
 * Git engine context. Future interactive lessons consume the engine through
 * `useGitEngine()` instead of importing the simulation directly.
 */
export const GitEngineContext = createContext<GitSimulation>(gitSimulation);

export function useGitEngine(): GitSimulation {
  return useContext(GitEngineContext);
}
