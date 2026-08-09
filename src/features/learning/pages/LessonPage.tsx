import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";
import {
  getLessonBySlug,
  moduleLessons,
} from "@/content/lessons";
import { moduleOfLesson, nextModule } from "@/content/curriculum";
import { LearningWorkspace } from "@/features/learning/layout/LearningWorkspace";
import { LearningCanvas } from "@/features/learning/layout/LearningCanvas";
import { LessonRenderer } from "@/features/lesson/LessonRenderer";
import { type LessonNavTarget } from "@/features/lesson/components/LessonNav";
import { ScrollToTop } from "@/app/ScrollToTop";
import { useAiContextStore } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useAiChatStore } from "@/stores/aiChatStore";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { Button } from "@/components/ui/Button";

/**
 * Lesson page. The lesson is resolved deterministically from the URL slug:
 * a slug always maps to exactly one lesson. Previous/next navigation is
 * module-scoped (at module boundaries it goes back to the module or forward
 * to the next module), never a random selection.
 */
export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scroll = <ScrollToTop />;

  const lesson = slug ? getLessonBySlug(slug) : undefined;

  // Deep link from search: /lesson/:slug?focus=<blockId> scrolls to that block.
  // ?mode=interactive opens the playground directly (Panda AI "Playground").
  const focusId = searchParams.get("focus");
  const modeParam = searchParams.get("mode");
  useEffect(() => {
    if (modeParam === "interactive") {
      useLessonModeStore.getState().setMode("interactive");
    }
  }, [modeParam]);
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

  // Module-scoped previous / next, resolved to exact destinations.
  const nav = useMemo<{ previous?: LessonNavTarget; next?: LessonNavTarget }>(() => {
    if (!lesson) return {};
    const module = moduleOfLesson(lesson.id);
    const moduleLessonList = module ? moduleLessons(module.id) : [];
    const index = moduleLessonList.findIndex((l) => l.id === lesson.id);
    const result: { previous?: LessonNavTarget; next?: LessonNavTarget } = {};
    if (index > 0) {
      const prev = moduleLessonList[index - 1]!;
      result.previous = { title: prev.title, to: `/lesson/${prev.slug}` };
    } else if (module) {
      result.previous = { title: "Back to module", to: `/module/${module.id}` };
    }
    if (index >= 0 && index < moduleLessonList.length - 1) {
      const next = moduleLessonList[index + 1]!;
      result.next = { title: next.title, to: `/lesson/${next.slug}` };
    } else if (module) {
      const following = nextModule(module.id);
      if (following) {
        result.next = { title: `Next: ${following.title}`, to: `/module/${following.id}` };
      }
    }
    return result;
  }, [lesson]);

  // Keyboard navigation: ← / → within the module. Never hijacks typing.
  const prevTo = nav.previous?.to;
  const nextTo = nav.next?.to;
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
      if (event.key === "ArrowLeft" && prevTo) navigate(prevTo);
      else if (event.key === "ArrowRight" && nextTo) navigate(nextTo);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lesson, prevTo, nextTo, navigate]);

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
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-base-subtle text-text-muted">
              <SearchX className="size-6" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-text">Lesson not found</h1>
            <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
              This lesson may have moved or no longer exists.
            </p>
            <Link to="/dashboard">
              <Button variant="secondary" leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}>
                Back to dashboard
              </Button>
            </Link>
          </div>
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
          previous={nav.previous}
          next={nav.next}
        />
      </LearningCanvas>
    </LearningWorkspace>
  );
}
