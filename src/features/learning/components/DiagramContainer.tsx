import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DiagramContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  caption?: string;
  children: ReactNode;
}

/**
 * Framed container for visual content (diagrams, graphs, trees).
 * Provides consistent chrome so future visualizations stay on-brand.
 */
export function DiagramContainer({
  title,
  caption,
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
        <figcaption className="border-b border-border-subtle px-5 py-3.5">
          <p className="text-sm font-medium text-text">{title}</p>
          {caption && (
            <p className="mt-0.5 text-xs text-text-muted">{caption}</p>
          )}
        </figcaption>
      )}
      <div className="p-5">{children}</div>
    </figure>
  );
}