import { AlertTriangle } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";

export interface CommonMistakesProps {
  items?: string[];
  index?: number;
}

export function CommonMistakes({ items, index = 6 }: CommonMistakesProps) {
  const list = items && items.length > 0 ? items : [];
  return (
    <LessonSection
      index={index}
      label="Common Mistakes"
      icon={<AlertTriangle className="size-4 text-warning" aria-hidden="true" />}
    >
      {list.length > 0 ? (
        <ul className="grid gap-2.5">
          {list.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-xl border border-warning/20 bg-warning-soft/40 px-4 py-3 text-sm text-text"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
          Common mistakes will render here.
        </div>
      )}
    </LessonSection>
  );
}