import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Clock3, CornerDownLeft } from "lucide-react";
import type { TerminalStep } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { useGitSimStore, type GitSimSeed } from "@/stores/gitSimStore";
import { useLessonId } from "@/features/lesson/lessonModeContext";
import { cn } from "@/lib/utils";
import { VizChrome } from "./VizChrome";
import type { StepPlayer } from "./useStepPlayer";
import { useReadPlayback } from "./useReadPlayback";
import type { CommandOutput } from "./gitEngine";

const TYPE_MS = 42;
const OUTPUT_MS = 620;

const TONE_CLASS: Record<string, string> = {
  error: "text-[#ff7b72]",
  success: "text-[#7ee787]",
  warning: "text-[#e3b341]",
  muted: "text-[#8b949e]",
  output: "text-[#e6edf3]",
};

const COMPLETIONS = [
  "pwd",
  "ls",
  "clear",
  "help",
  "git init",
  "git status",
  "git add .",
  "git log",
  "git log --oneline",
  "git diff",
  "git restore --staged ",
  "git branch",
  "git switch -c ",
  "git checkout ",
  "git commit -m ",
  "git merge ",
  "git tag ",
  "git remote add origin ",
];

function toneFor(kind?: string, fallback = "text-[#e6edf3]"): string {
  return TONE_CLASS[kind ?? "output"] ?? fallback;
}

function BlinkingCursor({ dim = false }: { dim?: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        "inline-block h-4 w-2 translate-y-[2px]",
        dim ? "bg-[#8b949e]/80" : "bg-[#e6edf3]",
      )}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.7, 0.8, 1] }}
    />
  );
}

function renderText(text: string, tone: string) {
  return text.split("\n").map((line, i) => (
    <div key={i} className={cn("whitespace-pre-wrap", tone)}>
      {line}
    </div>
  ));
}

function TerminalBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5">
      <div className="flex shrink-0 gap-1.5" aria-hidden="true">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </div>
      <span className="truncate font-mono text-xs text-[#8b949e]">{title}</span>
    </div>
  );
}

export interface InteractiveTerminalProps {
  /** Guided steps the terminal walks through. When empty it's a free sandbox. */
  steps: TerminalStep[];
  prompt?: string;
  title?: string;
  height?: number;
  player: StepPlayer;
  mode: LessonMode;
  /** Starting repository for the sandbox (shared across the lesson). */
  seed?: GitSimSeed;
  seedId?: string;
  /** Baseline commands to run against the sandbox seed before the script. */
  setup?: string[];
  /** Baseline commands to run against the seeded REMOTE before the script. */
  remoteSetup?: string[];
}

/**
 * A living terminal. In Read mode it teaches by typing the guided script and
 * streaming output on its own (Replay only). In Interactive mode it reveals the
 * script step by step via <StepControls> and opens a real sandbox: type
 * anything, with arrow-key history, tab completion and a simulated Git engine
 * (init/status/add/commit/log/branch/pwd/ls/clear/help).
 */
