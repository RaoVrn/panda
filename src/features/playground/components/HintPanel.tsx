import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy, Lightbulb, TerminalSquare } from "lucide-react";
import { usePlaygroundStore } from "../playgroundStore";
import { PlaygroundPanel } from "./Panel";
import { cn } from "@/lib/utils";

export interface HintPanelProps {
  className?: string;
}

type ItemId = `hint-${number}` | "solution";

/**
 * Hints as an accordion below the workspace. Each hint expands in place (Hint 1
 * → Hint 2 → … → Show solution), so the learner peels back exactly as much help
 * as they want. The solution renders as real, copyable commands.
 */
export function HintPanel({ className }: HintPanelProps) {
  const config = usePlaygroundStore((state) => state.config);
  const [open, setOpen] = useState<ItemId | null>(null);
  const [copied, setCopied] = useState(false);

  const hints = useMemo(() => config?.hints ?? [], [config]);
  const solution = useMemo(() => config?.solution ?? [], [config]);

  if (!config) return null;

  const toggle = (id: ItemId) => setOpen((current) => (current === id ? null : id));

  const copySolution = async () => {
    try {
      await navigator.clipboard.writeText(solution.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard unavailable  -  ignore.
    }
  };

  const items: Array<{ id: ItemId; title: string; isSolution?: boolean }> = [
    ...hints.map((_, index) => ({
      id: `hint-${index}` as const,
      title: `Hint ${index + 1}`,
    })),
    ...(solution.length > 0 ? [{ id: "solution" as const, title: "Show solution", isSolution: true }] : []),
  ];

  return (
    <section id="playground-hints" className={cn("scroll-mt-24", className)}>
      <PlaygroundPanel
        icon={<Lightbulb className="size-3.5" aria-hidden="true" />}
        title="Hints"
        right={
          <span className="rounded-full bg-base-subtle px-2 py-0.5 text-[10px] font-medium text-text-muted">
            {hints.length} available
          </span>
        }
      >
        <div className="space-y-1.5">
          {items.map(({ id, title, isSolution }) => {
            const expanded = open === id;
            const index = id === "solution" ? null : Number(String(id).split("-")[1]);
            const hintText = index !== null ? hints[index] : undefined;

            return (
              <div
                key={id}
                className={cn(
                  "overflow-hidden rounded-xl border transition-colors duration-150",
                  isSolution
                    ? expanded
                      ? "border-[#3fb950]/20 bg-[#3fb950]/[0.03]"
                      : "border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03]"
                    : expanded
                      ? "border-warning/20 bg-warning/[0.03]"
                      : "border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03]",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-expanded={expanded}
                  className="flex h-9 w-full items-center gap-2.5 px-3 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                      isSolution
                        ? "border-[#3fb950]/40 bg-[#3fb950]/10 text-[#3fb950]"
                        : "border-warning/40 bg-warning/10 text-warning",
                    )}
                  >
                    {isSolution ? <TerminalSquare className="size-3" aria-hidden="true" /> : (index ?? 0) + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-text-secondary">{title}</span>
                  <ChevronDown
                    className={cn("size-3.5 shrink-0 text-text-muted transition-transform duration-150", expanded && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      <div className="border-t border-white/[0.04] px-3 py-2.5">
                        {id === "solution" ? (
                          <div className="overflow-hidden rounded-lg border border-white/[0.04] bg-[#010409]">
                            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
                              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">
                                solution
                              </span>
                              <button
                                type="button"
                                onClick={copySolution}
                                aria-label="Copy solution"
                                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[#8b949e] transition-colors hover:bg-white/[0.06] hover:text-[#e6edf3]"
                              >
                                {copied ? <Check className="size-3 text-[#7ee787]" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
                                {copied ? "copied" : "copy"}
                              </button>
                            </div>
                            <div className="px-3.5 py-2.5 font-mono text-[12px] leading-6">
                              {solution.map((command, i) => (
                                <p key={i} className="whitespace-pre-wrap">
                                  <span className="select-none text-[#7ee787]">$ </span>
                                  <span className="text-[#79c0ff]">{command}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[13px] leading-snug text-text-secondary">{hintText}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </PlaygroundPanel>
    </section>
  );
}
