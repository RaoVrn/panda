import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flag,
  MessageSquareText,
  MousePointerClick,
  Play,
  Sparkles,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const steps = [
  { icon: <BookOpen className="size-4" aria-hidden="true" />, label: "Read" },
  { icon: <Sparkles className="size-4" aria-hidden="true" />, label: "Understand" },
  { icon: <MousePointerClick className="size-4" aria-hidden="true" />, label: "Open Playground" },
  { icon: <Play className="size-4" aria-hidden="true" />, label: "Practice" },
  { icon: <MessageSquareText className="size-4" aria-hidden="true" />, label: "Ask Panda AI" },
  { icon: <CheckCircle2 className="size-4" aria-hidden="true" />, label: "Complete Mission" },
  { icon: <Flag className="size-4" aria-hidden="true" />, label: "Continue" },
];

export function LearningFlow() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="A familiar rhythm"
        title="Every lesson follows the same flow"
        description="Once you learn the rhythm, every new topic feels easy. You never have to figure out how to learn. You just learn."
      />
      <div className="mx-auto mt-12 max-w-4xl">
        {/* Desktop: horizontal */}
        <ol className="hidden items-center justify-center gap-1 sm:flex">
          {steps.map((step, i) => (
            <li key={step.label} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-card text-accent-hover shadow-card transition-colors hover:border-accent/30">
                  {step.icon}
                </span>
                <span className="text-[11px] font-medium text-text-secondary">{step.label}</span>
              </motion.div>
              {i < steps.length - 1 && (
                <ArrowRight className="mx-2 size-4 text-text-muted/60" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>

        {/* Mobile: vertical */}
        <ol className="flex flex-col items-center gap-0 sm:hidden">
          {steps.map((step, i) => (
            <li key={step.label} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-card text-accent-hover shadow-card">
                  {step.icon}
                </span>
                <span className="text-[11px] font-medium text-text-secondary">{step.label}</span>
              </motion.div>
              {i < steps.length - 1 && <ArrowDown className="my-2 size-4 text-text-muted/60" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
