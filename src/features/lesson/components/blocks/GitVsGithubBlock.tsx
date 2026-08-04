import type { ContentGitVsGithubBlock } from "@/content/schema";
import { GitVsGithub } from "@/features/lesson/components/viz/GitVsGithub";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function GitVsGithubBlock({ block }: { block: ContentGitVsGithubBlock }) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(4);
  return <GitVsGithub title={block.title} player={player} mode={mode} />;
}