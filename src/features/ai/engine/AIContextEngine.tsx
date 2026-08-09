import { useEffect, useMemo, useRef } from "react";
import { getLesson } from "@/content/lessons";
import { buildLessonStructure } from "@/features/ai/context/LessonContextBuilder";
import { useAiContextStore } from "@/stores/aiContextStore";

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

/**
 * AIContextEngine  -  lightweight live-state tracker.
 *
 * Everything the AI knows about the PAGE comes from the authored lesson data
 * (see LessonContextBuilder). This component only adds live hints: how far the
 * learner has scrolled (mapped to the structured headings), any highlighted
 * text, and how long they've been on the section. No DOM scraping for context.
 */
export function AIContextEngine({ lessonId }: { lessonId: string }) {
  const report = useAiContextStore((s) => s.report);
  const lesson = getLesson(lessonId);
  const structure = useMemo(
    () => (lesson ? buildLessonStructure(lesson) : null),
    [lesson],
  );
  const reportRef = useRef(report);
  reportRef.current = report;

  // Scroll → scroll % + the structured section it maps to.
  useEffect(() => {
    if (!structure) return;
    const article = document.getElementById(lessonId);
    if (!article) return;
    const scroller = getScrollParent(article);
    if (!scroller) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const top = scroller.scrollTop;
      const height = scroller.scrollHeight - scroller.clientHeight;
      const pct = height > 0 ? Math.min(100, Math.round((top / height) * 100)) : 0;
      reportRef.current({
        scrollPercent: pct,
        currentSection: structure.sectionAtProgress(pct),
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [lessonId, structure]);

  // Selection → highlighted text (only within the lesson article).
  useEffect(() => {
    const article = document.getElementById(lessonId);
    let timer: number | undefined;
    const onSelection = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const sel = window.getSelection();
        const text = sel && !sel.isCollapsed ? sel.toString().trim() : "";
        const inside =
          Boolean(article) &&
          Boolean(sel?.anchorNode) &&
          article!.contains(sel!.anchorNode);
        reportRef.current({
          selectedText: inside && text ? text.slice(0, 200) : undefined,
        });
      }, 120);
    };
    document.addEventListener("selectionchange", onSelection);
    return () => {
      document.removeEventListener("selectionchange", onSelection);
      window.clearTimeout(timer);
    };
  }, [lessonId]);

  // Time on section → nudges like "you've been here a while".
  useEffect(() => {
    let sectionStart = Date.now();
    let lastSection: string | undefined;
    const id = window.setInterval(() => {
      const ctx = useAiContextStore.getState().context;
      if (ctx.currentSection !== lastSection) {
        lastSection = ctx.currentSection;
        sectionStart = Date.now();
      }
      if (ctx.currentSection) {
        reportRef.current({
          timeOnSectionSeconds: Math.floor((Date.now() - sectionStart) / 1000),
        });
      }
    }, 10_000);
    return () => window.clearInterval(id);
  }, [lessonId]);

  // Clear live hints when leaving the lesson.
  useEffect(
    () => () => {
      reportRef.current({
        selectedText: undefined,
        timeOnSectionSeconds: undefined,
        scrollPercent: undefined,
        currentSection: undefined,
        terminalState: undefined,
      });
    },
    [lessonId],
  );

  return null;
}
