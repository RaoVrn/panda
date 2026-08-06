import { motion } from "framer-motion";
import { ArrowRight, MousePointerClick, Rocket } from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { useCommandPreview } from "../useCommandPreview";

const KIND_CLASS: Record<string, string> = {
  error: "text-[#ff7b72]",
  success: "text-[#7ee787]",
  warning: "text-[#e3b341]",
  muted: "text-[#8b949e]",
  output: "text-[#e6edf3]",
};

function LaunchButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="group flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-text-inverse shadow-glow transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <MousePointerClick className="size-4" aria-hidden="true" />
      Launch Interactive Playground
      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
    </motion.button>
  );
}

export interface PlaygroundPreviewProps {
  lesson: ContentLesson;
}

/**
 * The "Ready to try this yourself?" banner shown in Read mode after the first
 * explanation section. It invites the learner into the live playground with one
 * click and previews a real command from the lesson's solution.
 */
export function PlaygroundPreview({ lesson }: PlaygroundPreviewProps) {
  const preview = useCommandPreview(lesson);
  const { setMode } = useLessonMode();
  if (!lesson.playground) return null;

  return (
    <section aria-label="Try it in the playground" className="mt-8 overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent-soft/20 via-card to-card shadow-glow">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent-hover">
            <Rocket className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-text">
              Ready to try this yourself?
            </p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-text-secondary">
              Instead of just reading about Git, open Panda Playground and run the
              commands inside a live repository. You'll learn much faster by doing.
            </p>
            <div className="mt-4">
              <LaunchButton onClick={() => setMode("interactive")} />
            </div>
          </div>
        </div>

        {preview && (
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#010409]">
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#161b22] px-3 py-1.5">
              <span className="font-mono text-[10px] text-[#8b949e]">preview</span>
              <span className="font-mono text-[10px] text-[#8b949e]">panda-shell</span>
            </div>
            <div className="px-3.5 py-2.5 font-mono text-[12px] leading-6">
              <p className="whitespace-pre-wrap">
                <span className="select-none text-[#7ee787]">$ </span>
                <span className="text-[#79c0ff]">{preview.command}</span>
              </p>
              {preview.output && (
                <p className={KIND_CLASS[preview.kind] ?? KIND_CLASS.output}> {preview.output}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMode("interactive")}
              className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] bg-[#161b22] px-3 py-2 text-[11px] font-medium text-[#79c0ff] transition-colors hover:text-[#e6edf3]"
            >
              Try this command live
              <ArrowRight className="size-3" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export interface InlineCommandPreviewProps {
  lesson: ContentLesson;
  commandIndex?: number;
}

/** A one-line "practice this live" affordance for read-mode blocks. */
export function PlaygroundTryIt({ lesson }: { lesson: ContentLesson }) {
  const { setMode } = useLessonMode();
  if (!lesson.playground) return null;
  return (
    <button
      type="button"
      onClick={() => setMode("interactive")}
      className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent-soft/20 px-3 py-2.5 text-[13px] font-medium text-accent-hover transition-colors hover:bg-accent-soft/35 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
    >
      <MousePointerClick className="size-4" aria-hidden="true" />
      Practice this in the playground
      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

/**
 * A tiny standalone terminal strip for Read mode: one real command from the
 * lesson's solution and a "try it live" affordance that jumps into the
 * playground.
 */
export function InlineCommandPreview({ lesson, commandIndex = 0 }: InlineCommandPreviewProps) {
  const preview = useCommandPreview(lesson, commandIndex);
  const { setMode } = useLessonMode();
  if (!preview) return null;

  return (
    <button
      type="button"
      onClick={() => setMode("interactive")}
      className="group mt-3 flex w-full items-center gap-3 overflow-hidden rounded-xl border border-white/[0.03] bg-[#010409] px-3.5 py-2.5 text-left transition-colors hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
      aria-label={`Try ${preview.command} live in the playground`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[12px]">
          <span className="select-none text-[#7ee787]">$ </span>
          <span className="text-[#79c0ff]">{preview.command}</span>
        </span>
        {preview.output && (
          <span className="mt-0.5 block truncate font-mono text-[11px] text-[#8b949e]">
            {preview.output.split("\n").join(" · ").slice(0, 120)}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-accent-hover">
        Try this command live
        <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </button>
  );
}
