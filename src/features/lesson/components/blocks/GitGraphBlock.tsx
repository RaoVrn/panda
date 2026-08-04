import type { ContentGitGraphBlock } from "@/content/schema";
import { GitGraph } from "@/features/lesson/components/interactive/GitGraph";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function GitGraphBlock({ block }: { block: ContentGitGraphBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.commits.length);
  return (
    <GitGraph commits={block.commits} title={block.title} player={player} mode={mode} />
  );
}