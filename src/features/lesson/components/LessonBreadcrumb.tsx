import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentLesson } from "@/content/schema";
import { courseOfLesson, moduleOfLesson } from "@/content/curriculum";

/**
 * Breadcrumb showing Course › Module › Lesson so learners always know where
 * they are in the curriculum.
 */
export function LessonBreadcrumb({ lesson }: { lesson: ContentLesson }) {
  const course = courseOfLesson(lesson.id);
  const module = moduleOfLesson(lesson.id);

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
      <Link
        to="/course"
        className="transition-colors hover:text-text"
      >
        {course?.title ?? "Course"}
      </Link>
      <ChevronRight className="size-3" aria-hidden="true" />
      {module ? (
        <>
          <Link to="/course" className="transition-colors hover:text-text">
            {module.title}
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
        </>
      ) : null}
      <span className="font-medium text-text-secondary">{lesson.title}</span>
    </nav>
  );
}
