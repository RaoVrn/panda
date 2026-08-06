import { motion } from "framer-motion";
import { BookOpen, MousePointerClick } from "lucide-react";
import type { LessonMode } from "@/stores/lessonModeStore";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: LessonMode; label: string; hint: string; icon: typeof BookOpen }> = [
  { value: "read", label: "Read", hint: "watch the lesson", icon: BookOpen },
  { value: "interactive", label: "Playground", hint: "try it live", icon: MousePointerClick },
];

export interface LessonModeToggleProps {
  mode: LessonMode;
  onChange: (mode: LessonMode) => void;
}

/**
 * Segmented Read / Playground control. The active segment is a shared-layout
 * motion pill so switching animates smoothly (≈150ms) and the state is obvious
 * at a glance. Interactive mode opens the live Git playground.
 */
export function LessonModeToggle({ mode, onChange }: LessonModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Lesson mode"
      className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-base-subtle/60 p-0.5"
    >
      {OPTIONS.map(({ value, label, hint, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            title={`${label} — ${hint}`}
            onClick={() => onChange(value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
              active ? "text-text" : "text-text-muted hover:text-text",
            )}
          >
            {active && (
              <motion.span
                layoutId="lesson-mode-active"
                className="absolute inset-0 rounded-md bg-base-elevated shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
                aria-hidden="true"
              />
            )}
            <Icon
              className={cn(
                "relative z-10 size-3 transition-colors duration-150",
                active ? "text-accent-hover" : "text-text-muted",
              )}
              aria-hidden="true"
            />
            <span className="relative z-10">{label}</span>
            <span
              className={cn(
                "relative z-10 hidden rounded px-1 py-0.5 text-[9px] font-medium sm:inline",
                active ? "bg-accent-soft text-accent-hover" : "bg-base-subtle text-text-muted",
              )}
            >
              {hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
