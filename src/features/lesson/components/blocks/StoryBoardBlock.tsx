import type { ContentStoryboardBlock } from "@/content/schema";
import { StoryBoard } from "@/features/lesson/components/viz/StoryBoard";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { useReportAi } from "@/stores/aiContextStore";

export function StoryBoardBlock({ block }: { block: ContentStoryboardBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.nodes.length);

  const beat = block.nodes[player.step];
  useReportAi(
    {
      visualization: beat
        ? `${block.title ?? "Story"}: ${beat.text}`
        : (block.title ?? "Story"),
    },
    [player.step, block.title, beat?.text],
  );

  return <StoryBoard nodes={block.nodes} title={block.title} player={player} mode={mode} />;
}