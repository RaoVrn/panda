import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/components/ui/Badge";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  removable?: boolean;
  onRemove?: () => void;
}

export function Tag({
  tone: _tone = "neutral",
  removable = false,
  onRemove,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        "border border-border-subtle bg-base-subtle text-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${String(children)}`}
          onClick={onRemove}
          className="-mr-1 rounded-full p-0.5 text-text-muted transition-colors hover:bg-border-subtle hover:text-text"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2l6 6M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

export type { BadgeTone };
