import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BookOpen, MessageSquareText, Sparkles } from "lucide-react";

/**
 * A small contextual diagram: how a question can become a course link. Kept to
 * three steps, it's the only diagram on the Panda AI page.
 */
export function AiFlow() {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-sm">
      <p className="sr-only">
        Flow: you ask a question, Panda understands the topic, then connects you to relevant
        Panda content.
      </p>
      <ol className="flex flex-col gap-0">
        <FlowNode icon={MessageSquareText} label="Your question" delay={0} reduce={reduce} />
        <FlowArrow />
        <FlowNode icon={Sparkles} label="Panda understands the topic" delay={0.1} reduce={reduce} />
        <FlowArrow />
        <FlowNode icon={BookOpen} label="Relevant Panda content" delay={0.2} reduce={reduce} />
      </ol>
    </div>
  );
}

function FlowNode({
  icon: Icon,
  label,
  delay,
  reduce,
}: {
  icon: typeof Sparkles;
  label: string;
  delay: number;
  reduce: boolean | null;
}) {
  const content = (
    <li className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-hover">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium text-text">{label}</span>
    </li>
  );
  if (reduce) return content;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="contents"
    >
      {content}
    </motion.div>
  );
}

function FlowArrow() {
  return (
    <li aria-hidden="true" className="flex h-7 items-center justify-center">
      <span className="relative flex items-center justify-center">
        <span className="absolute h-5 w-px bg-gradient-to-b from-accent/50 to-accent/10" />
        <ArrowDown
          className="relative z-10 size-3.5 -translate-y-1 rounded-full bg-base text-accent-hover"
          strokeWidth={2.5}
        />
      </span>
    </li>
  );
}
