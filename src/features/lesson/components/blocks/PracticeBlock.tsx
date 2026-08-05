import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { ContentPracticeBlock } from "@/content/schema";
import { useReportAi } from "@/stores/aiContextStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { cn } from "@/lib/utils";

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

const KEY_IDEAS = [
  "save",
  "snapshot",
  "back",
  "go back",
  "version",
  "restore",
  "redo",
  "time machine",
  "recover",
  "before",
];

function feedbackFor(answer: string): { tone: "great" | "good" | "nudge"; message: string } {
  const text = answer.toLowerCase();
  const hits = KEY_IDEAS.filter((k) => text.includes(k));
  if (hits.length >= 2) {
    return {
      tone: "great",
      message: `Nice. You said it yourself: ${hits.slice(0, 2).join(" and ")}. That’s exactly the superpower Git gives you.`,
    };
  }
  if (hits.length === 1) {
    return {
      tone: "good",
      message: `You mentioned “${hits[0]}”. You’re right there. Compare your answer with the sample below.`,
    };
  }
  return {
    tone: "nudge",
    message:
      "You’re thinking about it. Need a nudge? Press “Stuck? Reveal a hint” below, then try again.",
  };
}

/**
 * Mini challenge: a tiny mission the learner answers in their own words. An
 * instant, friendly check responds naturally based on what they wrote, then
 * invites them to compare with a sample answer. No real AI here. Just clear,
 * encouraging feedback that never says "wrong".
 */
export function PracticeBlock({ block }: { block: ContentPracticeBlock }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const recordPractice = useProgressStore((state) => state.recordPractice);

  // Award practice XP the moment the learner checks their answer.
  useEffect(() => {
    if (checked) recordPractice(block.id);
  }, [checked, block.id, recordPractice]);

  useReportAi(
    {
      practice: `"${block.description}" (${checked ? "answered" : "not answered yet"})`,
    },
    [block.description, checked],
  );

  const trimmed = answer.trim();
  const feedback = feedbackFor(trimmed);

  const check = () => {
    if (!trimmed || checked) return;
    setChecked(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      <div className="flex items-center gap-2.5 border-b border-border-subtle bg-base-subtle/50 px-5 py-4">
        <Target className="size-4 text-accent-hover" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-hover">
          {block.title ?? "Mini challenge"}
        </p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="rounded-xl border border-border-subtle bg-base-subtle/50 p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <Sparkles className="size-3.5 text-accent-hover" aria-hidden="true" />
            Your mission
          </p>
          <p className="text-sm leading-relaxed text-text">{block.description}</p>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Your answer
          </p>
          <textarea
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setChecked(false);
            }}
            rows={4}
            placeholder="Write it in your own words…"
            aria-label="Your answer"
            className="w-full resize-y rounded-xl border border-border-subtle bg-base-subtle/40 px-4 py-3 text-sm leading-relaxed text-text placeholder:text-text-muted transition-colors focus:border-border-strong focus:bg-base-subtle focus:outline-none"
          />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setAnswer("");
                setChecked(false);
              }}
              disabled={!trimmed}
              className="text-xs text-text-muted transition-colors hover:text-text disabled:pointer-events-none disabled:opacity-40"
            >
              Reset answer
            </button>
            <span className="text-xs tabular-nums text-text-muted">
              {answer.length} characters
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={check}
          disabled={!trimmed || checked}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-text-inverse ring-1 ring-inset ring-white/10 transition-colors hover:bg-accent-hover active:bg-accent-hover/85 disabled:pointer-events-none disabled:opacity-50"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          Check my answer
        </button>

        <AnimatePresence>
          {checked && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3",
                feedback.tone === "great"
                  ? "border-accent/30 bg-accent-soft/50"
                  : "border-warning/30 bg-warning-soft/50",
              )}
              aria-live="polite"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  feedback.tone === "great" ? "bg-accent text-base" : "bg-warning text-base",
                )}
              >
                {feedback.tone === "great" ? (
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <Sparkles className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <p className="text-sm leading-relaxed text-text-secondary">{feedback.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
              trimmed ? (
                <Eye className="size-3.5 text-accent-hover" aria-hidden="true" />
              ) : (
                <EyeOff className="size-3.5 text-text-muted" aria-hidden="true" />
              )
            }
          >
            {block.exampleAnswer}
          </Disclosure>
        )}

        {checked && block.exampleAnswer && (
          <p className="text-xs text-text-muted">
            Compare your idea with the sample above. A perfect answer never has to be word-for-word.
          </p>
        )}
      </div>
    </motion.div>
  );
}