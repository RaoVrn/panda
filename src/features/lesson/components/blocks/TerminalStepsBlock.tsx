import type { ContentTerminalStepsBlock } from "@/content/schema";
import { InteractiveTerminal } from "@/features/lesson/components/interactive/InteractiveTerminal";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function TerminalStepsBlock({
  block,
}: {
  block: ContentTerminalStepsBlock;
}) {
  const { mode } = useLessonMode();
  const player = useStepPlayer(block.steps.length);
  return (
    <InteractiveTerminal
      steps={block.steps}
      prompt={block.prompt}
      title={block.title ?? "terminal"}
      player={player}
      mode={mode}
    />
  );
}