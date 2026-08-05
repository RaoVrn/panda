import type { ContentGitGraphBlock } from "@/content/schema";
import { GitGraph } from "@/features/lesson/components/interactive/GitGraph";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { useReportAi } from "@/stores/aiContextStore";

export function GitGraphBlock({ block }: { block: ContentGitGraphBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.commits.length);

  const ordered = [...block.commits].reverse();
  const active = ordered[player.step];

  useReportAi(
    {
      visualization: block.title ?? "Git history timeline",
      gitGraph: active?.message ? `"${active.message}"` : undefined,
    },
    [player.step, block.title, active?.message],
  );

  return (
    <GitGraph commits={block.commits} title={block.title} player={player} mode={mode} />
  );
}