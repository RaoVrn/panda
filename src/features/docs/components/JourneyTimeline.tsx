import { motion, useReducedMotion } from "framer-motion";
import { Eye, Lightbulb, MessageSquareText, Terminal, TrendingUp } from "lucide-react";

const STEPS = [
  { icon: Lightbulb, title: "Understand", body: "One Git idea at a time." },
  { icon: Eye, title: "Watch", body: "See what Git actually does." },
  { icon: Terminal, title: "Practice", body: "Try the command yourself." },
  { icon: MessageSquareText, title: "Ask", body: "Get unstuck any time." },
  { icon: TrendingUp, title: "Progress", body: "Watch your journey grow." },
];

/**
 * The Panda learning experience as a product journey timeline. Numbered steps
 * with short captions, deliberately not a flowchart with arrows.
 */
export function JourneyTimeline() {
  const reduce = useReducedMotion();

  return (
    <ol className="flex flex-col gap-2.5">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.07 }}
            className="flex items-center gap-3.5 rounded-xl border border-border-subtle bg-card px-4 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-[12px] font-semibold text-accent-hover">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-base-subtle text-text-secondary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text">{step.title}</span>
              <span className="block text-xs text-text-muted">{step.body}</span>
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}
