import type { ContentStoryboardBlock } from "@/content/schema";
import { StoryBoard } from "@/features/lesson/components/viz/StoryBoard";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function StoryBoardBlock({ block }: { block: ContentStoryboardBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.nodes.length);
  return <StoryBoard nodes={block.nodes} title={block.title} player={player} mode={mode} />;
}