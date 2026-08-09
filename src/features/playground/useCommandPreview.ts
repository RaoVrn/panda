import { useMemo } from "react";
import type { ContentLesson } from "@/content/schema";
import { createGitSimulation } from "@/lib/git";

export interface CommandPreview {
  command: string;
  output: string;
  kind: "success" | "error" | "muted" | "output";
}

/**
 * Real output for a preview command: runs the playground's setup script plus a
 * chosen command against a throwaway engine, so read-mode mini terminals show
 * the actual repository response  -  never a fake.
 */
export function useCommandPreview(lesson: ContentLesson, commandIndex = 0): CommandPreview | null {
  return useMemo(() => {
    const playground = lesson.playground;
    if (!playground) return null;
    const command = playground.solution[commandIndex];
    if (!command) return null;

    const engine = createGitSimulation(playground.seed);
    for (const cmd of playground.setup ?? []) engine.run(cmd);
    const { output } = engine.run(command);
    return { command, output: output.text, kind: output.kind };
  }, [lesson, commandIndex]);
}
