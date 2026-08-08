import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Clock, Flag, Target } from "lucide-react";
import { objectiveStatuses } from "../taskValidator";
import { usePlaygroundRepository, usePlaygroundRemote } from "../usePlayground";
import { usePlaygroundStore } from "../playgroundStore";
import { cn } from "@/lib/utils";

export interface MissionSummaryProps {
  xpReward?: number;
  durationMinutes?: number;
  className?: string;
}

/**
 * A slim, at-a-glance mission strip under the lesson header: one progress bar,
 * the objective count, the current next step, XP and estimated time. The full
 * objectives live in the sticky Mission panel on the right.
 */
export function MissionSummary({ xpReward, durationMinutes, className }: MissionSummaryProps) {
  const repo = usePlaygroundRepository();
  const remote = usePlaygroundRemote();
  const config = usePlaygroundStore((state) => state.config);
  const completedObjectives = usePlaygroundStore((state) => state.completedObjectives);

  const statuses = useMemo(
    () => (repo && config ? objectiveStatuses(repo, config.objectives, remote) : []),
    [repo, config, remote],
  );

  const objectives = useMemo(() => config?.objectives ?? [], [config]);
  const doneCount = useMemo(
    () =>
      objectives.reduce((count, objective, index) => {
        if (objective.persist === false) return count + (statuses[index]?.done ? 1 : 0);
        return count + (completedObjectives.includes(objective.id) ? 1 : 0);
      }, 0),
    [objectives, statuses, completedObjectives],
  );

  const total = objectives.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const next = useMemo(() => {
    const index = objectives.findIndex((objective, i) => {
      const done = objective.persist === false ? (statuses[i]?.done ?? false) : completedObjectives.includes(objective.id);
      return !done;
    });
    if (index === -1) return null;
    return objectives[index]?.label ?? null;
  }, [objectives, statuses, completedObjectives]);

  if (!repo || !config) return null;

  return (
    <section
      aria-label="Mission progress"
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-white/[0.03] bg-card/95 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <span className="flex shrink-0 items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
          <Flag className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-text">Your mission</span>
      </span>

      <div className="flex min-w-[160px] flex-1 basis-40 items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.01]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={doneCount}
          aria-label={`${pct}% of objectives complete`}
        >
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          />
        </div>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-text-secondary">
          <motion.span
            key={doneCount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="inline-block"
          >
            {doneCount}/{total} · {pct}%
          </motion.span>
        </span>
      </div>

      {next && (
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted">
          <Target className="size-3 shrink-0 text-accent-hover" aria-hidden="true" />
          <motion.span
            key={next}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="truncate"
          >
            Next: <span className="font-medium text-text-secondary">{next}</span>
          </motion.span>
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2 text-[11px] text-text-muted">
        {(xpReward ?? 0) > 0 && (
          <span className="flex items-center gap-1 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1 font-medium">
                <Award className="size-3 text-warning" aria-hidden="true" />
                +{xpReward} XP
              </span>
            )}
            {(durationMinutes ?? 0) > 0 && (
              <span className="flex items-center gap-1 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1 font-medium">
            <Clock className="size-3 text-text-muted" aria-hidden="true" />
            ~{durationMinutes} min
          </span>
        )}
      </div>
    </section>
  );
}
