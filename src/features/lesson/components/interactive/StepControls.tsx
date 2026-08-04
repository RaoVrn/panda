import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Undo2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { StepPlayer } from "./useStepPlayer";
import { cn } from "@/lib/utils";

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors",
        "hover:bg-base-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        "disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export interface StepControlsProps extends ComponentProps<"div"> {
  player: StepPlayer;
  /** Label for the segment indicator, e.g. "Step" or "Question". */
  label?: string;
}

/**
 * Shared playback controls for every visualisation: Previous / Next, an
 * auto-play toggle, Replay, Reset, speed, and a progress indicator. Identical
 * everywhere so a learner only learns one control pattern.
 */
export function StepControls({
  player,
  label = "Step",
  className,
  ...props
}: StepControlsProps) {
  const { step, total, progress, isFirst, isLast, playing } = player;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-border-subtle bg-base-subtle/30 px-4 py-3 sm:flex-row sm:items-center",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        <IconBtn label="Previous" disabled={isFirst && !playing} onClick={player.prev}>
          <SkipBack className="size-3.5" aria-hidden="true" />
        </IconBtn>
        <IconBtn
          label={playing ? "Pause" : "Play"}
          onClick={player.toggle}
        >
          {playing ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
        </IconBtn>
        <IconBtn label="Next" disabled={isLast && !playing} onClick={player.next}>
          <SkipForward className="size-3.5" aria-hidden="true" />
        </IconBtn>
      </div>

      <div
        className="order-first w-full sm:order-none sm:w-auto sm:flex-1"
        role="group"
        aria-label={label}
      >
        <div className="flex items-center justify-between gap-3 sm:justify-center">
          <span className="shrink-0 text-xs tabular-nums text-text-muted">
            {label} {Math.min(step + 1, total)} of {total}
          </span>
          <motion.span
            className="h-1 flex-1 overflow-hidden rounded-full bg-base-subtle sm:max-w-[140px]"
            role="progressbar"
            aria-label={`${label} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <motion.span
              className="block h-full rounded-full bg-accent"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <IconBtn label="Reset" disabled={isFirst} onClick={player.reset}>
          <Undo2 className="size-3.5" aria-hidden="true" />
        </IconBtn>
        <IconBtn label="Replay" onClick={player.replay}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </IconBtn>
      </div>
    </div>
  );
}