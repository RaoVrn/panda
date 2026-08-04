import { Target } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";

export interface LessonGoalProps {
  children?: string;
}

export function LessonGoal({ children }: LessonGoalProps) {
  return (
    <LessonSection
      index={1}
      label="Learning Goal"
      icon={<Target className="size-4 text-accent-hover" aria-hidden="true" />}
    >
      <p className="text-base leading-relaxed text-text-secondary">
        {children && children.length > 0
          ? children
          : "By the end of this lesson you will understand this concept."}
      </p>
    </LessonSection>
  );
}