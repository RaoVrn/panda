import { ListChecks } from "lucide-react";
import { LessonSection } from "@/features/learning/components/LessonSection";

export interface KeyTakeawaysProps {
  items?: string[];
  index?: number;
}

export function KeyTakeaways({ items, index = 5 }: KeyTakeawaysProps) {
  const list = items && items.length > 0 ? items : [];
  return (
    <LessonSection
      index={index}
      label="Key Takeaways"
      icon={<ListChecks className="size-4 text-accent-hover" aria-hidden="true" />}
    >
      {list.length > 0 ? (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {list.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-xl bg-base-subtle px-4 py-3 text-sm text-text-secondary"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
          Takeaways will render here.
        </div>
      )}
    </LessonSection>
  );
}