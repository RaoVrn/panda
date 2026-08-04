import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { LessonMode } from "@/stores/lessonModeStore";
import type { StepPlayer } from "./useStepPlayer";
import { StepControls } from "./StepControls";
import { cn } from "@/lib/utils";

export interface VizChromeProps {
  mode: LessonMode;
  player: StepPlayer;
  /** Label for the step indicator, e.g. "Step" or "Commit". */
  label?: string;
  /** Read mode: whether this visualization has started playing yet. */
  started?: boolean;
  className?: string;
}

/**
 * The chrome every visualization shares.
 *
 *  · Interactive: the full <StepControls> so the learner drives each step.
 *
 *  · Read: a calm documentary strip. Before it scrolls into view it waits
 *    quietly; while it plays it shows a pulsing "● Auto-playing" cue; once
 *    finished that becomes a single "↻ Replay" action. Nothing else.
 */
export function VizChrome({
  mode,
  player,
  label = "Step",
  started = true,
  className,
}: VizChromeProps) {
  if (mode === "interactive") {
    return <StepControls player={player} label={label} className={className} />;
  }

  const playing = started && player.playing;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-t border-border-subtle bg-base-subtle/30 px-4 py-2.5",
        className,
      )}
    >
      <motion.span
        className={cn("size-1.5 rounded-full", playing ? "bg-accent" : "bg-text-muted")}
        animate={playing ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
        transition={{ duration: 1.6, repeat: playing ? Infinity : 0, ease: "easeInOut" }}
        aria-hidden="true"
      />
      {playing ? (
        <span className="text-[11px] font-medium text-text-secondary">
          ● Auto-playing
        </span>
      ) : (
        <span className="text-[11px] text-text-muted">
          {started ? "Animation finished" : "Play on scroll"}
        </span>
      )}
      <span className="ml-auto">
        {!playing && (
          <button
            type="button"
            onClick={player.replay}
            aria-label="Replay animation"
            title="Replay"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium text-text-muted transition-colors hover:bg-base-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Replay
          </button>
        )}
      </span>
    </div>
  );
}