import type { ContentGitVsGithubBlock } from "@/content/schema";
import { GitVsGithub } from "@/features/lesson/components/viz/GitVsGithub";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { useReportAi } from "@/stores/aiContextStore";

export function GitVsGithubBlock({ block }: { block: ContentGitVsGithubBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(4);

  useReportAi(
    { visualization: `Git vs GitHub, step ${player.step + 1} of 4` },
    [player.step],
  );

  return <GitVsGithub title={block.title} player={player} mode={mode} />;
}