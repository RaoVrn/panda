import { useEffect } from "react";
import { useParams } from "react-router-dom";
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

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const scroll = <ScrollToTop />;

  const lesson = slug ? getLessonBySlug(slug) : undefined;

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
      <LearningCanvas>
        <LessonRenderer
          lesson={lesson}
          previousLesson={previousLesson(lesson.id)}
          nextLesson={nextLesson(lesson.id)}
        />
      </LearningCanvas>
    </LearningWorkspace>
  );
}
