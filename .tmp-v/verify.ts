import { createGitSimulation } from "./src/lib/git/index";
import { objectiveStatuses } from "./src/features/playground/taskValidator";
import { getLesson } from "./src/content/lessons/index";

function verify(id: string) {
  const lesson = getLesson(id);
  if (!lesson) { console.log(`  ${id}: NOT FOUND`); return; }
  const pg = lesson.playground;
  if (!pg) { console.log(`  ${id}: no playground`); return; }
  const engine = createGitSimulation(pg.seed);
  for (const cmd of pg.setup ?? []) engine.run(cmd);
  for (const cmd of pg.solution) engine.run(cmd);
  const statuses = objectiveStatuses(engine.getState(), pg.objectives);
  const done = statuses.filter(s => s.done).length;
  console.log(`  ${id}: ${done}/${statuses.length} objectives after solution`);
}

console.log("New lesson playground verification:");
verify("git-rm");
verify("git-mv");
