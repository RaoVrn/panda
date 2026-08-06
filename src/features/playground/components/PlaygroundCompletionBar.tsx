import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, PartyPopper, Rocket } from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { usePlaygroundStore } from "../playgroundStore";
import { usePlaygroundRepository } from "../usePlayground";
import { playgroundProgress } from "../taskValidator";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { lessonXp } from "@/features/progress/xp";

export interface PlaygroundCompletionBarProps {
  lesson: ContentLesson;
  previous?: ContentLesson;
  next?: ContentLesson;
}

/**
 * A compact (≈56–64px) footer for the interactive playground. When every
 * mission objective is complete it shows a celebratory banner with a quiz
 * link and next-lesson CTA. Below that (always) a slim prev/next bar.
 */
export function PlaygroundCompletionBar({ lesson, previous, next }: PlaygroundCompletionBarProps) {
  const config = usePlaygroundStore((state) => state.config);
  const repo = usePlaygroundRepository();
  const { setMode } = useLessonMode();

  const objectives = useMemo(() => config?.objectives ?? [], [config]);
  const progress = useMemo(
    () => (repo && config ? playgroundProgress(repo, objectives) : { done: 0, total: 0 }),
    [repo, config, objectives],
  );
  const allDone = progress.total > 0 && progress.done === progress.total;
  const xp = lessonXp(lesson);

  return (
    <div className="space-y-3">
      {/* Completion banner — only when mission done */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-4 rounded-xl border border-[#3fb950]/20 bg-[#3fb950]/5 px-4 py-3"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#3fb950]/15 text-[#3fb950]">
            <PartyPopper className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-text">
              Playground complete
              {xp > 0 && <span className="ml-1 font-normal text-text-muted">· +{xp} XP earned</span>}
            </p>
            <p className="text-[12px] text-text-muted">You're ready for the quiz.</p>
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => setMode("read")}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[11px] font-semibold text-text-inverse transition-colors hover:bg-accent-hover"
            >
              <Rocket className="size-3.5" aria-hidden="true" />
              Back to lesson
            </button>
          </div>
        </motion.div>
      )}

      {/* Slim nav bar — always visible */}
      <div className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-2.5">
        {previous ? (
          <a
            href={`/lesson/${previous.slug}`}
            className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span className="hidden truncate sm:inline">{previous.title}</span>
          </a>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => setMode("read")}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text"
        >
          <BookOpen className="size-3.5" aria-hidden="true" />
          <span>View lesson</span>
        </button>

        {next ? (
          <a
            href={`/lesson/${next.slug}`}
            className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted transition-colors hover:text-text"
          >
            <span className="hidden truncate sm:inline">{next.title}</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
