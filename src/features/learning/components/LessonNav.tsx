import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { Button } from "@/components/ui/Button";
import { useProgressStore } from "@/stores/progressStore";

export interface LessonNavProps {
  previous?: Lesson;
  next?: Lesson;
}

export function LessonNav({ previous, next }: LessonNavProps) {
  const { toggleCompleted, completedLessonIds } = useProgressStore();
  const currentDone = next
    ? completedLessonIds.includes(next.meta.id)
    : false;

  return (
    <nav
      aria-label="Lesson navigation"
      className="grid gap-4 border-t border-border-subtle py-10 sm:grid-cols-2"
    >
      {previous ? (
        <Button variant="secondary" href={`/lesson/${previous.meta.slug}`} className="h-auto flex-col items-start gap-1 p-4">
          <span className="flex items-center gap-2 text-xs text-text-muted">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Previous
          </span>
          <span className="text-sm font-medium text-text">{previous.meta.title}</span>
        </Button>
      ) : (
        <span />
      )}

      {next && (
        <div className="flex flex-col gap-3 sm:items-end">
          <Button
            variant="primary"
            href={`/lesson/${next.meta.slug}`}
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            Next · {next.meta.title}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Check className="size-4 text-accent-hover" aria-hidden="true" />}
            onClick={() => toggleCompleted(next.meta.id)}
          >
            {currentDone ? "Mark as not completed" : "Mark this lesson as completed"}
          </Button>
        </div>
      )}
    </nav>
  );
}