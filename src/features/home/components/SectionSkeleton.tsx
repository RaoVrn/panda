import { cn } from "@/lib/utils";

export interface SectionSkeletonProps {
  rows?: number;
  compact?: boolean;
  className?: string;
}

export function SectionSkeleton({
  rows = 4,
  compact = false,
  className,
}: SectionSkeletonProps) {
  return (
    <section
      aria-hidden="true"
      className={cn("space-y-6 py-16 sm:py-20", compact && "py-8", className)}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-base-subtle" />
        <div className="h-7 w-3/4 animate-pulse rounded-lg bg-base-subtle" />
        <div className="h-4 w-full animate-pulse rounded bg-base-subtle" />
      </div>
      <div
        className={cn(
          "grid gap-4",
          rows > 1 ? "sm:grid-cols-2 lg:grid-cols-4" : "mx-auto max-w-2xl",
        )}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-border-subtle bg-card"
          />
        ))}
      </div>
    </section>
  );
}