import { useMemo } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { moduleById, moduleOfLesson } from "@/content/curriculum";
import { useProgressStore } from "@/features/progress/progressStore";
import { Link } from "react-router-dom";

export interface PrerequisiteNoteProps {
  lesson: ContentLesson;
}

/**
 * A gentle, non-blocking nudge when a learner jumps ahead of the course
 * order. If an earlier module isn't complete, we recommend finishing it
 * first  -  but we never lock the lesson or stop them from continuing.
 */
export function PrerequisiteNote({ lesson }: PrerequisiteNoteProps) {
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds);

  const note = useMemo(() => {
    const module = moduleOfLesson(lesson.id);
    if (!module) return null;
    const required = (module.requires ?? [])
      .map((id) => moduleById(id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .filter((m) => m.lessons.some((id) => !completedLessonIds.includes(id)));
    if (required.length === 0) return null;
    return {
      modules: required.map((m) => ({ id: m.id, title: m.title })),
    };
  }, [lesson.id, completedLessonIds]);

  if (!note) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/[0.06] px-4 py-3">
      <Sparkles className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <div className="min-w-0 text-sm leading-snug text-text-secondary">
        <p className="font-medium text-text">
          Heads up: you're jumping ahead
        </p>
        <p className="mt-0.5">
          We recommend completing{" "}
          {note.modules.map((m, i) => (
            <span key={m.id}>
              {i > 0 && i === note.modules.length - 1 && " and "}
              {i > 0 && i < note.modules.length - 1 && ", "}
              <Link
                to={`/lesson/${firstLessonSlug(m.id)}`}
                className="inline-flex items-center gap-1 font-medium text-accent-hover underline-offset-2 hover:underline"
              >
                <BookOpen className="size-3" aria-hidden="true" />
                {m.title}
              </Link>
            </span>
          ))}{" "}
          first. You can keep going, it'll just be easier with that foundation.
        </p>
      </div>
    </div>
  );
}

function firstLessonSlug(moduleId: string): string {
  const module = moduleById(moduleId);
  const firstId = module?.lessons[0];
  return firstId ?? "#";
}
