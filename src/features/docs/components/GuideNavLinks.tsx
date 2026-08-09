import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { guidePrevNext, type GuidePageId } from "../guideIndex";

/**
 * Previous / next navigation between the four guide pages. Kept minimal  -  the
 * guide reads in one short pass: Overview → Learning → Playground → Panda AI.
 */
export function GuideNavLinks({ active }: { active: GuidePageId }) {
  const { prev, next } = guidePrevNext(active);
  return (
    <nav
      aria-label="Guide navigation"
      className="mt-12 grid grid-cols-1 gap-3 border-t border-border-subtle pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          to={prev.route}
          className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-border-subtle bg-card px-4 py-3 transition-colors hover:border-border hover:bg-card-hover"
        >
          <ArrowLeft
            className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-accent-hover"
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-widest text-text-muted">
              Previous
            </span>
            <span className="block truncate text-[13px] font-medium text-text-secondary transition-colors group-hover:text-text">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <Link
          to={next.route}
          className="group flex min-w-0 items-center justify-end gap-2.5 rounded-xl border border-border-subtle bg-card px-4 py-3 text-right transition-colors hover:border-border hover:bg-card-hover"
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
            className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-accent-hover"
            aria-hidden="true"
          />
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
