import type { LucideIcon } from "lucide-react";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES: Record<
  "tip" | "note" | "warning",
  { icon: LucideIcon; className: string; iconClass: string }
> = {
  tip: {
    icon: Lightbulb,
    className: "border-accent/25 bg-accent-soft/40",
    iconClass: "text-accent-hover",
  },
  note: {
    icon: Info,
    className: "border-border bg-base-subtle/40",
    iconClass: "text-text-secondary",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-warning/30 bg-warning-soft/40",
    iconClass: "text-warning",
  },
};

/**
 * A documentation callout. Tones: tip, note, warning. Kept restrained  -  used
 * sparingly across the docs so each one still carries weight.
 */
export function DocCallout({
  tone = "note",
  title,
  children,
  className,
}: {
  tone?: "tip" | "note" | "warning";
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const styles = TONES[tone];
  const Icon = styles.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3.5",
        styles.className,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", styles.iconClass)} aria-hidden="true" />
      <div className="min-w-0 text-[13.5px] leading-relaxed text-text-secondary">
        {title && (
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-text">
            {title}
          </p>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
