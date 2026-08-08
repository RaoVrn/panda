import { useMemo } from "react";
import { moduleOfLesson } from "@/content/curriculum";
import { getLesson, moduleLessons } from "@/content/lessons";
import { moduleProgress } from "@/features/progress/lessonProgress";
import { useProgressStore } from "@/features/progress/progressStore";

export interface LessonProgressionProps {
  lessonId: string;
  /** Optional compact single-line rendering (for the sticky header). */
  compact?: boolean;
}

/**
 * Where the learner is in the course: "Module 3 · History · Lesson 2 of 5 ·
 * Progress 40%". Derived entirely from the curriculum and progress stores, so
 * every surface agrees. Renders as one compact muted line.
 */
export function LessonProgression({ lessonId, compact = true }: LessonProgressionProps) {
  const lesson = getLesson(lessonId);
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds);

  const position = useMemo(() => {
    if (!lesson) return null;
    const module = moduleOfLesson(lesson.id);
    if (!module) return null;
    const lessonsInModule = moduleLessons(module.id);
    const index = lessonsInModule.findIndex((l) => l.id === lesson.id);
    const progress = moduleProgress(module.id, { completedLessonIds, startedLessonIds: [] });
    return {
      moduleNumber: module.order,
      moduleTitle: module.title,
      lessonNumber: index >= 0 ? index + 1 : lessonsInModule.length,
      lessonTotal: lessonsInModule.length,
      percent: progress.percent,
    };
  }, [lesson, completedLessonIds]);

  if (!position) return null;

  const { moduleNumber, moduleTitle, lessonNumber, lessonTotal, percent } = position;

  return (
    <p
      className={compact ? "truncate text-[11px] tabular-nums text-text-muted" : "text-xs text-text-muted"}
      data-testid="lesson-progression"
      aria-label={`Module ${moduleNumber} ${moduleTitle}, lesson ${lessonNumber} of ${lessonTotal}, module progress ${percent}%`}
    >
      <span className="font-medium text-text-secondary">Module {moduleNumber}</span>
      <span aria-hidden="true" className="mx-1.5 text-border-strong">·</span>
      {moduleTitle}
      <span aria-hidden="true" className="mx-1.5 text-border-strong">·</span>
      Lesson {lessonNumber} of {lessonTotal}
      <span aria-hidden="true" className="mx-1.5 text-border-strong">·</span>
      <span className="tabular-nums">{percent}%</span>
    </p>
  );
}
