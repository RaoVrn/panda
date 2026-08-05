import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { ContentPracticeBlock } from "@/content/schema";
import { Button } from "@/components/ui/Button";
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
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-base-subtle/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:text-text"
      >
        {icon}
        {label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="ml-auto flex"
        >
          <ChevronDown className="size-3" aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 text-xs leading-relaxed text-text-secondary">
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
      message: `Nice. You said it: ${hits.slice(0, 2).join(" + ")}.`,
    };
  }
  if (hits.length === 1) {
    return {
      tone: "good",
      message: `Good. You mentioned “${hits[0]}”. Compare with the sample answer.`,
    };
  }
  return {
    tone: "nudge",
    message: "Close. Tap “Need a hint?” and try again.",
  };
}

export interface PracticeBlockProps {
  block: ContentPracticeBlock;
  /**
   * Feature flag so mini challenges can later be hidden via user preferences.
   * When false the component renders nothing.
   */
  showMiniChallenge?: boolean;
}

/**
 * Mini challenge: a 30-second checkpoint, not an assignment. Question → answer
 * → check, all in one glance. Hints and sample answers stay collapsed. No
 * exam vibes — just a quick nudge to think before moving on.
 */
export function PracticeBlock({
  block,
  showMiniChallenge = true,
}: PracticeBlockProps) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-grow the answer box only as the learner types.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [answer]);

  if (!showMiniChallenge) return null;

  const trimmed = answer.trim();
  const feedback = feedbackFor(trimmed);

  const check = () => {
    if (!trimmed || checked) return;
    setChecked(true);
  };

  const reset = () => {
    setAnswer("");
    setChecked(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      {/* Question */}
      <div className="flex items-start gap-2.5 px-4 py-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-soft">
          <Target className="size-3.5 text-accent-hover" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent-hover">
            {block.title ?? "Mini challenge"}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-text">{block.description}</p>
        </div>
      </div>

      {/* Answer + check */}
      <div className="border-t border-border-subtle px-4 py-3">
        <textarea
          ref={taRef}
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setChecked(false);
          }}
          rows={2}
          placeholder="Write your answer…"
          aria-label="Your answer"
          className="block w-full resize-none rounded-lg border border-border-subtle bg-base-subtle/40 px-3 py-2 text-sm leading-relaxed text-text placeholder:text-text-muted transition-colors focus:border-border-strong focus:bg-base-subtle focus:outline-none"
        />

        <div className="mt-2 flex items-center gap-2">
          <AnimatePresence>
            {checked && (
              <motion.p
                key="feedback"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-live="polite"
                className={cn(
                  "mr-auto flex items-center gap-1.5 text-xs font-medium",
                  feedback.tone === "great" ? "text-accent-hover" : "text-warning",
                )}
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                {feedback.message}
              </motion.p>
            )}
          </AnimatePresence>

          {trimmed && !checked && (
            <button
              type="button"
              onClick={reset}
              aria-label="Reset answer"
              className="flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle hover:text-text"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={check}
            disabled={!trimmed || checked}
            leftIcon={<ShieldCheck className="size-3.5" aria-hidden="true" />}
          >
            {checked ? "Checked" : "Check answer"}
          </Button>
        </div>
      </div>

      {/* Hints — always collapsed */}
      {(block.hint || block.exampleAnswer) && (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle bg-base-subtle/30 px-4 py-2.5">
          {block.hint && (
            <Disclosure
              label="Need a hint?"
              icon={<Lightbulb className="size-3 text-warning" aria-hidden="true" />}
            >
              {block.hint}
            </Disclosure>
          )}
          {block.exampleAnswer && (
            <Disclosure
              label="Show sample answer"
              icon={
                trimmed ? (
                  <Eye className="size-3 text-accent-hover" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-3 text-text-muted" aria-hidden="true" />
                )
              }
            >
              {block.exampleAnswer}
            </Disclosure>
          )}
        </div>
      )}
    </div>
  );
}
