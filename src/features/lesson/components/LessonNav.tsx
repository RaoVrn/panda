import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CourseComplete } from "@/features/lesson/components/CourseComplete";

/** A resolved navigation destination (exact URL), never a raw lesson object. */
export interface LessonNavTarget {
  title: string;
  to: string;
}

export interface LessonNavProps {
  previous?: LessonNavTarget;
  next?: LessonNavTarget;
  className?: string;
}

/**
 * Minimal documentation-style navigation  -  two equal-width cards at the end
 * of a lesson. Destinations are resolved by the lesson page (module-scoped
 * previous/next, or back-to-module / next-module at boundaries), so links are
 * always deterministic.
 */
export function LessonNav({ previous, next, className }: LessonNavProps) {
  return (
    <nav
      aria-label="Lesson navigation"
      className={`mt-10 border-t border-border-subtle pt-4 ${className ?? ""}`}
    >
      <div className="grid grid-cols-2 gap-3">
        {previous ? (
          <Link
            to={previous.to}
            className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-border-subtle bg-card px-3.5 py-3 transition-colors hover:border-border hover:bg-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft
              className="size-3.5 shrink-0 text-text-muted transition-colors group-hover:text-accent-hover"
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block text-[10px] font-medium uppercase tracking-widest text-text-muted">
                Previous
              </span>
              <span className="block truncate text-[13px] font-medium text-text-secondary transition-colors group-hover:text-text">
                {previous.title}
              </span>
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}

        {next ? (
          <Link
            to={next.to}
            className="group flex min-w-0 items-center justify-end gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3.5 py-3 text-right transition-colors hover:border-white/[0.09] hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-medium uppercase tracking-widest text-text-muted">
                Next
              </span>
              <span className="block truncate text-[13px] font-medium text-text-secondary transition-colors group-hover:text-text">
                {next.title}
              </span>
            </span>
            <ArrowRight
              className="size-3.5 shrink-0 text-text-muted transition-colors group-hover:text-accent-hover"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <CourseComplete />
        )}
      </div>
    </nav>
  );
}
