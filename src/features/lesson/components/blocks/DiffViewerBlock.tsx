import type { ContentDiffViewerBlock } from "@/content/schema";
import { DiffViewer } from "@/features/lesson/components/interactive/DiffViewer";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function DiffViewerBlock({ block }: { block: ContentDiffViewerBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(Math.max(block.rows.length, 1));

  return (
    <DiffViewer
      title={block.title}
      filename={block.filename}
      rows={block.rows}
      player={player}
      mode={mode}
    />
  );
}
