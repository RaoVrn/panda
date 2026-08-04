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

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const scroll = <ScrollToTop />;

  const lesson = slug ? getLessonBySlug(slug) : undefined;

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