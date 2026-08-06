import { useMemo, type ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  useLessonModeStore,
} from "@/stores/lessonModeStore";
import {
  LessonModeContext,
  LessonIdContext,
  type LessonModeValue,
} from "@/features/lesson/lessonModeContext";
import { LessonModeToggle } from "@/features/lesson/components/LessonModeToggle";
import { useReadingStore } from "@/stores/readingStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { ViewportObserver } from "@/features/ai/context/ViewportObserver";

function getScrollParent(node: Element | null): Element | null {
  let el = node;
  while (el) {
    const { overflowY, overflow } = getComputedStyle(el);
    if (/(auto|scroll)/.test(overflowY) || (/(auto|scroll)/.test(overflow) && el.scrollHeight > el.clientHeight)) {
      return el;
    }
    el = el.parentElement as Element | null;
  }
  return null;
}

export interface LessonPlayerProps {
  lessonId: string;
  totalBlocks: number;
  children: ReactNode;
}

/**
 * The "player" chrome around a lesson, like a video player: it remembers the
 * exact scroll position, watches which blocks have been visited, and shows a
 * thin read-progress bar. State persists locally and is ready to sync later.
 */
export function LessonPlayer({ lessonId, totalBlocks, children }: LessonPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef<string | null>(null);
  const { readings, setScroll, markVisited } = useReadingStore();
  const reading = readings[lessonId];
  const { mode, setMode } = useLessonModeStore();

  // Interactive mode is one of the lesson's completion gates, so record that
  // the learner explored it.
  const markInteractive = useProgressStore((state) => state.markInteractive);
  useEffect(() => {
    if (mode === "interactive") markInteractive(lessonId);
  }, [mode, lessonId, markInteractive]);

  const modeValue = useMemo<LessonModeValue>(
    () => ({ mode, setMode }),
    [mode, setMode],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = getScrollParent(root);
    if (!scroller) return;

    // Restore the saved position exactly once per lesson.
    if (restoredRef.current !== lessonId) {
      restoredRef.current = lessonId;
      scroller.scrollTop = readings[lessonId]?.scroll ?? 0;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScroll(lessonId, scroller.scrollTop);
        ticking = false;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.blockId;
            if (id) markVisited(lessonId, id);
          }
        }
      },
      { root: scroller, threshold: 0.2 },
    );

    scroller.addEventListener("scroll", onScroll);
    root.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) =>
      observer.observe(el),
    );

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const pct =
    totalBlocks <= 0 ? 0 : Math.min(100, Math.round(((reading?.visited.length ?? 0) / totalBlocks) * 100));

  return (
    <LessonIdContext.Provider value={lessonId}>
      <LessonModeContext.Provider value={modeValue}>
        <ViewportObserver lessonId={lessonId} />
        <div ref={rootRef} className="relative">
          <div className="sticky top-0 z-20 mb-6 border-b border-border-subtle bg-base/85 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 px-1 py-2">
              <p className="text-xs text-text-muted">
                {mode === "read" ? "Read" : "Interactive"} mode
                <span aria-hidden="true" className="mx-2 text-border-strong">
                  ·
                </span>
                <span className="tabular-nums">{pct}% read</span>
              </p>
              <LessonModeToggle mode={mode} onChange={setMode} />
            </div>
            <div className="h-0.5 w-full bg-transparent" aria-hidden="true">
              <div
                className="h-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={`Lesson read ${pct}%`}
          >
            {/* Keying by mode cross-fades Read ⇄ Playground without a flash. */}
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </LessonModeContext.Provider>
    </LessonIdContext.Provider>
  );
}