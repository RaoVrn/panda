import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getLessonBySlug,
  nextLesson,
  previousLesson,
} from "@/content/lessons";
import { LearningWorkspace } from "@/features/learning/layout/LearningWorkspace";
import { LearningCanvas } from "@/features/learning/layout/LearningCanvas";
import { LessonRenderer } from "@/features/lesson/LessonRenderer";
import { ScrollToTop } from "@/app/ScrollToTop";
import { useAiContextStore } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useAiChatStore } from "@/stores/aiChatStore";
import { useLessonModeStore } from "@/stores/lessonModeStore";

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scroll = <ScrollToTop />;

  const lesson = slug ? getLessonBySlug(slug) : undefined;

  // Deep link from search: /lesson/:slug?focus=<blockId> scrolls to that block.
  const focusId = searchParams.get("focus");
  useEffect(() => {
    if (!focusId || !lesson) return;
    const mode = useLessonModeStore.getState().mode;
    if (mode !== "read") useLessonModeStore.getState().setMode("read");
    const id = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-id="${focusId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => window.clearTimeout(id);
  }, [focusId, lesson]);

  // The interactive playground gets a wider canvas for its IDE workspace.
  const playgroundMode = useLessonModeStore((state) => state.mode) === "interactive";

  // Keyboard navigation: ← previous lesson, → next lesson. Never hijacks
  // typing inside inputs/textarea/contenteditable.
  useEffect(() => {
    if (!lesson) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        const previous = previousLesson(lesson.id);
        if (previous) navigate(`/lesson/${previous.slug}`);
      } else if (event.key === "ArrowRight") {
        const next = nextLesson(lesson.id);
        if (next) navigate(`/lesson/${next.slug}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lesson, navigate]);

  // Panda AI context is lesson-scoped: clear it when moving between lessons
  // (and when leaving the lesson for the course page).
  const resetAiContext = useAiContextStore((state) => state.reset);
  const clearAiChat = useAiChatStore((state) => state.clear);
  const startLesson = useProgressStore((state) => state.startLesson);

  useEffect(() => {
    resetAiContext();
    // Conversation history is lesson-scoped. Never let an answer about one
    // lesson become evidence for another lesson.
    clearAiChat();
    if (lesson) startLesson(lesson.id);
    return resetAiContext;
  }, [slug, lesson, resetAiContext, clearAiChat, startLesson]);

  if (!lesson) {
    return (
      <LearningWorkspace>
        {scroll}
        <LearningCanvas>
          <p className="text-text-secondary">
            We couldn’t find the lesson “{slug}”.
          </p>
        </LearningCanvas>
      </LearningWorkspace>
    );
  }

  return (
    <LearningWorkspace>
      {scroll}
      <LearningCanvas wide={playgroundMode && Boolean(lesson.playground)}>
        <LessonRenderer
          lesson={lesson}
          previousLesson={previousLesson(lesson.id)}
          nextLesson={nextLesson(lesson.id)}
        />
      </LearningCanvas>
    </LearningWorkspace>
  );
}
