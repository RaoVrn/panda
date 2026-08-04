import type { Quiz } from "@/types/lesson";
import { Brain } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";
import { QuizCard } from "@/features/learning/components/QuizCard";

export function QuizBlock({ quiz }: { quiz?: Quiz }) {
  return (
    <LessonSection
      index={4}
      label="Quiz"
      icon={<Brain className="size-4 text-accent-hover" aria-hidden="true" />}
    >
      {quiz && quiz.questions.length > 0 ? (
        <QuizCard quiz={quiz} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
          Quiz will appear here once authored.
        </div>
      )}
    </LessonSection>
  );
}