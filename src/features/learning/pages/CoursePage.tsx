import { useMemo, type JSX } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitBranch,
  Globe,
  History,
  Layers,
  Lock,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  isModuleUnlocked,
  modules,
} from "@/content/curriculum";
import { allLessons, moduleLessons } from "@/content/lessons";
import { estimateMinutes } from "@/content/duration";
import { cn, percentComplete, formatDuration } from "@/lib/utils";
import { useProgressStore } from "@/features/progress/progressStore";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import { currentLesson } from "@/features/progress/lessonProgress";
import { DashboardAchievements } from "@/features/progress/components/DashboardAchievements";
import { ProfileCard } from "@/features/progress/components/ProfileCard";
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

type ModuleState = "completed" | "in-progress" | "not-started" | "locked";

function moduleState(
  moduleId: string,
  completedLessonIds: string[],
  startedLessonIds: string[],
): ModuleState {
  const lessons = moduleLessons(moduleId);
  if (lessons.length === 0) return "locked";
  const done = lessons.filter((l) => completedLessonIds.includes(l.id));
  if (done.length === lessons.length) return "completed";
  const touched =
    done.length > 0 || lessons.some((l) => startedLessonIds.includes(l.id));
  if (touched) return "in-progress";
  if (!isModuleUnlocked(moduleId, completedLessonIds)) return "locked";
  return "not-started";
}

function ModuleCard({
  module,
  completedLessonIds,
  startedLessonIds,
}: {
  module: (typeof modules)[number];
  completedLessonIds: string[];
  startedLessonIds: string[];
}) {
  const lessons = moduleLessons(module.id);
  const firstLesson = lessons[0];
  const done = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const total = lessons.length;
  const remaining = total - done;
  const pct = percentComplete(done, total);
  const estMin = lessons
    .filter((l) => !completedLessonIds.includes(l.id))
    .reduce((sum, l) => sum + estimateMinutes(l), 0);
  const state = moduleState(module.id, completedLessonIds, startedLessonIds);

  const status = (() => {
    switch (state) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-accent-hover">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent-hover">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            In progress
          </span>
        );
      case "locked":
        return (
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <Lock className="size-3" aria-hidden="true" />
            Locked
          </span>
        );
      default:
        return <span className="text-[11px] text-text-muted">Not started</span>;
    }
  })();

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-base-subtle">
          {moduleIcons[module.icon ?? ""] ?? (
            <BookOpen className="size-4 text-accent-hover" aria-hidden="true" />
          )}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
          {module.title}
        </p>
        {status}
      </div>

      <div
        role="progressbar"
        aria-label={`${module.title} progress`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-full bg-base-subtle"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          {done}/{total} lessons
        </span>
        <span>
          {remaining > 0 ? `${formatDuration(estMin)} left` : "Section complete"}
        </span>
      </div>
    </>
  );

  if (!firstLesson) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border-subtle bg-card p-4",
          state === "locked" && "opacity-60",
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={`/module/${module.id}`}
      aria-label={`Open ${module.title}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-border-subtle bg-card p-4",
        "transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        state === "locked" && "opacity-60",
      )}
    >
      {inner}
    </Link>
  );
}

export function CoursePage() {
  const { completedLessonIds, startedLessonIds } = useProgressStore();

  const { userId } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);

  const lessons = allLessons();
  const total = lessons.length;
  const done = completedLessonIds.length;
  const pct = percentComplete(done, total);
  const next = useMemo(
    () => currentLesson({ completedLessonIds, startedLessonIds }),
    [completedLessonIds, startedLessonIds],
  );

  const name = (profile?.name || "").trim();

  return (
    <LearningWorkspace showAi={false}>
      <LearningCanvas wide>
        <div className="flex flex-col gap-10 lg:gap-12">
          {/* Hero */}
          <section className="flex flex-col gap-7">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Welcome back{name ? `, ${name}` : ""}.
              </h1>
              <p className="mt-1 text-base leading-relaxed text-text-secondary">
                {done === total
                  ? "You've completed the entire course."
                  : "Continue where you left off."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                {next ? (
                  <Link to={`/lesson/${next.slug}`}>
                    <Button
                      size="lg"
                      rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
                    >
                      Continue learning
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/lesson/${lessons[0]?.slug ?? ""}`}>
                    <Button
                      size="lg"
                      rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
                    >
                      Review a lesson
                    </Button>
                  </Link>
                )}
                {next && (
                  <div className="text-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Current lesson
                    </p>
                    <p className="mt-0.5 font-medium text-text">{next.title}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="max-w-xl">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-medium text-text-secondary">Progress</p>
                <p className="text-sm text-text-muted">
                  <span className="font-semibold text-text">{done}</span> of {total} lessons
                  <span aria-hidden="true"> · </span>
                  <span className="font-medium text-accent-hover">{pct}%</span>
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Course progress"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-2.5 h-2 overflow-hidden rounded-full bg-base-subtle"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </section>

          {/* Main + sidebar */}
          <div className="grid gap-8 xl:grid-cols-[1fr_17rem]">
            <div className="flex min-w-0 flex-col gap-10 lg:gap-12">
              {/* Course Progress */}
              <section id="course-progress" aria-labelledby="course-progress-title">
                <h2
                  id="course-progress-title"
                  className="text-lg font-semibold tracking-tight text-text"
                >
                  Course Progress
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Six modules, one journey. Each builds on the last.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      completedLessonIds={completedLessonIds}
                      startedLessonIds={startedLessonIds}
                    />
                  ))}
                </div>
              </section>

              {/* Achievements */}
              <DashboardAchievements />
            </div>

            {/* Compact profile */}
            <aside className="self-start xl:sticky xl:top-20">
              <ProfileCard />
            </aside>
          </div>
        </div>
      </LearningCanvas>
    </LearningWorkspace>
  );
}
