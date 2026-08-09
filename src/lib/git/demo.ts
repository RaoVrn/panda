/**
 * Git State Engine  -  demo repository.
 *
 * A ready-made project so visualizations and the AI have something real to
 * read immediately: an initialized repo with history, a staged change, an
 * unstaged change and an untracked file.
 */

import { createGitSimulation } from "./index";
import type { GitRepository } from "./types";

const PROJECT_FILES: Record<string, string> = {
  "README.md": "# Panda Project\n\nLearn Git, made visual.\n",
  "package.json": JSON.stringify({ name: "panda-project", private: true }, null, 2) + "\n",
  "src/main.ts": "import { App } from './App';\n\nconsole.log('Panda is ready');\n",
  "src/App.tsx": "export function App() {\n  return <h1>Hello Panda</h1>;\n}\n",
};

export function createDemoRepository(): GitRepository {
  const sim = createGitSimulation({ pwd: "~/project", files: PROJECT_FILES });

  sim.run("git init");
  sim.run("git add .");
  sim.run('git commit -m "Initial commit"');

  sim.run('echo "export function App() {\n  return <h1>Hello Panda!</h1>;\n}" > src/App.tsx');
  sim.run("git add src/App.tsx");
  sim.run('git commit -m "Add App component"');

  // A live, unstaged change so `git status` / `git diff` show something.
  sim.run('echo "# Panda Project\n\nLearn Git, made visual. Now with a subtitle.\n" > README.md');
  // An untracked file.
  sim.run('echo "notes about git restore" > notes.txt');

  return sim.getState();
}
