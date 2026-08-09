import { useMemo, type JSX } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  GitBranch,
  Globe,
  History,
  Layers,
  Lock,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { moduleById, nextModule, previousModule } from "@/content/curriculum";
import { moduleLessons } from "@/content/lessons";
import { estimateMinutes } from "@/content/duration";
import { cn, formatDuration, percentComplete } from "@/lib/utils";
import { useProgressStore } from "@/features/progress/progressStore";
import { isModuleUnlocked } from "@/content/curriculum";
import { lessonStatus } from "@/features/progress/lessonProgress";
import { LearningWorkspace } from "@/features/learning/layout/LearningWorkspace";
import { LearningCanvas } from "@/features/learning/layout/LearningCanvas";
import { Button } from "@/components/ui/Button";

const moduleIcons: Record<string, JSX.Element> = {
  sparkles: <Sparkles className="size-4 text-accent-hover" aria-hidden="true" />,
  layers: <Layers className="size-4 text-accent-hover" aria-hidden="true" />,
  history: <History className="size-4 text-accent-hover" aria-hidden="true" />,
  "git-branch": <GitBranch className="size-4 text-accent-hover" aria-hidden="true" />,
  globe: <Globe className="size-4 text-accent-hover" aria-hidden="true" />,
  rocket: <Rocket className="size-4 text-accent-hover" aria-hidden="true" />,
};

/**
 * Module overview page (/module/:moduleId). This is the deterministic
 * destination for every module in the sidebar: it shows the module, its
 * progress, and its lesson list. Clicking a lesson opens exactly that lesson.
 */
export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = moduleId ? moduleById(moduleId) : undefined;
  const { completedLessonIds, startedLessonIds } = useProgressStore();

  const lessons = useMemo(
    () => (module ? moduleLessons(module.id) : []),
    [module],
  );

  const done = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const total = lessons.length;
  const pct = percentComplete(done, total);
  const estMin = lessons
    .filter((l) => !completedLessonIds.includes(l.id))
    .reduce((sum, l) => sum + estimateMinutes(l), 0);
  const unlocked = module ? isModuleUnlocked(module.id, completedLessonIds) : false;
  const firstIncomplete = lessons.find((l) => !completedLessonIds.includes(l.id));

  if (!module) {
    return (
      <LearningWorkspace showAi={false}>
        <LearningCanvas>
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-base-subtle text-text-muted">
              <BookMarked className="size-6" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-text">Module not found</h1>
            <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
              This module may have moved or no longer exists.
            </p>
            <Link to="/dashboard">
              <Button variant="secondary" leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}>
                Return to dashboard
              </Button>
            </Link>
          </div>
        </LearningCanvas>
      </LearningWorkspace>
    );
  }

  const prevMod = previousModule(module.id);
  const nextMod = nextModule(module.id);

  return (
    <LearningWorkspace showAi={false}>
      <LearningCanvas wide>
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Dashboard
            </Link>
            <div className="mt-4 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-subtle">
                {moduleIcons[module.icon ?? ""] ?? (
                  <BookOpen className="size-5 text-accent-hover" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                  {module.title}
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">
                  {module.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="max-w-xl">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-medium text-text-secondary">
                {unlocked ? "Progress" : "Locked"}
              </p>
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text">{done}</span> of {total} lessons
                <span aria-hidden="true"> · </span>
                <span className="font-medium text-accent-hover">{pct}%</span>
              </p>
            </div>
            <div
              role="progressbar"
              aria-label={`${module.title} progress`}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-subtle"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Lessons */}
          <section aria-labelledby="module-lessons-title">
            <div className="flex items-baseline justify-between">
              <h2 id="module-lessons-title" className="text-lg font-semibold tracking-tight text-text">
                Lessons
              </h2>
              <span className="text-sm text-text-muted">
                {total} lesson{total === 1 ? "" : "s"}
              </span>
            </div>

            {!unlocked && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-border-subtle bg-card p-4">
                <Lock className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-text-secondary">
                  Finish the previous module to unlock {module.title}. You can
                  still preview the lessons below.
                </p>
              </div>
            )}
            <ul className="mt-4 flex flex-col gap-2">
                {lessons.map((lesson) => {
                  const status = lessonStatus(lesson, { completedLessonIds, startedLessonIds });
                  const isCurrent = lesson.id === firstIncomplete?.id;
                  return (
                    <li key={lesson.id}>
                      <Link
                        to={`/lesson/${lesson.slug}`}
                        aria-label={`Open ${lesson.title}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border border-border-subtle bg-card px-4 py-3",
                          "transition-colors duration-150 hover:border-border hover:bg-card-hover",
                          isCurrent && "border-accent/30 bg-accent-soft/20",
                          status === "completed" && "opacity-80",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg",
                            status === "completed"
                              ? "bg-accent-soft text-accent-hover"
                              : status === "started"
                                ? "bg-accent-soft text-accent-hover"
                                : "bg-base-subtle text-text-muted",
                          )}
                        >
                          {status === "completed" ? (
                            <Check className="size-3.5" aria-hidden="true" />
                          ) : (
                            <span className="text-[10px] font-semibold tabular-nums">
                              {String(lesson.meta.order).padStart(2, "0")}
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm font-medium",
                              status === "completed" ? "text-text-secondary" : "text-text",
                            )}
                          >
                            {lesson.title}
                          </span>
                          {isCurrent && (
                            <span className="block text-[11px] text-accent-hover">Current lesson</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-text-muted">
                          {estimateMinutes(lesson)} min
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

            <p className="mt-3 text-xs text-text-muted">
              {remainingTime(estMin, done, total)}
            </p>
          </section>

          {/* Previous / next module */}
          <nav aria-label="Module navigation" className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-5">
            {prevMod ? (
              <Link
                to={`/module/${prevMod.id}`}
                className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-border-subtle bg-card px-3.5 py-3 transition-colors hover:border-border hover:bg-card-hover"
              >
                <ArrowLeft className="size-3.5 shrink-0 text-text-muted group-hover:text-accent-hover" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-medium uppercase tracking-widest text-text-muted">Previous module</span>
                  <span className="block truncate text-[13px] font-medium text-text-secondary group-hover:text-text">{prevMod.title}</span>
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {nextMod ? (
              <Link
                to={`/module/${nextMod.id}`}
                className="group flex min-w-0 items-center justify-end gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3.5 py-3 text-right transition-colors hover:border-white/[0.09] hover:bg-white/[0.03]"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] font-medium uppercase tracking-widest text-text-muted">Next module</span>
                  <span className="block truncate text-[13px] font-medium text-text-secondary group-hover:text-text">{nextMod.title}</span>
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-text-muted group-hover:text-accent-hover" aria-hidden="true" />
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        </div>
      </LearningCanvas>
    </LearningWorkspace>
  );
}

function remainingTime(estMin: number, done: number, total: number): string {
  if (done >= total) return "Module complete.";
  if (total === 0) return "";
  return `${total - done} lesson${total - done === 1 ? "" : "s"} remaining · ${formatDuration(estMin)} left`;
}
