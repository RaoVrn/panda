import type { ContentBranchGraphBlock } from "@/content/schema";
import { BranchGraph } from "@/features/lesson/components/interactive/BranchGraph";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function BranchGraphBlock({ block }: { block: ContentBranchGraphBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.steps.length);

  return (
    <BranchGraph
      title={block.title}
      baseBranch={block.baseBranch}
      steps={block.steps}
      player={player}
      mode={mode}
    />
  );
}
