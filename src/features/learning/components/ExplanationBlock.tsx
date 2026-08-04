import { BookOpen } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";

export interface ExplanationBlockProps {
  text?: string;
  index?: number;
}

export function ExplanationBlock({ text, index = 2 }: ExplanationBlockProps) {
  return (
    <LessonSection
      index={index}
      label="Explanation"
      icon={<BookOpen className="size-4 text-accent-hover" aria-hidden="true" />}
    >
      {text && text.length > 0 ? (
        <p className="text-base leading-relaxed text-text-secondary">{text}</p>
      ) : (
        <p className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
          Explanation content will render here.
        </p>
      )}
    </LessonSection>
  );
}