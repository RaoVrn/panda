import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Flag,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { Button } from "@/components/ui/Button";
import { useProgressStore } from "@/features/progress/progressStore";
import { useReadingStore } from "@/stores/readingStore";
import {
  completionCheck,
  maybeCompleteLesson,
} from "@/features/progress/progressService";
import { lessonXp } from "@/features/progress/xp";
import { estimateMinutes } from "@/content/duration";
import { Confetti } from "@/features/progress/components/Confetti";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-20px" },
  transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
} as const;

function scrollToBlock(blockId: string) {
  document
    .querySelector(`[data-block-id="${blockId}"]`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export interface LessonSummaryProps {
  lesson: ContentLesson;
  previous?: ContentLesson;
  next?: ContentLesson;
}

/**
 * A quick, rewarding finish — one panel, no stacked cards.
 *
 * Complete: Great job → reward line → key takeaways → next lesson CTA.
 * Not complete yet: a short, honest gate listing what's left.
 */
export function LessonSummary({ lesson, next }: LessonSummaryProps) {
  const isComplete = useProgressStore((state) =>
    state.completedLessonIds.includes(lesson.id),
  );

  const reading = useReadingStore((s) => s.readings[lesson.id]);
  const interactiveTouched = useProgressStore(
    (s) => s.interactiveTouched[lesson.id] === true,
  );
  const quiz = useProgressStore((s) => s.quizStats[lesson.id]);

  // Keep the completion transition alive from the summary itself.
  useEffect(() => {
    maybeCompleteLesson(lesson);
  }, [lesson, isComplete, reading?.visited.length, interactiveTouched, quiz]);

  const check = completionCheck(lesson, {
    visited: reading?.visited,
    interactiveTouched,
    quiz,
  });

  const xp = lessonXp(lesson);
  const minutes = estimateMinutes(lesson);
  const youLearned = lesson.meta.summary ?? [];
  const quizBlock = lesson.blocks.find((b) => b.type === "quiz");
  const quizFailed = quiz !== undefined && !check.quizPassed;

  return (
    <section aria-label="Lesson complete" className="pt-12">
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
        {isComplete ? (
          <>
            {/* Celebration + reward */}
            <motion.div
              {...fadeUp}
              className="relative px-6 pb-1 pt-6 text-center"
            >
              <Confetti />
              <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Great job!
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                You finished “{lesson.title}”.
              </p>
              <p className="mt-3 text-sm">
                <span className="font-semibold text-accent-hover">+{xp} XP</span>
                <span className="mx-2 text-border-strong" aria-hidden="true">
                  ·
                </span>
                {minutes} min
                <span className="mx-2 text-border-strong" aria-hidden="true">
                  ·
                </span>
                {youLearned.length} concepts
              </p>
            </motion.div>

            {/* Key takeaways */}
            {youLearned.length > 0 && (
              <motion.div {...fadeUp} className="px-6 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-hover">
                  Key takeaways
                </p>
                <ul className="mt-2 space-y-1">
                  {youLearned.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-snug text-text-secondary"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-accent-hover"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Next lesson CTA */}
            <motion.div
              {...fadeUp}
              className="flex flex-col gap-4 px-6 pb-6 pt-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                  Next lesson
                </p>
                {next ? (
                  <>
                    <h3 className="mt-0.5 truncate text-lg font-semibold text-text">
                      {next.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-sm leading-snug text-text-secondary">
                      {next.description}
                    </p>
                  </>
                ) : (
                  <p className="mt-0.5 text-sm leading-snug text-text-secondary">
                    The course is complete. Amazing work!
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                className="shrink-0"
                href={next ? `/lesson/${next.slug}` : "/course"}
                rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
              >
                {next ? "Continue" : "Done"}
              </Button>
            </motion.div>
          </>
        ) : (
          /* ---------- Gate: not complete yet ---------- */
          <motion.div {...fadeUp} className="px-6 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Almost there!
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">
                You've reached the end of “{lesson.title}”. Finish the last
                steps to earn {xp} XP and unlock the next lesson.
              </p>
            </div>

            <ul className="mx-auto mt-5 max-w-sm space-y-1.5">
              {check.missing.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning-soft/30 px-3.5 py-2 text-sm text-text-secondary"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-warning/20">
                    <RotateCcw className="size-2.5 text-warning" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {quizFailed && (
              <p className="mx-auto mt-3 max-w-sm text-center text-sm font-medium text-text-secondary">
                <span className="text-text">Almost there. </span>Review the
                lesson and try again. You need 80% on the quiz to pass.
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {quizBlock && !check.quizPassed && (
                <Button
                  variant="secondary"
                  onClick={() => scrollToBlock(quizBlock.id)}
                  leftIcon={<Trophy className="size-4" aria-hidden="true" />}
                >
                  Jump to quiz
                </Button>
              )}
              {!check.readDone && (
                <Button
                  variant="secondary"
                  onClick={scrollToTop}
                  leftIcon={<CheckCircle2 className="size-4" aria-hidden="true" />}
                >
                  Back to top
                </Button>
              )}
              <Button
                variant="primary"
                href="/course"
                leftIcon={<Flag className="size-4" aria-hidden="true" />}
              >
                Course overview
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
