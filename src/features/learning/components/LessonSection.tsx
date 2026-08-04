import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LessonSectionProps {
  index?: number;
  label?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Consistent chrome for every block in the learning canvas:
 * a soft divider, optional step number, icon and section label.
 */
export function LessonSection({
  index,
  label,
  icon,
  children,
  className,
}: LessonSectionProps) {
  return (
    <section
      aria-label={label}
      className={cn("flex flex-col gap-4 border-t border-border-subtle py-10", className)}
    >
      {(label || index !== undefined) && (
        <div className="flex items-center gap-2.5">
          {index !== undefined && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-base-subtle font-mono text-xs text-text-secondary">
              {String(index).padStart(2, "0")}
            </span>
          )}
          {icon}
          {label && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              {label}
            </h3>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}