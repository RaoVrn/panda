import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-base text-text-secondary">{description}</p>
      )}
    </div>
  );
}