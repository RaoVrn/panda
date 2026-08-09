/**
 * Git State Engine  -  app singleton.
 *
 * A single, app-wide simulation instance seeded with the demo project so
 * visualizations and the AI have real state to read immediately. The engine
 * itself stays React-free; this file just holds one instance.
 */

import { createGitSimulation } from "@/lib/git";
import { createDemoRepository } from "@/lib/git/demo";

export const gitSimulation = createGitSimulation(createDemoRepository());
