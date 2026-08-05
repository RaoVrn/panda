import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  RotateCcw,
  X,
} from "lucide-react";
import type { Quiz } from "@/content/schema";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useReportAi } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";
import {
  PASSING_SCORE,
  maybeCompleteLessonById,
} from "@/features/progress/progressService";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { Confetti } from "@/features/progress/components/Confetti";
import { cn } from "@/lib/utils";

interface AnswerState {
  selected: number | null;
  revealed: boolean;
}

export interface QuizCardProps {
  quiz: Quiz;
  /** Lesson this quiz belongs to (for the completion gate). */
  lessonId?: string;
}

/**
 * Two-column responsive quiz. Honors the learner's quiz-feedback preference:
 *  · immediate — each answer is revealed the moment it's picked
 *  · end       — answers are collected, then checked together with one tap
 */
export function QuizCard({ quiz, lessonId }: QuizCardProps) {
  const player = useStepPlayer(quiz.questions.length);
  const [states, setStates] = useState<Record<string, AnswerState>>({});
  const [score, setScore] = useState(0);
  const [scored, setScored] = useState<Record<string, boolean>>({});
  const [revealedAll, setRevealedAll] = useState(false);

  const quizPreference = usePreferencesStore((s) => s.quizPreference);
  const endMode = quizPreference === "end";

  const recordQuizResult = useProgressStore((s) => s.recordQuizResult);
  const reportedRef = useRef(false);

  const allAnswered =
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => states[q.id]?.selected !== null);
  const quizComplete = allAnswered && (!endMode || revealedAll);

  useEffect(() => {
    if (quizComplete && !reportedRef.current) {
      reportedRef.current = true;
      recordQuizResult(quiz.id, score, quiz.questions.length);
    }
  }, [quizComplete, quiz.id, score, quiz.questions.length, recordQuizResult]);

  // Passing the quiz is the last completion gate — complete the lesson if the
  // other gates (read + interactive) already passed.
  const passed = quizComplete && score / quiz.questions.length >= PASSING_SCORE;
  useEffect(() => {
    if (passed && lessonId) maybeCompleteLessonById(lessonId);
  }, [passed, lessonId]);

  const question = quiz.questions[player.step];

  const currentAnswered = question ? Boolean(states[question.id]?.revealed) : false;
  const currentCorrect = question
    ? states[question.id]?.selected === question.correctIndex
    : false;

  useReportAi(
    {
      quiz: question
        ? `Q${player.step + 1} of ${player.total}: "${question.prompt}" (${
            currentAnswered
              ? currentCorrect
                ? "answered correctly"
                : "answered (incorrect)"
              : allAnswered && endMode && !revealedAll
                ? "answered, awaiting check"
                : "not answered yet"
          }`
        : undefined,
    },
    [
      question?.id,
      question?.prompt,
      currentAnswered,
      currentCorrect,
      allAnswered,
      endMode,
      revealedAll,
      player.step,
      player.total,
    ],
  );

  if (!question) return null;
  const state = states[question.id] ?? { selected: null, revealed: false };
  const answered = endMode ? state.selected !== null : state.revealed;
  const correct = state.selected === question.correctIndex;

  const choose = (index: number) => {
    if (answered) return;
    if (endMode) {
      setStates((prev) => ({
        ...prev,
        [question.id]: { selected: index, revealed: false },
      }));
      return;
    }
    setStates((prev) => ({
      ...prev,
      [question.id]: { selected: index, revealed: true },
    }));
    if (index === question.correctIndex && !scored[question.id]) {
      setScore((s) => s + 1);
      setScored((prev) => ({ ...prev, [question.id]: true }));
    }
  };

  // Reveal everything at once (end mode) and compute the score.
  const checkAnswers = () => {
    let correctCount = 0;
    const next: Record<string, AnswerState> = {};
    for (const q of quiz.questions) {
      const selected = states[q.id]?.selected;
      if (selected === q.correctIndex) correctCount += 1;
      next[q.id] = { selected: selected ?? null, revealed: true };
    }
    setStates(next);
    setScore(correctCount);
    setRevealedAll(true);
  };

  const letter = (i: number) => String.fromCharCode(65 + i);

  const PRAISE = ["Nice!", "Correct!", "Great pick!", "You got it!"];
  const praise = PRAISE[
    [...question.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % PRAISE.length
  ]!;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      {quizComplete && score === quiz.questions.length && <Confetti />}
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          Quiz
        </p>
        <span className="ml-auto text-xs tabular-nums text-text-muted">
          Question {Math.min(player.step + 1, player.total)} of {player.total}
        </span>
      </div>

      <div className="px-5 py-2">
        <div className="flex gap-1.5">
          {quiz.questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              aria-label={`Go to question ${i + 1}`}
              onClick={() => player.setStep(i)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= player.step ? "bg-accent" : "bg-base-subtle",
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col gap-4 p-4"
        >
          <p className="text-base font-medium leading-snug text-text">
            {question.prompt}
          </p>

          <div
            role="radiogroup"
            aria-label={question.prompt}
            className="grid gap-2.5 sm:grid-cols-2"
          >
            {question.options.map((option, i) => {
              const isCorrect = i === question.correctIndex;
              const isSelected = i === state.selected;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={answered}
                  onClick={() => choose(i)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all",
                    "border-border-subtle bg-base-subtle text-text-secondary",
                    !answered && "hover:border-accent/40 hover:bg-base-elevated hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    answered && isCorrect && "border-accent/50 bg-accent-soft text-text",
                    answered && isSelected && !isCorrect && "border-danger/50 bg-danger-soft text-text",
                    answered && !isCorrect && !isSelected && "opacity-45",
                  )}
                >
                  <span
                    className={cn(
                      "mt-px flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                      answered && isCorrect
                        ? "border-accent bg-accent text-text-inverse"
                        : answered && isSelected && !isCorrect
                          ? "border-danger"
                          : "border-current",
                    )}
                  >
                    {answered && isCorrect ? (
                      <Check className="size-3" aria-hidden="true" />
                    ) : (
                      letter(i)
                    )}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {state.revealed && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8, scale: correct ? 0.97 : 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3",
                  correct
                    ? "border-accent/30 bg-accent-soft/50"
                    : "border-danger/30 bg-danger-soft/50",
                )}
                role="status"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    correct ? "bg-accent text-base" : "bg-danger text-base",
                  )}
                >
                  {correct ? (
                    <CircleCheck className="size-3.5" aria-hidden="true" />
                  ) : (
                    <X className="size-3.5" aria-hidden="true" />
                  )}
                </span>
                <div className="text-sm leading-relaxed text-text-secondary">
                  <span className={cn("font-semibold", correct ? "text-accent-hover" : "text-danger")}>
                    {correct ? `${praise} ` : "Not yet. Here’s why: "}
                  </span>
                  {question.explanation}
                  {!correct && (
                    <span className="mt-1 block text-xs text-text-muted">
                      The green option is the one that Git matches.
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Check answers (end mode) */}
      <AnimatePresence initial={false}>
        {endMode && allAnswered && !revealedAll && (
          <motion.div
            key="check"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 border-t border-border-subtle bg-base-subtle/40 px-4 py-3">
              <p className="text-sm text-text-secondary">
                You've answered all {quiz.questions.length} questions.
              </p>
              <button
                type="button"
                onClick={checkAnswers}
                className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg bg-accent px-4 text-sm font-medium text-text-inverse ring-1 ring-inset ring-white/10 transition-colors hover:bg-accent-hover"
              >
                <CircleCheck className="size-4" aria-hidden="true" />
                Check answers
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {quizComplete && !passed && (
          <motion.div
            key="fail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2.5 border-t border-warning/30 bg-warning-soft/40 px-5 py-3.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-warning/20">
                <RotateCcw className="size-3 text-warning" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-text-secondary">
                <span className="font-semibold text-text">Almost there.</span>{" "}
                Review the lesson and try again. You need 80% ({" "}
                {Math.ceil(quiz.questions.length * PASSING_SCORE)} of{" "}
                {quiz.questions.length}) to pass.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 border-t border-border-subtle bg-base-subtle/30 px-3 py-2.5">
        <button
          type="button"
          disabled={player.isFirst}
          onClick={player.prev}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-base-subtle hover:text-text disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Previous
        </button>
        <span className="ml-auto text-xs text-text-muted">
          {score} of {player.total} correct
        </span>
        <button
          type="button"
          onClick={() => {
            setStates({});
            setScore(0);
            setScored({});
            setRevealedAll(false);
            player.replay();
          }}
          className="flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle hover:text-text"
          aria-label="Restart quiz"
          title="Restart quiz"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={player.isLast}
          onClick={player.next}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-base-subtle hover:text-text disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
