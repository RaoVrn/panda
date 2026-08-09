import { Link } from "react-router-dom";
import { courseModules } from "../guideIndex";
import { cn } from "@/lib/utils";

/**
 * The course structure as a compact horizontal progression track: six modules,
 * shown in order, each clickable to its real module page. A footer line shows
 * the actual module and lesson counts.
 */
export function CourseStrip() {
  const modules = courseModules();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessonCount, 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.id}
            to={`/module/${module.id}`}
            aria-label={`Open ${module.title}`}
            className={cn(
              "group flex items-center gap-2 rounded-xl border border-border-subtle bg-card px-3 py-2.5 transition-colors",
              "hover:border-accent/40 hover:bg-card-hover",
            )}
          >
            <span className="font-mono text-[10px] text-text-muted">
              {String(module.order).padStart(2, "0")}
            </span>
            <span className="truncate text-[13px] font-medium text-text-secondary transition-colors group-hover:text-text">
              {module.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Progression track */}
      <div
        role="presentation"
        aria-hidden="true"
        className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-base-subtle"
      >
        {modules.map((module, i) => (
          <span
            key={module.id}
            className="h-full bg-accent"
            style={{ width: `${100 / modules.length}%`, opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>

      <p className="mt-2 text-[12.5px] text-text-muted">
        {modules.length} modules, {totalLessons} lessons. Modules unlock in order, and each one
        builds on the last.
      </p>
    </div>
  );
}
