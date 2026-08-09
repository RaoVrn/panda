import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Check, ChevronDown, Clock, Copy, Flag, Lightbulb, PartyPopper, Target, TerminalSquare, AlertTriangle } from "lucide-react";
import { objectiveStatuses } from "../taskValidator";
import { buildContextualHint } from "../contextualHint";
import { usePlaygroundRepository, usePlaygroundRemote, usePlaygroundSession } from "../usePlayground";
import { useAiContextStore } from "@/stores/aiContextStore";
import { usePlaygroundStore } from "../playgroundStore";
import { useLessonId } from "@/features/lesson/lessonModeContext";
import { useProgressStore } from "@/features/progress/progressStore";
import { cn } from "@/lib/utils";

export interface MissionPanelProps {
  xpReward?: number;
  durationMinutes?: number;
  className?: string;
}

/**
 * Sticky mission  -  progress + objectives on the right. Completed objectives
 * collapse into a compact summary so only the active task draws attention.
 */
export function MissionPanel({ xpReward, durationMinutes, className }: MissionPanelProps) {
  const repo = usePlaygroundRepository();
  const remote = usePlaygroundRemote();
  const config = usePlaygroundStore((state) => state.config);
  const completedObjectives = usePlaygroundStore((state) => state.completedObjectives);
  const lessonId = useLessonId();
  const markInteractive = useProgressStore((state) => state.markInteractive);

  const statuses = useMemo(
    () => (repo && config ? objectiveStatuses(repo, config.objectives, remote) : []),
    [repo, config, remote],
  );
  const objectives = useMemo(() => config?.objectives ?? [], [config]);
  const hints = useMemo(() => config?.hints ?? [], [config]);
  const solution = useMemo(() => config?.solution ?? [], [config]);

  const doneFor = useCallback(
    (id: string, index: number): boolean => {
      const objective = objectives[index];
      if (!objective) return false;
      if (objective.persist === false) return statuses[index]?.done ?? false;
      return completedObjectives.includes(id);
    },
    [objectives, statuses, completedObjectives],
  );

  const doneCount = useMemo(
    () => objectives.reduce((count, objective, index) => count + (doneFor(objective.id, index) ? 1 : 0), 0),
    [objectives, doneFor],
  );

  const total = objectives.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const allDone = total > 0 && doneCount === total;

  const currentStep = useMemo(() => {
    const index = objectives.findIndex((objective, i) => !doneFor(objective.id, i));
    return index === -1 ? null : { index, label: objectives[index]?.label ?? "" };
  }, [objectives, doneFor]);

  // Contextual hint: derived from the live repository state + last command,
  // falling back to the lesson's static hint for the current step.
  const session = usePlaygroundSession();
  const currentHint = useMemo(() => {
    if (!currentStep || !repo) return undefined;
    const objective = objectives[currentStep.index];
    if (!objective) return undefined;
    return buildContextualHint(
      objective,
      repo,
      { lastCommand: session.lastCommand, lastOutput: session.lastOutput, history: session.history },
      hints[currentStep.index] ?? hints[0],
    );
  }, [currentStep, repo, objectives, hints, session]);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const active = objectives.filter((_, i) => !doneFor(objectives[i]?.id ?? "", i));
  const completedList = objectives.filter((_, i) => doneFor(objectives[i]?.id ?? "", i));

  // Feed the learner's current objective + mission progress to Panda AI so it
  // never needs asking where the learner is or what's left.
  useEffect(() => {
    if (currentStep) {
      useAiContextStore.getState().report({
        objective: currentStep.label,
        missionProgress: `${doneCount} of ${total} objectives done`,
      });
    }
  }, [currentStep, doneCount, total]);

  const markMissionComplete = useProgressStore((state) => state.recordMissionComplete);

  useEffect(() => {
    if (allDone) {
      markInteractive(lessonId);
      markMissionComplete(lessonId);
    }
  }, [allDone, lessonId, markInteractive, markMissionComplete]);

  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-card/95 shadow-[0_1px_2px_rgba(0,0,0,0.2)]", allDone ? "border-[#3fb950]/20" : "border-white/[0.03]", className)}>
      <header className="flex h-11 items-center gap-2.5 border-b border-white/[0.03] bg-white/[0.01] px-4">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-accent/8 text-accent-hover"><Flag className="size-3.5" /></span>
        <h3 className="text-[13px] font-medium text-text">Mission</h3>
        <span className={cn("ml-auto font-mono text-[10px] font-semibold", allDone ? "text-[#3fb950]" : "text-text-secondary")}>{pct}%</span>
      </header>

      <div className="p-3 space-y-3">
        {/* Progress */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-subtle" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount}>
          <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 220, damping: 28 }} />
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
          <motion.span key={doneCount} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }} className="tabular-nums inline-block">
            {doneCount}/{total}
          </motion.span>
          {(xpReward ?? 0) > 0 && (<span className="flex items-center gap-1 font-medium text-warning"><Award className="size-3" />+{xpReward}</span>)}
          {(durationMinutes ?? 0) > 0 && (<span className="flex items-center gap-1"><Clock className="size-3" />~{durationMinutes}m</span>)}
          {currentStep && (
            <motion.span key={currentStep.label} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-1">
              <Target className="size-3 text-accent-hover" />Next: <span className="font-medium text-text-secondary">{currentStep.label}</span>
            </motion.span>
          )}
        </div>

        {/* Active objectives  -  the ones that stand out */}
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {active.map((objective) => {
              const actualIndex = objectives.indexOf(objective);
              const isCurrent = currentStep?.index === actualIndex;
              return (
                <motion.li
                  layout
                  key={objective.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn("flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors", isCurrent ? "bg-accent/[0.06] border border-accent/20" : "bg-white/[0.02] border border-white/[0.03]")}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-card" />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[13px] leading-snug", isCurrent ? "text-text" : "text-text-secondary")}>{objective.label}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-text-muted">{isCurrent ? "your turn" : "pending"}</p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* Completed  -  collapsed */}
        {completedList.length > 0 && (
          <div>
            <button type="button" onClick={() => setShowCompleted((v) => !v)} className="flex w-full items-center gap-2 rounded-lg border border-white/[0.03] bg-white/[0.01] px-2 py-1.5 text-[11px] text-text-muted hover:bg-white/[0.05] hover:text-text-secondary">
              <Check className="size-3.5 text-[#3fb950]" />
              <span className="tabular-nums">{completedList.length} completed</span>
              <ChevronDown className={cn("ml-auto size-3 transition-transform duration-150", showCompleted && "rotate-180")} />
            </button>
            {showCompleted && (
              <motion.ul initial={{ height: 0 }} animate={{ height: "auto" }} transition={{ duration: 0.15 }} className="mt-1 space-y-1 overflow-hidden">
                {completedList.map((objective) => (
                  <li key={objective.id} className="flex items-start gap-2 rounded-lg border border-transparent bg-[#3fb950]/[0.05] px-2 py-1.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#3fb950] bg-[#3fb950] text-[#010409]"><Check className="size-3" strokeWidth={3} /></span>
                    <span className="min-w-0 flex-1 text-[12px] leading-snug text-text-muted line-through decoration-text-muted/40">{objective.label}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        )}

        {/* Hint */}
        {currentHint && (
          <div className="overflow-hidden rounded-lg border border-white/[0.04] bg-white/[0.01]">
            <button type="button" onClick={() => setHintOpen((v) => !v)} className="flex h-8 w-full items-center gap-2 px-2.5 text-left">
              <Lightbulb className="size-3.5 shrink-0 text-warning" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-text-secondary">Current hint</span>
              <ChevronDown className={cn("size-3 shrink-0 text-text-muted transition-transform duration-150", hintOpen && "rotate-180")} />
            </button>
            {hintOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <p className="border-t border-white/[0.04] px-2.5 py-2 text-[12px] leading-snug text-text-secondary">{currentHint}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Hints accordion  -  inline, no separate section */}
        {hints.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-white/[0.04]">
            <button type="button" onClick={() => setHintsExpanded((v) => !v)}
              className="flex h-8 w-full items-center gap-2 px-2.5 text-left">
              <Lightbulb className="size-3.5 shrink-0 text-text-muted" />
              <span className="min-w-0 flex-1 text-[11px] font-medium text-text-secondary">Need help?</span>
              <ChevronDown className={cn("size-3 shrink-0 text-text-muted transition-transform", hintsExpanded && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {hintsExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.16 }} className="overflow-hidden">
                  <div className="space-y-1 border-t border-white/[0.04] p-2">
                    {hints.map((hint, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-md bg-white/[0.01] px-2 py-1.5">
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[9px] font-bold text-text-muted">{i + 1}</span>
                        <span className="text-[11px] leading-snug text-text-secondary">{hint}</span>
                      </div>
                    ))}
                    {solution.length > 0 && (
                      <div className="overflow-hidden rounded-md border border-white/[0.06]">
                        <button type="button" onClick={() => setSolutionOpen((v) => !v)}
                          className="flex h-8 w-full items-center gap-2 px-2.5 text-left bg-white/[0.01]">
                          <TerminalSquare className="size-3 shrink-0 text-accent-hover" />
                          <span className="min-w-0 flex-1 text-[11px] font-medium text-text-secondary">Show solution</span>
                          <ChevronDown className={cn("size-3 shrink-0 text-text-muted transition-transform", solutionOpen && "rotate-180")} />
                        </button>
                        {solutionOpen && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} transition={{ duration: 0.15 }} className="overflow-hidden">
                            <div className="border-t border-white/[0.04] bg-[#010409] px-3 py-2">
                              <div className="mb-2 flex items-center gap-1.5 rounded-md border border-warning/20 bg-warning/[0.06] px-2 py-1 text-[10px] text-warning">
                                <AlertTriangle className="size-3 shrink-0" /> Using the solution skips the challenge.
                              </div>
                              {solution.map((cmd, i) => (
                                <p key={i} className="font-mono text-[11px] leading-5 whitespace-pre-wrap">
                                  <span className="select-none text-[#7ee787]">$ </span>
                                  <span className="text-[#79c0ff]">{cmd}</span>
                                </p>
                              ))}
                              <button type="button"
                                onClick={() => { navigator.clipboard.writeText(solution.join("\n")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }).catch(() => {/* no clipboard */}) }}
                                className="mt-1.5 flex items-center gap-1 rounded text-[10px] text-text-muted hover:text-text">
                                {copied ? <Check className="size-3 text-[#7ee787]" /> : <Copy className="size-3" />} {copied ? "copied" : "copy commands"}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="flex items-center gap-3 rounded-xl border border-[#3fb950]/30 bg-[#3fb950]/10 px-3 py-2.5">
            <PartyPopper className="size-4 text-[#3fb950]" />
            <p className="text-[13px] font-semibold text-[#3fb950]">Mission complete!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
