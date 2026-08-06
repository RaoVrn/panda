import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentLesson } from "@/content/schema";

export function LessonNav({
  previous,
  next,
}: {
  previous?: ContentLesson;
  next?: ContentLesson;
}) {
  const prevLink = previous ? `/lesson/${previous.slug}` : null;
  const nextLink = next ? `/lesson/${next.slug}` : null;

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-12 grid gap-3 border-t border-white/[0.03] pt-5 sm:grid-cols-2"
    >
      {prevLink ? (
        <Link
          to={prevLink}
          className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 transition-colors hover:border-white/[0.08] hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-accent-hover" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wide text-text-muted">
              Previous
            </span>
            <span className="block truncate text-sm font-medium text-text">
              {previous!.title}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {nextLink ? (
        <Link
          to={nextLink}
          className="group flex items-center justify-end gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-right transition-colors hover:border-white/[0.08] hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:col-start-2"
        >
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wide text-text-muted">
              Next
            </span>
            <span className="block truncate text-sm font-medium text-text">
              {next!.title}
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-accent-hover" aria-hidden="true" />
        </Link>
      ) : (
        <span className="sm:col-start-2" />
      )}
    </nav>
  );
}
