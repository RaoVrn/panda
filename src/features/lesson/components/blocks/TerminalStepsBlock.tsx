import type { ContentTerminalStepsBlock } from "@/content/schema";
import { InteractiveTerminal } from "@/features/lesson/components/interactive/InteractiveTerminal";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { useReportAi } from "@/stores/aiContextStore";

export function TerminalStepsBlock({
  block,
}: {
  block: ContentTerminalStepsBlock;
}) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.steps.length);

  const current = block.steps[player.step];
  useReportAi(
    {
      visualization: "Terminal",
      terminal: current?.command ?? undefined,
    },
    [player.step, current?.command],
  );

  return (
    <InteractiveTerminal
      steps={block.steps}
      prompt={block.prompt}
      title={block.title ?? "terminal"}
      player={player}
      mode={mode}
      seed={block.seed}
      seedId={block.seedId}
      setup={block.setup}
      remoteSetup={block.remoteSetup}
    />
  );
}