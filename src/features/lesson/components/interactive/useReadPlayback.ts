import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import type { StepPlayer } from "./useStepPlayer";

export interface ReadPlaybackOptions {
  /**
   * When provided, the hook auto-advances the player on this interval once the
   * visualization is in view. Omit it for self-advancing visualizations (e.g.
   * the typing terminal), which drive their own progression.
   */
  interval?: number;
}

export interface ReadPlayback {
  /** True once the visualization has scrolled into view in Read mode. */
  started: boolean;
  /** Ready to replay even if autoplay hasn't fired yet (used by the chrome). */
  canReplay: boolean;
}

/**
 * Read-mode autocue: when a visualization first scrolls into view it plays
 * itself once, then stays "done" so it never auto-plays again until the page
 * reloads. Interactive mode never auto-plays. Replay is always available.
 */
export function useReadPlayback(
  ref: RefObject<HTMLElement | null>,
  player: StepPlayer,
  { interval }: ReadPlaybackOptions = {},
): ReadPlayback {
  const { mode } = useLessonMode();
  const [started, setStarted] = useState(false);
  const hasAutoplayed = useRef(false);

  const start = useMemo(
    () => () => {
      if (hasAutoplayed.current) return;
      hasAutoplayed.current = true;
      setStarted(true);
      player.replay();
    },
    [player],
  );

  // In Read mode, fire once the container first enters the viewport.
  useEffect(() => {
    if (mode !== "read" || hasAutoplayed.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, ref, start]);

  // Optional interval autocue that advances until the end, then pauses.
  useEffect(() => {
    if (mode !== "read" || !started || interval === undefined) return;
    if (player.total <= 1) return;

    const id = window.setInterval(() => {
      if (player.isLast) {
        window.clearInterval(id);
        player.pause();
      } else {
        player.next();
      }
    }, interval);

    return () => window.clearInterval(id);
  }, [mode, started, interval, player, player.replayCount]);

  return { started, canReplay: started };
}