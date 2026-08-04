import { useParams } from "react-router-dom";
import { course } from "@/content/roadmap";
import { lessonOf, nextLesson, previousLesson } from "@/lib/course";
import { NotFoundError } from "@/lib/errors";
import { LearningWorkspace } from "@/features/learning/layout/LearningWorkspace";
import { LearningCanvas } from "@/features/learning/layout/LearningCanvas";
import { LessonRenderer } from "@/features/learning/components/LessonRenderer";
import { ScrollToTop } from "@/app/ScrollToTop";

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const scroll = <ScrollToTop />;

  if (!slug) {
    return (
      <LearningWorkspace>
        {scroll}
        <LearningCanvas>
          <p className="text-text-secondary">No lesson selected.</p>
        </LearningCanvas>
      </LearningWorkspace>
    );
  }

  let lesson;
  try {
    lesson = lessonOf(course, slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
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
    throw error;
  }

  return (
    <LearningWorkspace>
      {scroll}
      <LearningCanvas>
        <LessonRenderer
          lesson={lesson}
          previousLesson={previousLesson(course, lesson.meta.id)}
          nextLesson={nextLesson(course, lesson.meta.id)}
        />
      </LearningCanvas>
    </LearningWorkspace>
  );
}