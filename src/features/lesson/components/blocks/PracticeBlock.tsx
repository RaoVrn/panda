import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, EyeOff, Lightbulb, RotateCcw, ShieldCheck } from "lucide-react";
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
    <div className="overflow-hidden rounded-lg border border-white/[0.04] bg-white/[0.01]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text"
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
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2.5 text-xs leading-relaxed text-text-secondary">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const KEY_IDEAS = [
  "save", "snapshot", "back", "go back", "version", "restore", "redo",
  "time machine", "recover", "before",
];

function feedbackFor(answer: string): { tone: "great" | "good" | "nudge"; message: string } {
  const text = answer.toLowerCase();
  const hits = KEY_IDEAS.filter((k) => text.includes(k));
  if (hits.length >= 2) return { tone: "great", message: `Nice. You said it: ${hits.slice(0, 2).join(" + ")}.` };
  if (hits.length === 1) return { tone: "good", message: `Good. You mentioned “${hits[0]}”. Compare with the sample answer.` };
  return { tone: "nudge", message: "Close. Tap “Need a hint?” and try again." };
}

export interface PracticeBlockProps {
  block: ContentPracticeBlock;
  showMiniChallenge?: boolean;
}

/**
 * A quick inline checkpoint, not an assignment. Compact, low-contrast, and
 * integrated into the reading flow  -  a small pause to think before moving on.
 * Hints and sample answers stay collapsed until asked for.
 */
export function PracticeBlock({
  block,
  showMiniChallenge = true,
}: PracticeBlockProps) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const recordPractice = useProgressStore((state) => state.recordPractice);

  useEffect(() => {
    if (checked) recordPractice(block.id);
  }, [checked, block.id, recordPractice]);

  useReportAi(
    { practice: `"${block.description}" (${checked ? "answered" : "not answered yet"})` },
    [block.description, checked],
  );

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 88) + "px";
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
    <div className="overflow-hidden rounded-xl border border-white/[0.03] bg-white/[0.01]">
      {/* Question */}
      <div className="flex items-start gap-2.5 px-3.5 py-2.5">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-accent/8">
          <ShieldCheck className="size-3 text-accent-hover" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent-hover">
            {block.title ?? "Checkpoint"}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-text">{block.description}</p>
        </div>
      </div>

      {/* Answer + check */}
      <div className="border-t border-white/[0.03] px-3.5 py-2.5">
        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setChecked(false);
            }}
            rows={1}
            placeholder="Type your answer…"
            aria-label="Your answer"
            className="block min-h-[36px] w-full resize-none rounded-lg border border-white/[0.05] bg-white/[0.01] px-3 py-2 text-[13px] leading-relaxed text-text placeholder:text-text-muted transition-colors focus:border-accent/30 focus:bg-white/[0.02] focus:outline-none"
          />
          {trimmed && !checked && (
            <button
              type="button"
              onClick={reset}
              aria-label="Reset answer"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-white/[0.04] hover:text-text"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={check}
            disabled={!trimmed || checked}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-colors",
              checked
                ? "bg-[#238636] text-white"
                : "bg-accent text-text-inverse hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {checked ? "✓ Checked" : "Check"}
          </button>
        </div>

        <AnimatePresence>
          {checked && (
            <motion.p
              key="feedback"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-live="polite"
              className={cn(
                "mt-2 flex items-center gap-1.5 text-xs font-medium",
                feedback.tone === "great" ? "text-accent-hover" : "text-warning",
              )}
            >
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {feedback.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Hints  -  always collapsed */}
      {(block.hint || block.exampleAnswer) && (
        <div className="flex flex-wrap gap-1.5 border-t border-white/[0.03] px-3 py-2">
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
