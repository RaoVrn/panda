import { Dumbbell } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";
import { Button } from "@/components/ui/Button";

export interface PracticeBlockProps {
  index?: number;
}

export function PracticeBlock({ index = 7 }: PracticeBlockProps) {
  return (
    <LessonSection
      index={index}
      label="Practice Challenge"
      icon={<Dumbbell className="size-4 text-accent-hover" aria-hidden="true" />}
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text">Try it yourself</p>
          <p className="mt-1 text-sm text-text-muted">
            Practice may not have material yet — content is authored separately.
          </p>
        </div>
        <Button variant="secondary" size="sm" disabled>
          Start lab
        </Button>
      </div>
    </LessonSection>
  );
}