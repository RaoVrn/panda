import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, EyeOff, Lightbulb, TerminalSquare } from "lucide-react";
import type { ContentPracticeBlock } from "@/content/schema";

function Disclosure({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-base-subtle/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-xs font-medium text-text-muted transition-colors hover:text-text"
      >
        {icon}
        {label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="ml-auto flex"
        >
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-xs leading-relaxed text-text-secondary">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Practice challenge redesigned as a focused exercise: a clear problem, an
 * answer box for the learner to jot their thoughts, a hint, and a sample answer
 * they can reveal afterwards. Lights on the learner, no fake state.
 */
export function PracticeBlock({ block }: { block: ContentPracticeBlock }) {
  const [answer, setAnswer] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      <div className="flex items-center gap-2.5 border-b border-border-subtle bg-base-subtle/50 px-5 py-4">
        <TerminalSquare className="size-4 text-accent-hover" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          {block.title ?? "Practice challenge"}
        </p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="rounded-xl border border-border-subtle bg-base-subtle/50 p-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            The problem
          </p>
          <p className="text-sm leading-relaxed text-text">{block.description}</p>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Your answer
          </p>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={4}
            placeholder="Write your answer here…"
            aria-label="Your answer"
            className="w-full resize-y rounded-xl border border-border-subtle bg-base-subtle/40 px-4 py-3 text-sm leading-relaxed text-text placeholder:text-text-muted transition-colors focus:border-border-strong focus:bg-base-subtle focus:outline-none"
          />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setAnswer("")}
              disabled={!answer.trim()}
              className="text-xs text-text-muted transition-colors hover:text-text disabled:pointer-events-none disabled:opacity-40"
            >
              Reset answer
            </button>
            <span className="text-xs tabular-nums text-text-muted">
              {answer.length} characters
            </span>
          </div>
        </div>

        {block.hint && (
          <Disclosure
            label="Stuck? Reveal a hint"
            icon={<Lightbulb className="size-3.5 text-warning" aria-hidden="true" />}
          >
            {block.hint}
          </Disclosure>
        )}

        {block.exampleAnswer && (
          <Disclosure
            label="Reveal a sample answer"
            icon={
              answer.trim() ? (
                <Eye className="size-3.5 text-accent-hover" aria-hidden="true" />
              ) : (
                <EyeOff className="size-3.5 text-text-muted" aria-hidden="true" />
              )
            }
          >
            {block.exampleAnswer}
          </Disclosure>
        )}

        {answer.trim() && (
          <p aria-live="polite" className="text-xs text-text-muted">
            Nice — compare your idea with the sample above whenever you’re ready.
          </p>
        )}
      </div>
    </motion.div>
  );
}