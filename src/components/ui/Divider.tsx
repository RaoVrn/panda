import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-border-subtle",
        className,
      )}
      {...props}
    />
  );
}