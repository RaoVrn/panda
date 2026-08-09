import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A realistic preview of a Panda lesson, styled to mirror the real lesson
 * surface (breadcrumb, title, visual, "what happens" takeaway, continue).
 * It is illustrative, not interactive.
 */
export function LessonPreviewCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 border-b border-border-subtle bg-base-subtle/40 px-4 py-2 text-[11px] text-text-muted">
        <span>Learn Git</span>
        <span aria-hidden="true" className="text-border-strong">/</span>
        <span>Core Commands</span>
        <span aria-hidden="true" className="text-border-strong">/</span>
        <span className="text-text-secondary">Git Commit</span>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-hover">
          Lesson 4 of 10
        </p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-text">Git Commit</h3>
        <p className="mt-1 text-[13.5px] leading-relaxed text-text-secondary">
          Save a snapshot of your work.
        </p>

        {/* Visual zone */}
        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-border-subtle bg-base-subtle/40 px-3 py-4">
          <span className="flex flex-col items-center gap-1 text-center">
            <FileTag name="index.html" />
            <span className="text-[10px] text-text-muted">Working Tree</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-accent-hover" aria-hidden="true" />
          <span className="flex flex-col items-center gap-1 text-center">
            <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
              <Check className="size-3.5" aria-hidden="true" />
            </span>
            <span className="text-[10px] text-text-muted">Snapshot saved</span>
          </span>
        </div>

        {/* What happens */}
        <div className="mt-4 rounded-xl border border-border-subtle bg-accent-soft/20 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            What happens?
          </p>
          <p className="mt-0.5 font-mono text-[13px] text-accent-hover">
            Working Tree <span aria-hidden="true">→</span> Repository
          </p>
        </div>

        {/* Continue */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[11px] text-text-muted">
            <span className="h-1 w-24 overflow-hidden rounded-full bg-base-subtle">
              <span className="block h-full w-2/5 rounded-full bg-accent" />
            </span>
            Reading
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex items-center gap-1 rounded-lg bg-accent px-3.5 py-1.5 text-[13px] font-medium text-text-inverse opacity-90",
            )}
          >
            Continue
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}

function FileTag({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-card px-2.5 py-1.5 font-mono text-[11px] text-text">
      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
      {name}
    </span>
  );
}
