import { Clock, Flag } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, titleCase } from "@/lib/utils";

export function LessonTitle({ lesson }: { lesson: Lesson }) {
  const { meta } = lesson;
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{titleCase(meta.module)}</Badge>
        <Badge tone="accent">{meta.difficulty}</Badge>
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <Clock className="size-3" aria-hidden="true" />
          {formatDuration(meta.durationMinutes)}
        </span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {meta.title}
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
        {meta.description}
      </p>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Flag className="size-3.5" aria-hidden="true" />
        Learning goal · {meta.tags?.join(", ") ?? "Core concepts"}
      </div>
    </header>
  );
}