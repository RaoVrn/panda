import { ArrowDown, Circle, Diamond } from "lucide-react";
import type { FlowChartData, FlowChartStep } from "@/types/lesson";
import { cn } from "@/lib/utils";
import { DiagramContainer } from "@/features/learning/components/DiagramContainer";

const stepTypeClass: Record<NonNullable<FlowChartStep["type"]>, string> = {
  start: "border-accent/40 bg-accent-soft text-accent-hover",
  action: "border-border bg-base-subtle text-text",
  decision: "border-warning/40 bg-warning-soft text-warning",
  end: "border-danger/40 bg-danger-soft text-danger",
};

function StepShape({ step }: { step: FlowChartStep }) {
  if (step.type === "decision") {
    return <Diamond className="size-4 shrink-0" aria-hidden="true" />;
  }
  if (step.type === "start" || step.type === "end") {
    return <Circle className="size-3.5 shrink-0" aria-hidden="true" />;
  }
  return null;
}

/**
 * Renders structured FlowChartData. Generic and data-driven so any future
 * lesson diagram can render here without new UI.
 */
export function FlowchartContainer({ data }: { data: FlowChartData }) {
  const steps = data.steps;

  if (steps.length === 0) {
    return (
      <DiagramContainer title={data.title}>
        <p className="py-6 text-center text-sm text-text-muted">
          Flowchart coming soon.
        </p>
      </DiagramContainer>
    );
  }

  return (
    <DiagramContainer title={data.title}>
      <ol className="flex flex-col gap-1">
        {steps.map((step, index) => (
          <li key={step.id} className="flex flex-col">
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3",
                stepTypeClass[step.type ?? "action"],
              )}
            >
              <StepShape step={step} />
              <span className="text-sm font-medium">{step.label}</span>
              {step.note && (
                <span className="ml-auto text-xs text-text-muted">
                  {step.note}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <span className="mx-auto my-1 text-text-muted" aria-hidden="true">
                <ArrowDown className="size-4" />
              </span>
            )}
          </li>
        ))}
      </ol>
    </DiagramContainer>
  );
}