export function InteractiveTerminal({
  steps,
  prompt = "$",
  title = "terminal",
  height = 300,
  player,
  mode,
  seed,
  seedId,
  setup,
  remoteSetup,
}: InteractiveTerminalProps) {
  const interactive = mode === "interactive";
  const lessonId = useLessonId();

  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player);

  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<"typing" | "output" | "done">("typing");

  // Read: once scrolled into view, type the script and advance on its own (a
  // passive documentary). Interactive: reveal instantly so Previous/Next
  // navigates, and open the sandbox.
  useEffect(() => {
    const step = steps[player.step];
    if (interactive) {
      if (step) {
        setTyped(step.command.length);
        setPhase("done");
      }
      return;
    }
    if (!started || !step) return;
    setTyped(0);
    setPhase("typing");

    let cancelled = false;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));

    (async () => {
      const command = step.command;
      for (let c = 1; c <= command.length; c++) {
        if (cancelled) return;
        setTyped(c);
        await sleep(TYPE_MS);
      }
      if (cancelled) return;
      setPhase("output");
      await sleep(OUTPUT_MS);
      if (cancelled) return;
      setPhase("done");
      await sleep(220);
      if (cancelled) return;
      if (!player.isLast) player.next();
      else player.pause();
    })();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.step, player.replayCount, interactive, started]);

  // Sandbox: a Git shell backed by the shared lesson repository, so every
  // visualization in the lesson sees the same state.
  const sync = useGitSimStore((s) => s.sync);
  const run = useGitSimStore((s) => s.run);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [freeLines, setFreeLines] = useState<
    Array<{ input: string; output: CommandOutput }>
  >([]);

  useEffect(() => {
    if (interactive) sync(lessonId, seedId ?? lessonId, seed, setup, remoteSetup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, lessonId, seedId, seed, setup, remoteSetup]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed, phase, freeLines, player.step]);

  const submitSandbox = (event: FormEvent) => {
    event.preventDefault();
    const value = input;
    const trimmed = value.trim();
    if (!trimmed) return;

    const output = run(trimmed);

    if (output.clear) {
      setFreeLines([]);
    } else {
      setFreeLines((prev) => [...prev, { input: value, output }]);
    }
    setHistory((prev) => [...prev, value]);
    setHistIndex(-1);
    setInput("");
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Tab completion
    if (event.key === "Tab") {
      event.preventDefault();
      const value = input.trim();
      if (!value) return;
      const matches = COMPLETIONS.filter((c) => c.startsWith(value));
      if (matches.length === 1) setInput(matches[0]!);
      return;
    }
    // Arrow-key history
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const idx = histIndex === -1 ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(idx);
      setInput(history[idx]!);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (histIndex === -1) return;
      const idx = histIndex + 1;
      if (idx >= history.length) {
        setHistIndex(-1);
        setInput("");
      } else {
        setHistIndex(idx);
        setInput(history[idx]!);
      }
    }
  };

  const hasScript = steps.length > 0;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-[#010409] shadow-card"
    >
      <TerminalBar title={title} />

      <div
        ref={scrollRef}
        role="log"
        aria-label="Terminal"
        className="overflow-auto p-4 font-mono text-[13px] leading-6"
        style={{ height }}
      >
        {/* Guided script */}
        {hasScript && (
          <div className="mb-1 flex items-center gap-2">
            <Clock3 className="size-3.5 text-[#3fb950]" aria-hidden="true" />
            <span className="text-[11px] text-[#8b949e]">
              {interactive
                ? "step through this session"
                : "watch this session play itself"}
            </span>
          </div>
        )}

        {steps.map((step, i) => {
          if (i > player.step) return null;
          const isCurrent = i === player.step;
          const display = isCurrent && !interactive ? typed : step.command.length;
          const showingOutput = isCurrent
            ? interactive || phase !== "typing"
            : true;
          return (
            <motion.div
              key={step.command + i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="whitespace-pre-wrap"
            >
              <div>
                <span className="select-none text-[#7ee787]">{prompt} </span>
                <span className={isCurrent ? "text-[#79c0ff]" : "text-[#e6edf3]/80"}>
                  {step.command.slice(0, display) || ""}
                </span>
                {isCurrent && !interactive && phase === "typing" && (
                  <BlinkingCursor />
                )}
              </div>
              {showingOutput && step.output && (
                <div className="pl-2">
                  {renderText(step.output, toneFor(step.outputKind))}
                </div>
              )}
              {showingOutput && step.note && (
                <div className="pl-2 font-sans text-[11px] text-[#8b949e]">
                  {step.note}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Sandbox */}
        {interactive && (
          <>
            <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
              <span className="rounded bg-[#3fb950]/15 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wide text-[#3fb950]">
                your turn
              </span>
              <span className="font-sans text-[11px] text-[#8b949e]">
                type anything. Try `help`, ↑/↓ for history, Tab to complete. Your changes sync with every visualization
              </span>
            </div>

            {freeLines.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-pre-wrap"
              >
                <div>
                  <span className="select-none text-[#7ee787]">{prompt} </span>
                  <span className="text-[#e6edf3]">{entry.input}</span>
                </div>
                {entry.output.lines.length > 0 && (
                  <div className="pl-2">
                    {renderText(entry.output.lines.join("\n"), toneFor(entry.output.kind))}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Live sandbox prompt */}
            <div className="flex items-center gap-0.5">
              <span className="select-none text-[#7ee787]">{prompt} </span>
              <span className="text-[#79c0ff]">{input}</span>
              <BlinkingCursor />
            </div>
          </>
        )}
      </div>

      {/* Sandbox input */}
      {interactive && (
        <form onSubmit={submitSandbox}
          className="flex items-center gap-2 border-t border-white/[0.06] bg-[#161b22] px-3 py-2"
          aria-label="Type a terminal command"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Try a git command…"
            aria-label="Terminal command input"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-8 flex-1 rounded-md border border-white/[0.06] bg-[#010409] px-3 font-mono text-[12px] text-[#e6edf3] placeholder:text-[#8b949e] focus:border-[#3fb950]/40 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Run command"
            className="flex h-8 items-center gap-1 rounded-md border border-white/[0.06] bg-[#ffffff08] px-2.5 font-mono text-[11px] text-[#e6edf3] transition-colors hover:bg-[#ffffff12] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3fb950]"
          >
            <CornerDownLeft className="size-3.5" aria-hidden="true" />
            Run
          </button>
        </form>
      )}

      {hasScript && (
        <VizChrome mode={mode} player={player} label="Step" started={started} />
      )}
    </div>
  );
}