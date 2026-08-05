import type { ContentStageAreaBlock } from "@/content/schema";
import { StageArea } from "@/features/lesson/components/interactive/StageArea";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function StageAreaBlock({ block }: { block: ContentStageAreaBlock }) {
  const { mode } = useLessonMode();
  const readSteps = (block.readFiles?.length ?? 0) + 1;
  const player = useStepPlayer(Math.max(readSteps, 1));

  return (
    <StageArea
      block={block}
      player={player}
      mode={mode}
      key={block.id}
    />
  );
}
