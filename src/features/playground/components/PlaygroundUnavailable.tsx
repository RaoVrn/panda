import { Construction, MousePointerClick } from "lucide-react";
import type { ContentLesson } from "@/content/schema";

/**
 * Shown when the learner switches to Interactive mode but the lesson does not
 * (yet) have a Playground. Read and Playground are independent experiences;
 * a lesson without a sandbox should never duplicate its read content here.
 */
export function PlaygroundUnavailable({ lesson }: { lesson: ContentLesson }) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.03] bg-card/95 px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/[0.08] text-accent-hover">
        <Construction className="size-6" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-text">
          Playground coming soon
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">
          The Playground for <span className="font-medium text-text">{lesson.title}</span> isn't
          ready yet. Switch to <span className="font-medium text-text">Read</span> mode to keep
          learning in the meantime.
        </p>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <MousePointerClick className="size-3" aria-hidden="true" />
        Interactive mode needs a playground configuration
      </p>
    </section>
  );
}
