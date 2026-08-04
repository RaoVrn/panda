import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/types/lesson";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function Question({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answered = revealed;
  const correct = selected === question.correctIndex;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-text">
        <span className="mr-2 text-text-muted">{index + 1}.</span>
        {question.prompt}
      </p>
      <div
        className="grid gap-2"
        role="radiogroup"
        aria-label={`Question ${index + 1}`}
      >
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                "border-border-subtle bg-base-subtle text-text-secondary",
                !answered && "hover:border-border-strong hover:text-text",
                answered && isCorrect && "border-accent/40 bg-accent-soft text-text",
                answered && isSelected && !isCorrect && "border-danger/40 bg-danger-soft text-text",
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current font-mono text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {answered && isCorrect && (
                <Check className="size-4 text-accent-hover" aria-hidden="true" />
              )}
              {answered && isSelected && !isCorrect && (
                <X className="size-4 text-danger" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="rounded-xl bg-base-subtle px-4 py-3 text-sm leading-relaxed text-text-secondary">
          {correct
            ? "Correct. "
            : "Not quite. "}
          {question.explanation}
        </p>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          disabled={selected === null}
          onClick={() => setRevealed(true)}
        >
          Check answer
        </Button>
      )}
    </div>
  );
}

export interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div className="flex flex-col gap-8 rounded-2xl border border-border-subtle bg-card p-6 shadow-card">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          Quiz
        </p>
        <h4 className="mt-1 text-lg font-semibold text-text">{quiz.title}</h4>
      </div>
      {quiz.questions.map((question, index) => (
        <Question key={question.id} question={question} index={index} />
      ))}
    </div>
  );
}