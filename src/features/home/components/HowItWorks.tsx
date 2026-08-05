import { motion } from "framer-motion";
import { ArrowDown, BookOpen, FlaskConical, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: BookOpen,
    title: "Learn visually",
    description: "Understand each concept with diagrams, graphs and real-life analogies.",
  },
  {
    icon: FlaskConical,
    title: "Practice interactively",
    description: "Run commands in a simulated terminal and watch the result instantly.",
  },
  {
    icon: Target,
    title: "Experiment safely",
    description: "Make mistakes in a safe sandbox where nothing can break.",
  },
  {
    icon: Sparkles,
    title: "Become confident",
    description: "Reinforce with quizzes, challenges and AI-powered guidance.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="How it works"
        title="Four steps from curious to confident"
        description="Panda follows the natural way you learn. See, do, break, master."
      />
      <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-0">
        {steps.map((step, index) => (
          <div key={step.title} className="flex w-full flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex w-full items-center gap-5"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-card shadow-card">
                <step.icon className="size-5 text-accent-hover" />
              </div>
              <div className="flex-1 border-b border-border-subtle pb-5">
                <h3 className="text-base font-semibold text-text">
                  <span className="mr-2 font-mono text-xs text-text-muted">
                    0{index + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            </motion.div>
            {index < steps.length - 1 && (
              <ArrowDown
                className="my-3 size-4 text-text-muted"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}