import { motion } from "framer-motion";
import { Target } from "lucide-react";
import type { ContentLearningGoalBlock } from "@/content/schema";

/**
 * A framed "learning goal" banner that anchors the lesson with a clear,
 * single-sentence outcome. Rendered once near the top of a lesson.
 */
export function LearningGoalBlock({ block }: { block: ContentLearningGoalBlock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
        <Target className="size-4 text-accent-hover" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          Learning goal
        </p>
        <p className="mt-1 text-sm leading-relaxed text-text">{block.text}</p>
      </div>
    </motion.div>
  );
}