import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flag,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentLesson } from "@/content/schema";
import { allLessons } from "@/content/lessons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useProgressStore } from "@/stores/progressStore";
import { formatDuration, titleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";

const difficultyTone = {
  beginner: "accent",
  intermediate: "warning",
  advanced: "danger",
} as const;

export interface LessonSummaryProps {
  lesson: ContentLesson;
  previous?: ContentLesson;
  next?: ContentLesson;
}

/**
 * The premium ending to every lesson: a calm celebration (Nice work!), a recap
 * of what was learned, a preview of the next lesson with its time and
 * difficulty, and a large Continue action backed by the course progress bar.
 */
export function LessonSummary({ lesson, previous, next }: LessonSummaryProps) {
  const { completeLesson, completedLessonIds } = useProgressStore();

  useEffect(() => {
    completeLesson(lesson.id);
  }, [lesson.id, completeLesson]);

  const lessons = allLessons();
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const number = index >= 0 ? index + 1 : 1;
  const total = lessons.length;
  const completedCount = lessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const youLearned = lesson.meta.summary ?? [];
  const whyItMatters =
    lesson.meta.whyItMatters ??
    "What you just learned is the foundation of how every developer protects and shares their work.";

  const fadeUp = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
  } as const;

  return (
    <section aria-label="Lesson complete" className="pt-20">
      <div className="mb-12 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="flex flex-col gap-9">
        {/* 1 · Celebration */}
        <motion.div {...fadeUp} className="flex flex-col items-center gap-5 text-center">
          <motion.span
            className="flex size-14 items-center justify-center rounded-full bg-accent-soft ring-1 ring-accent/20"
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <PartyPopper className="size-6 text-accent-hover" aria-hidden="true" />
          </motion.span>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Great job!
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-text-muted">
              That’s the end of “{lesson.title}”. Here’s a quick recap.
            </p>
          </div>
        </motion.div>

        {/* 2 · Today you learned */}
        <motion.div {...fadeUp}>
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
            <div className="border-b border-border-subtle bg-base-subtle/50 px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
                What you learned
              </p>
            </div>
            <ul className="flex flex-col divide-y divide-border-subtle/60">
              {youLearned.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
                  className="flex items-start gap-3 px-5 py-3.5"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                    <Check className="size-3 text-accent-hover" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* 3 · Why it matters */}
        <motion.div {...fadeUp}>
          <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-base/40">
              <Sparkles className="size-4 text-accent-hover" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text">Why this matters</p>
              <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                {whyItMatters}
              </p>
              {lesson.meta.motivation && (
                <p className="mt-2 text-sm leading-relaxed text-text">
                  {lesson.meta.motivation}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 4 · Next lesson */}
        {next && (
          <motion.div {...fadeUp}>
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
              <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/50 px-5 py-3.5">
                <Flag className="size-3.5 text-accent-hover" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
                  Continue to next lesson
                </p>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold text-text">{next.title}</h3>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="size-3" aria-hidden="true" />
                    {formatDuration(next.meta.durationMinutes ?? 0)} estimated
                  </span>
                  <Badge tone={difficultyTone[next.meta.difficulty ?? "beginner"]}>
                    {titleCase(next.meta.difficulty ?? "beginner")}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {next.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5 · Actions */}
        <motion.div {...fadeUp} className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {previous && (
            <Button
              variant="secondary"
              href={`/lesson/${previous.slug}`}
              leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
            >
              Back
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            href={next ? `/lesson/${next.slug}` : "/course"}
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
            className="flex-1"
          >
            {next ? `Start ${next.title}` : "Course complete"}
          </Button>
        </motion.div>

        {/* 6 · Progress summary */}
        <motion.div
          {...fadeUp}
          className="rounded-2xl border border-border-subtle bg-base-subtle/30 px-5 py-4"
        >
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Lesson <span className="tabular-nums">{number}</span> of{" "}
              <span className="tabular-nums">{total}</span>
            </span>
            <span className="tabular-nums">
              {completedCount}/{total} complete · {percent}%
            </span>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            {lessons.map((l, i) => (
              <span
                key={l.id}
                aria-hidden="true"
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= index ? "bg-accent" : "bg-base-subtle",
                )}
              />
            ))}
          </div>
        </motion.div>

        <Link
          to="/course"
          className="text-center text-xs text-text-muted transition-colors hover:text-accent-hover"
        >
          Back to course overview
        </Link>
      </div>
    </section>
  );
}