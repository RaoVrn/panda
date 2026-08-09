import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { allLessons } from "@/content/lessons";
import { useProgressStore } from "@/features/progress/progressStore";

/**
 * A small course-completion moment. Rendered in place of the empty "next"
 * cell on the final lesson once every lesson in the course is complete.
 */
export function CourseComplete() {
  const completed = useProgressStore((state) => state.completedLessonIds);
  const total = allLessons().length;
  if (completed.length < total) return null;

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-accent/25 bg-accent-soft/40 px-3.5 py-3 text-center">
      <CheckCircle2 className="size-4 text-accent-hover" aria-hidden="true" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-hover">
        Panda course complete
      </span>
      <span className="text-[12px] leading-snug text-text-secondary">
        All {total} lessons across the 6 modules are done.
      </span>
      <Link
        to="/dashboard"
        className="mt-0.5 text-[12px] font-medium text-accent-hover underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Review the course
      </Link>
    </div>
  );
}
