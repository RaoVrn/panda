import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({
  interactive = false,
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-card shadow-card",
        padded && "p-6",
        interactive &&
          "transition-colors duration-150 hover:border-border hover:bg-card-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}