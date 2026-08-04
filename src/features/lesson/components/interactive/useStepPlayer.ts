import { useCallback, useMemo, useRef, useState } from "react";

export interface StepPlayer {
  /** Latest fully-initialised step index (0-based). */
  step: number;
  total: number;
  playing: boolean;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
  /** Increments on every replay(), so animations can re-run reliably. */
  replayCount: number;
  setStep: (index: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  /** Advance past the current step if auto is on, otherwise stop auto. */
  advance: () => void;
  toggle: () => void;
  play: () => void;
  /** Restart from step 0 and play. */
  replay: () => void;
  pause: () => void;
}

/**
 * The shared state machine behind every Panda visualisation (terminal, terminal
 * editor, git graph, timeline…). One hook, one set of controls — each viz only
 * supplies its steps and drives the timings of its own animation.
 *
 * Visualisations never hardcode their playback UI; they render <StepControls>
 * and call `advance()` when the current step's animation is finished.
 */
export function useStepPlayer(total: number, initialPlaying = false): StepPlayer {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(initialPlaying);
  const [replayCount, setReplayCount] = useState(0);
  const stepRef = useRef(step);
  stepRef.current = step;

  const next = useCallback(() => {
    setStep((value) => Math.min(value + 1, Math.max(total - 1, 0)));
  }, [total]);

  const prev = useCallback(() => {
    setStep((value) => Math.max(value - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);

  const play = useCallback(() => {
    if (stepRef.current >= total - 1) setStep(0);
    setPlaying(true);
  }, [total]);

  const replay = useCallback(() => {
    setStep(0);
    setPlaying(true);
    setReplayCount((value) => value + 1);
  }, []);

  const advance = useCallback(() => {
    if (stepRef.current < total - 1) {
      setStep(stepRef.current + 1);
    } else {
      setPlaying(false);
    }
  }, [total]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, pause, play]);

  const isFirst = step === 0;
  const isLast = step >= total - 1;
  const progress = total <= 0 ? 0 : Math.min(1, (step + 1) / total);

const value = useMemo<StepPlayer>(
    () => ({
      step,
      total,
      playing,
      isFirst,
      isLast,
      progress,
      replayCount,
      setStep,
      next,
      prev,
      reset,
      advance,
      toggle,
      play,
      replay,
      pause,
    }),
    [
      step,
      total,
      playing,
      isFirst,
      isLast,
      progress,
      replayCount,
      next,
      prev,
      reset,
      advance,
      toggle,
      play,
      replay,
      pause,
    ],
  );

  return value;
}