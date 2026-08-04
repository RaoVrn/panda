import { Lightbulb } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";

export interface AnalogyBlockProps {
  text?: string;
  index?: number;
}

export function AnalogyBlock({ text, index = 3 }: AnalogyBlockProps) {
  return (
    <LessonSection
      index={index}
      label="Real-life Analogy"
      icon={<Lightbulb className="size-4 text-warning" aria-hidden="true" />}
    >
      {text && text.length > 0 ? (
        <div className="rounded-2xl border border-warning/20 bg-warning-soft/40 p-5">
          <p className="text-base leading-relaxed text-text">{text}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
          Analogy will render here.
        </div>
      )}
    </LessonSection>
  );
}