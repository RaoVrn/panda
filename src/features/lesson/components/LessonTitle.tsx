import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, titleCase } from "@/lib/utils";

export function LessonTitle({ lesson }: { lesson: ContentLesson }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col gap-5 border-b border-border-subtle pb-10"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{titleCase(lesson.meta.module)}</Badge>
        {lesson.meta.difficulty && <Badge tone="accent">{lesson.meta.difficulty}</Badge>}
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="size-3" aria-hidden="true" />
          {formatDuration(lesson.meta.durationMinutes ?? 0)} read
        </span>
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
        {lesson.title}
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-text-secondary">
        {lesson.description}
      </p>
    </motion.header>
  );
}