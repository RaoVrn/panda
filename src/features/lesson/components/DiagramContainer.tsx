import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiagramContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  caption?: string;
  /** Optional icon shown next to the title for consistent viz headers. */
  icon?: LucideIcon;
  /** Full-bleed footer strip (e.g. playback controls) under the content. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Framed container for visual content (diagrams, graphs, trees).
 * Provides consistent chrome so future visualizations stay on-brand.
 */
export function DiagramContainer({
  title,
  caption,
  icon: Icon,
  footer,
  children,
  className,
  ...props
}: DiagramContainerProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card",
        className,
      )}
      {...props}
    >
      {title && (
        <figcaption className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/50 px-4 py-3">
          {Icon && <Icon className="size-3.5 text-accent-hover" aria-hidden="true" />}
          <p className="text-sm font-medium text-text">{title}</p>
          {caption && (
            <span className="ml-auto hidden text-xs text-text-muted sm:inline">
              {caption}
            </span>
          )}
        </figcaption>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="bg-base-subtle/30">{footer}</div>}
    </figure>
  );
}