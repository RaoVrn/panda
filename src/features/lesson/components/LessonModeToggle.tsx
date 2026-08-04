import { BookOpen, MousePointerClick } from "lucide-react";
import type { LessonMode } from "@/stores/lessonModeStore";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: LessonMode; label: string; icon: typeof BookOpen }> = [
  { value: "read", label: "Read", icon: BookOpen },
  { value: "interactive", label: "Interactive", icon: MousePointerClick },
];

export interface LessonModeToggleProps {
  mode: LessonMode;
  onChange: (mode: LessonMode) => void;
}

/**
 * Segmented Read / Interactive control. Read animates every visualization
 * passively; Interactive makes them controllable. Called on by the sticky
 * lesson toolbar so the switch is always in reach.
 */
export function LessonModeToggle({ mode, onChange }: LessonModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Visualization mode"
      className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-base-subtle/60 p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-base-elevated text-text shadow-sm"
                : "text-text-muted hover:text-text",
            )}
          >
            <Icon
              className={cn("size-3", active && "text-accent-hover")}
              aria-hidden="true"
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}