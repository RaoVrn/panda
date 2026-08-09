import { BookOpen, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Read vs Interactive as a side-by-side comparison. Each mode gets a distinct
 * card with its own visual, so the difference is clear at a glance.
 */
export function ModeComparison() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ModeCard
        icon={<BookOpen className="size-4" aria-hidden="true" />}
        title="Read"
        bestFor="Understanding a new concept"
        accent={false}
        preview={<ReadPreview />}
      >
        <li>Follows the lesson like a guided explanation.</li>
        <li>Visuals animate on their own to show what Git does.</li>
      </ModeCard>

      <ModeCard
        icon={<MousePointerClick className="size-4" aria-hidden="true" />}
        title="Interactive"
        bestFor="Experimenting and seeing what happens"
        accent
        preview={<InteractivePreview />}
      >
        <li>Drive the lesson and type real Git commands.</li>
        <li>Watch the repository update as you go.</li>
      </ModeCard>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  bestFor,
  accent,
  preview,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  bestFor: string;
  accent: boolean;
  preview: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5",
        accent ? "border-accent/40 bg-accent-soft/20" : "border-border-subtle bg-card",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            accent ? "bg-accent-soft text-accent-hover" : "bg-base-subtle text-text-secondary",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-[11.5px] text-text-muted">Best for: {bestFor}</p>
        </div>
      </div>

      {preview}

      <ul className="flex flex-col gap-1.5">{children}</ul>
    </div>
  );
}

function ReadPreview() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-base-subtle/40 p-3">
      <div className="h-2 w-2/3 rounded-full bg-text/70" />
      <div className="h-1.5 w-full rounded-full bg-text/15" />
      <div className="h-1.5 w-full rounded-full bg-text/15" />
      <div className="h-1.5 w-4/5 rounded-full bg-text/15" />
      <span className="mt-1 text-[10px] text-text-muted">The lesson plays itself as you read.</span>
    </div>
  );
}

function InteractivePreview() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-[#0d1117] p-3"
    >
      <span className="font-mono text-[11px] text-[#e6edf3]">
        <span className="text-accent-hover">$</span> git status
      </span>
      <span className="font-mono text-[10px] text-[#7ee787]">index.html is staged</span>
      <span className="mt-0.5 text-[10px] text-text-muted">Your command, your repo.</span>
    </div>
  );
}
