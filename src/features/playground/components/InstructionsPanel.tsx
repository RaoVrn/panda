import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Clock, RotateCcw } from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, titleCase } from "@/lib/utils";
import { usePlaygroundStore } from "../playgroundStore";
import { cn } from "@/lib/utils";

export interface InstructionsPanelProps {
  lesson: ContentLesson;
}

/**
 * Lesson instructions for the playground: title, description and learning
 * goals, plus the Reset action that rewinds the sandbox to the lesson start.
 */
export function InstructionsPanel({ lesson }: InstructionsPanelProps) {
  const resetLesson = usePlaygroundStore((state) => state.resetLesson);
  const [confirming, setConfirming] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const goals = lesson.learningGoals ?? [];

  const handleReset = () => {
    if (confirming) {
      resetLesson();
      setConfirming(false);
    } else {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 2500);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.03] bg-card/95 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
      <div className="border-b border-white/[0.03] bg-white/[0.01] px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{titleCase(lesson.meta.module)}</Badge>
          {lesson.meta.difficulty && <Badge tone="accent">{lesson.meta.difficulty}</Badge>}
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <Clock className="size-3" aria-hidden="true" />
            {formatDuration(lesson.meta.durationMinutes ?? 0)}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              "ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 text-[11px] font-medium transition-colors",
              confirming
                ? "border-[#3fb950]/30 bg-[#3fb950]/[0.08] text-[#3fb950]"
                : "text-text-muted hover:border-white/[0.10] hover:bg-white/[0.06] hover:text-text",
            )}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {confirming ? "Click to confirm" : "Reset sandbox"}
          </button>
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-text sm:text-2xl">{lesson.title}</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-text-secondary">{lesson.description}</p>
      </div>

      {goals.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setGoalsOpen((value) => !value)}
            aria-expanded={goalsOpen}
            className="flex w-full items-center gap-2 px-5 py-2 text-left"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-accent-hover">
              Your goal
            </span>
            <ChevronDown
              className={cn("size-3.5 text-text-muted transition-transform", goalsOpen && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          {goalsOpen && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="grid gap-1.5 px-5 pb-4 sm:grid-cols-2"
            >
              {goals.map((goal) => (
                <li key={goal} className="flex items-start gap-2 text-[13px] leading-snug text-text-secondary">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent-hover" aria-hidden="true" />
                  <span className="min-w-0">{goal}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      )}
    </section>
  );
}
