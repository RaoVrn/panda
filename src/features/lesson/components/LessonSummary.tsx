import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flag,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentLesson } from "@/content/schema";
import { allLessons } from "@/content/lessons";
import { Button } from "@/components/ui/Button";
import { useProgressStore } from "@/features/progress/progressStore";
import { Confetti } from "@/features/progress/components/Confetti";
import { XP_REWARDS } from "@/features/progress/xp";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-20px" },
  transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
} as const;

function Stat({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
        accent
          ? "bg-accent-soft text-accent-hover"
          : "bg-base-subtle text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}

export interface LessonSummaryProps {
  lesson: ContentLesson;
  previous?: ContentLesson;
  next?: ContentLesson;
}

/**
 * A compact, satisfying finish. Teach deeply during the lesson; finish
 * quickly. Celebration, reward, takeaways and the next-lesson call to action
 * fit within one screen — no walls of text.
 */
export function LessonSummary({ lesson, previous, next }: LessonSummaryProps) {
  const { completeLesson, completedLessonIds } = useProgressStore();

  const startedAt = useProgressStore((s) => s.lessonStartTimes[lesson.id]);
  const quizRecord = useProgressStore((s) => s.quizStats[lesson.id]);

  useEffect(() => {
    completeLesson(lesson.id, lesson.xpReward);
  }, [lesson.id, lesson.xpReward, completeLesson]);

  const lessons = allLessons();
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const number = index >= 0 ? index + 1 : 1;
  const total = lessons.length;
  const completedCount = lessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const lessonXp =
    lesson.xpReward ?? XP_REWARDS["read-lesson"] + XP_REWARDS["finish-lesson"];
  const timeSpentMin = startedAt
    ? Math.max(1, Math.round((Date.now() - startedAt) / 60000))
    : null;

  const youLearned = lesson.meta.summary ?? [];
  const why = lesson.meta.whyItMatters;

  return (
    <section aria-label="Lesson complete" className="pt-12">
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
        {/* 1 · Celebration + reward */}
        <motion.div
          {...fadeUp}
          className="relative border-b border-border-subtle px-6 py-7 text-center"
        >
          <Confetti />
          <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Great job!
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            You finished “{lesson.title}”.
          </p>
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
            <Stat accent>
              <Zap className="size-3.5" aria-hidden="true" />
              +{lessonXp} XP
            </Stat>
            {timeSpentMin !== null && (
              <Stat>
                <Clock className="size-3.5" aria-hidden="true" />
                {timeSpentMin} min
              </Stat>
            )}
            <Stat>
              <Check className="size-3.5" aria-hidden="true" />
              {youLearned.length} concepts
            </Stat>
            {quizRecord && (
              <Stat>
                <Trophy className="size-3.5" aria-hidden="true" />
                Quiz {quizRecord.correct}/{quizRecord.total}
              </Stat>
            )}
          </div>
        </motion.div>

        {/* 2 · Takeaways */}
        {youLearned.length > 0 && (
          <motion.div
            {...fadeUp}
            className="border-b border-border-subtle px-6 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-hover">
              What you learned
            </p>
            <ul className="mt-2 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {youLearned.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-snug text-text-secondary"
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                    <Check className="size-2.5 text-accent-hover" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* 3 · Why it matters — one or two sentences, no card */}
        {why && (
          <motion.p
            {...fadeUp}
            className="border-b border-border-subtle px-6 py-3.5 text-sm leading-relaxed text-text-secondary"
          >
            <span className="font-semibold text-text">Why it matters: </span>
            {why}
            {lesson.meta.motivation && (
              <span className="mt-1 block text-text">{lesson.meta.motivation}</span>
            )}
          </motion.p>
        )}

        {/* 4 · Next lesson CTA */}
        <motion.div
          {...fadeUp}
          className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
              Next lesson
            </p>
            {next ? (
              <>
                <p className="mt-1 truncate text-lg font-semibold text-text">
                  {next.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-text-secondary">
                  {next.description}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm leading-snug text-text-secondary">
                The course is complete. Amazing work!
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
              href={next ? `/lesson/${next.slug}` : "/course"}
              rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
            >
              {next ? "Continue" : "Done"}
            </Button>
          </div>
        </motion.div>

        {/* 5 · Progress — secondary */}
        <div className="border-t border-border-subtle bg-base-subtle/40 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/course"
              className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted transition-colors hover:text-accent-hover"
            >
              <Flag className="size-3" aria-hidden="true" />
              Module overview
            </Link>
            <span className="ml-auto text-[11px] tabular-nums text-text-muted">
              {number} of {total} lessons · {percent}%
            </span>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {lessons.map((l, i) => (
              <span
                key={l.id}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= index ? "bg-accent" : "bg-base-subtle",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
