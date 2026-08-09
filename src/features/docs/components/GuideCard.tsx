import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A compact feature card for the guide: icon, short title, one or two lines.
 * Used for "what you can do in Panda", AI capabilities and progress metrics.
 */
export function GuideCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-card p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-hover">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="text-[13px] leading-relaxed text-text-secondary">{children}</p>
    </div>
  );
}
