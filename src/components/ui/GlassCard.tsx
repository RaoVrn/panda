import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  blurred?: boolean;
}

export function GlassCard({
  blurred = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        "border-white/[0.06] bg-white/[0.03]",
        blurred && "backdrop-blur-md",
        "shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}