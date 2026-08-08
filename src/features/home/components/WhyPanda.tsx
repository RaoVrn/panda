import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

const traditionalFlow = [
  "Walls of text",
  "Documentation you skim",
  "Watching videos",
  "Passive learning",
  "Memorize and hope",
];

const pandaFlow = [
  "One idea at a time",
  "See it, don't just read it",
  "Hands-on practice",
  "AI guidance when stuck",
  "Real understanding",
];

function FlowColumn({
  title,
  items,
  tone,
  icon,
}: {
  title: string;
  items: string[];
  tone: "bad" | "good";
  icon: React.ReactNode;
}) {
  return (
    <Card
      className={
        "h-full p-6 " +
        (tone === "bad"
          ? "border-danger/20 bg-danger-soft/40"
          : "border-accent/20 bg-accent-soft/40 shadow-glow")
      }
    >
      <h3
        className={
          "flex items-center gap-2 text-sm font-semibold uppercase tracking-wide " +
          (tone === "bad" ? "text-text-secondary" : "text-accent-hover")
        }
      >
        {icon}
        {title}
      </h3>
      <ol className="mt-5 space-y-0">
        {items.map((item, i) => (
          <li key={item}>
            <div className="flex items-center gap-3 py-1.5">
              <span
                className={
                  "flex size-6 shrink-0 items-center justify-center rounded-full " +
                  (tone === "bad" ? "bg-danger-soft" : "bg-accent-soft")
                }
              >
                {tone === "bad" ? (
                  <X className="size-3.5 text-danger" aria-hidden="true" />
                ) : (
                  <Check className="size-3.5 text-accent-hover" aria-hidden="true" />
                )}
              </span>
              <span
                className={
                  "text-sm " +
                  (tone === "bad"
                    ? "text-text-muted line-through decoration-text-muted/40"
                    : "text-text")
                }
              >
                {item}
              </span>
            </div>
            {i < items.length - 1 && (
              <div className="ml-6 h-4 border-l border-dashed border-border-strong/40" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function WhyPanda() {
  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="Why Panda"
        title="Learning Git the way your brain actually works"
        description="Most tutorials make you memorize commands you don't understand. Panda builds real understanding by making Git visible and hands-on."
      />
      <div className="mx-auto mt-12 grid max-w-4xl items-start gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <FlowColumn
            title="The old way"
            items={traditionalFlow}
            tone="bad"
            icon={<X className="size-3.5" aria-hidden="true" />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
        >
          <FlowColumn
            title="Panda"
            items={pandaFlow}
            tone="good"
            icon={<Check className="size-3.5" aria-hidden="true" />}
          />
        </motion.div>
      </div>
    </section>
  );
}
