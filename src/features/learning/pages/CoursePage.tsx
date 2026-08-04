import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { modules } from "@/content/roadmap";
import { allLessons, moduleLessons } from "@/content/lessons";
import { percentComplete } from "@/lib/utils";
import { useProgressStore } from "@/stores/progressStore";
import { LearningWorkspace } from "@/features/learning/layout/LearningWorkspace";
import { LearningCanvas } from "@/features/learning/layout/LearningCanvas";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function CoursePage() {
  const { completedLessonIds } = useProgressStore();
  const lessons = allLessons();
  const pct = percentComplete(completedLessonIds.length, lessons.length);
  const next = lessons.find(
    (l) => !completedLessonIds.includes(l.id),
  ) ?? lessons[0];

  return (
    <LearningWorkspace>
      <LearningCanvas>
        <div className="flex flex-col gap-6">
          <Card className="p-8">
            <span className="text-3xl" aria-hidden="true">🐼</span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome to your Git journey
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
              Pick any lesson from the course navigator. Progress is saved on
              this device and unlocks lessons as you complete them.
            </p>
            {next && (
              <Link to={`/lesson/${next.slug}`} className="mt-6 inline-block">
                <Button rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}>
                  Continue · {next.title}
                </Button>
              </Link>
            )}
          </Card>

          <Card className="p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Course progress
              </h2>
              <span className="text-sm font-medium text-accent-hover">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-2 overflow-hidden rounded-full bg-base-subtle"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {completedLessonIds.length} of {lessons.length} lessons completed
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border-subtle bg-base-subtle px-4 py-3"
                >
                  <p className="text-sm font-medium text-text">{m.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {moduleLessons(m.id).length} lessons
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </LearningCanvas>
    </LearningWorkspace>
  );
}