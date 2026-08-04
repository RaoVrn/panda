import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

const traditional = [
  "Long walls of text",
  "Confusing diagrams",
  "Hard to remember",
  "No interaction",
];

const panda = [
  "Visual explanations",
  "Interactive practice",
  "AI guidance when stuck",
  "Learn by doing",
];

export function WhyPanda() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="Why Panda"
        title="Learning Git the way your brain actually works"
        description="Traditional tutorials make you memorize. Panda makes you understand."
      />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Card className="h-full border-danger/20 bg-danger-soft/40 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Traditional Tutorials
            </h3>
            <ul className="mt-5 space-y-3">
              {traditional.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-danger-soft">
                    <X className="size-3.5 text-danger" />
                  </span>
                  <span className="line-through decoration-text-muted/40">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
        >
          <Card className="h-full border-accent/20 bg-accent-soft/40 p-6 shadow-glow">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-hover">
              Panda
            </h3>
            <ul className="mt-5 space-y-3">
              {panda.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-text">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                    <Check className="size-3.5 text-accent-hover" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}