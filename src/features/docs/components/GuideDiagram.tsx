import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuideStep {
  icon: LucideIcon;
  label: string;
  sub?: string;
}

/**
 * A Panda-styled vertical flow diagram. Steps reveal sequentially with a soft
 * fade as they scroll into view, connected by animated chevron arrows. Use it
 * anywhere a process is better shown than described (learning loop, lesson
 * flow, progress). Respects the user's reduced-motion preference.
 */
export function GuideDiagram({
  steps,
  accentIndex,
  className,
  ariaLabel,
}: {
  steps: GuideStep[];
  /** Highlight this step with the Panda teal accent. */
  accentIndex?: number;
  className?: string;
  /** Short text summary for screen readers (the diagram is decorative). */
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();

  const summary = ariaLabel ?? `Flow: ${steps.map((s) => s.label).join(" → ")}`;

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="sr-only">{summary}</p>
      <ol className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const node = (
            <li key={step.label} className="flex flex-col">
              <StepNode
                step={step}
                active={i === accentIndex}
                index={i}
                reduce={reduce}
              />
              {i < steps.length - 1 && <ArrowConnector />}
            </li>
          );
          return node;
        })}
      </ol>
    </div>
  );
}

function ArrowConnector() {
  return (
    <div
      aria-hidden="true"
      className="flex h-7 items-center justify-center"
    >
      <span className="relative flex items-center justify-center">
        <span className="absolute h-5 w-px bg-gradient-to-b from-accent/50 to-accent/10" />
        <ChevronDown
          className="relative z-10 size-3.5 -translate-y-1 rounded-full bg-base text-accent-hover"
          strokeWidth={2.5}
        />
      </span>
    </div>
  );
}

function StepNode({
  step,
  active,
  index,
  reduce,
}: {
  step: GuideStep;
  active: boolean;
  index: number;
  reduce: boolean | null;
}) {
  const Icon = step.icon;
  const content = (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3",
        active
          ? "border-accent/40 bg-accent-soft/30 ring-1 ring-inset ring-accent/20"
          : "border-border-subtle",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-accent-soft text-accent-hover" : "bg-base-subtle text-text-secondary",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-sm font-medium", active ? "text-text" : "text-text-secondary")}>
          {step.label}
        </span>
        {step.sub && (
          <span className="mt-0.5 block text-xs leading-relaxed text-text-muted">{step.sub}</span>
        )}
      </span>
    </div>
  );

  if (reduce) return <div>{content}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.38, delay: index * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {content}
    </motion.div>
  );
}
