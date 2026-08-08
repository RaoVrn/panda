import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardCopy, Eraser, FolderGit2, GitBranch, BookOpen, Zap, RotateCcw } from "lucide-react";
import { getLesson } from "@/content/lessons";
import { useLessonId } from "@/features/lesson/lessonModeContext";
import { usePlaygroundStore } from "../playgroundStore";
import { usePlaygroundRepository } from "../usePlayground";
import { closestCommand, getErrorHint } from "../animations";
import { cn } from "@/lib/utils";

const PROMPT = "$";

const TONE_CLASS: Record<string, string> = {
  error: "text-[#ff7b72]",
  success: "text-[#7ee787]",
  warning: "text-[#e3b341]",
  muted: "text-[#8b949e]",
  output: "text-[#e6edf3]",
};

type TerminalLine = {
  id: number;
  kind: "cmd" | "error" | "success" | "warning" | "muted" | "output";
  text: string;
};

const COMPLETIONS = [
  "pwd",
  "ls",
  "cat ",
  "clear",
  "help",
  "touch ",
  "rm ",
  "mv ",
  "echo \"\" > ",
  "git init",
  "git status",
  "git add .",
  "git add ",
  "git log",
  "git log --oneline",
  "git diff",
  "git diff --staged",
  "git restore --staged ",
  "git restore ",
  "git commit -m \"\"",
];

const QUICK_COMMANDS_INITIALIZED = ["git status", "git add .", "git log --oneline", "help"];
const QUICK_COMMANDS_UNINITIALIZED = ["git init", "git status", "help"];

let lineSeq = 0;

export interface TerminalProps {
  className?: string;
  title?: string;
}

/** A crisp, blinking block cursor (Warp/VS Code terminal). */
function Cursor() {
  return (
    <motion.span
      aria-hidden="true"
      className="inline-block h-[15px] w-[8px] translate-y-[2px] rounded-[1px] bg-[#e6edf3]"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.72, 0.78, 1] }}
    />
  );
}

/**
 * The primary workspace surface — a realistic terminal wired to the Git engine.
 * The header shows the current repository, branch, lesson and a Reset action;
 * the output is ~18 scrollable lines with the input and Run pinned to the
 * bottom. Every command goes through the engine, so the visualizer, files,
 * timeline and mission update in the same tick.
 */
export function Terminal({ className, title = "panda-shell" }: TerminalProps) {
  const run = usePlaygroundStore((state) => state.run);
  const resetLesson = usePlaygroundStore((state) => state.resetLesson);
  const repo = usePlaygroundRepository();
  const config = usePlaygroundStore((state) => state.config);
  const lessonId = useLessonId();
  const lesson = getLesson(lessonId);
  const shell = config?.shell;

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll whenever the output changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Keep the terminal focused while typing (desktop only, no keyboard pop).
  useEffect(() => {
    const prefersFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (prefersFine) inputRef.current?.focus();
  }, []);

  const focusInput = () => inputRef.current?.focus();

  const appendOutput = useCallback((text: string, kind: TerminalLine["kind"]) => {
    const next: TerminalLine[] = [];
    for (const line of text.split("\n")) {
      if (line === "" && next.length === 0) continue;
      next.push({ id: ++lineSeq, kind, text: line });
    }
    setLines((prev) => [...prev, ...next]);
  }, []);

  const submitCommand = useCallback(
    (rawValue: string) => {
      const value = rawValue;
      const trimmed = value.trim();
      if (!trimmed) return;

      const output = run(trimmed);

      if (output.kind === "muted" && output.text === "") {
        setLines([]);
      } else {
        setLines((prev) => [...prev, { id: ++lineSeq, kind: "cmd", text: value }]);
        if (output.text) appendOutput(output.text, output.kind);
        // Inline coaching: when a command fails, explain why and how to fix it
        // right where the error appeared — not just as a toast.
        if (output.kind === "error") {
          const hint = getErrorHint(output.text);
          const suggestion = /unknown git command|command not found/i.test(output.text)
            ? closestCommand(value)
            : undefined;
          if (hint) setLines((prev) => [...prev, { id: ++lineSeq, kind: "warning", text: `→ ${hint}` }]);
          if (suggestion) {
            setLines((prev) => [
              ...prev,
              { id: ++lineSeq, kind: "warning", text: `→ Did you mean: git ${suggestion}?` },
            ]);
          }
        }
      }

      setHistory((prev) => [...prev, value]);
      setHistIndex(-1);
      setInput("");
    },
    [run, appendOutput],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    submitCommand(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const value = input.trimStart();
      if (!value) return;
      const matches = COMPLETIONS.filter((c) => c.startsWith(value));
      if (matches.length === 1) setInput(matches[0]!);
      else if (matches.length > 1) {
        setLines((prev) => [...prev, { id: ++lineSeq, kind: "muted", text: matches.join("    ") }]);
      }
      return;
    }
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
      return;
    }
  };

  const copyAll = async () => {
    const text = lines.map((line) => `${line.kind === "cmd" ? PROMPT + " " : ""}${line.text}`).join("\n");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  const clearView = () => setLines([]);

  const handleReset = () => {
    resetLesson();
    setLines([]);
    setHistory([]);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.03] bg-[#0d1117] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]",
        className,
      )}
      onClick={focusInput}
    >
      {/* Header: three groups — left (context), center (lesson), right (actions) */}
      <div className="flex items-center gap-3 border-b border-white/[0.03] bg-[#12161b]/80 px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="truncate font-mono text-[11px] text-[#8b949e]">{title}</span>

        {/* Group 1 — context (project + branch) */}
        <span className="hidden items-center gap-1.5 pl-1 sm:flex">
          <span className="flex items-center gap-1 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1 font-mono text-[10px] text-[#8b949e]">
            <FolderGit2 className="size-3 shrink-0" aria-hidden="true" />
            <span className="max-w-[100px] truncate">{repo?.pwd ?? "…"}</span>
          </span>
          <span className="flex items-center gap-1 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1 font-mono text-[10px] text-[#8b949e]">
            <GitBranch className="size-3 shrink-0" aria-hidden="true" />
            <span className="max-w-[80px] truncate">{repo ? repo.branch : "main"}</span>
          </span>
        </span>

        {/* Separator */}
        <span aria-hidden="true" className="hidden h-4 w-px bg-white/[0.06] sm:block" />

        {/* Group 2 — lesson + command (informational labels) */}
        <span className="hidden items-center gap-1.5 sm:flex">
          {lesson && (
            <span className="flex items-center gap-1 rounded-full bg-white/[0.02] px-2 py-1 text-[10px] text-text-muted">
              <BookOpen className="size-3 shrink-0" aria-hidden="true" />
              <span className="max-w-[100px] truncate">{lesson.title}</span>
            </span>
          )}
          {shell?.primaryCommand && (
            <span className="flex items-center gap-1 rounded-full border border-accent/15 bg-accent/[0.08] px-2 py-1 text-[10px] font-medium text-accent-hover">
              <Zap className="size-3 shrink-0" aria-hidden="true" />
              {shell.primaryCommand}
            </span>
          )}
        </span>

        {/* Separator */}
        <span aria-hidden="true" className="hidden h-4 w-px bg-white/[0.06] sm:block" />

        {/* Group 3 — actions (reset) */}
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset sandbox"
          title="Reset sandbox to lesson start"
          className="ml-auto flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 text-[10px] font-medium text-text-muted transition-colors hover:border-white/[0.10] hover:bg-white/[0.06] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          <span className="hidden sm:inline">Reset sandbox</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.03] bg-[#12161b]/60 px-4 py-1.5">
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
            repo?.initialized ? "bg-[#3fb950]/15 text-[#3fb950]" : "bg-[#f5a524]/15 text-[#e3b341]",
          )}
        >
          <span className={cn("size-1.5 rounded-full", repo?.initialized ? "bg-[#3fb950]" : "bg-[#e3b341]")} aria-hidden="true" />
          {repo?.initialized ? "git repository" : "not initialized"}
        </span>
        <span className="ml-auto font-mono text-[9px] text-[#8b949e]">↑/↓ history · Tab complete</span>
        <button
          type="button"
          onClick={copyAll}
          aria-label="Copy terminal output"
          title="Copy output"
          className="flex size-6 items-center justify-center rounded-md text-[#8b949e] transition-colors hover:bg-white/[0.08] hover:text-[#e6edf3]"
        >
          {copied ? <Check className="size-3 text-[#7ee787]" aria-hidden="true" /> : <ClipboardCopy className="size-3" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={clearView}
          aria-label="Clear terminal"
          title="Clear terminal"
          className="flex size-6 items-center justify-center rounded-md text-[#8b949e] transition-colors hover:bg-white/[0.08] hover:text-[#e6edf3]"
        >
          <Eraser className="size-3" aria-hidden="true" />
        </button>
      </div>

      {/* Output — ~18 visible lines */}
      <div
        ref={scrollRef}
        role="log"
        aria-label="Terminal output"
        className="h-[280px] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-6"
      >
        {lines.length === 0 ? (
          <div className="flex h-full flex-col justify-center">
            <p className="text-[14px] text-[#e6edf3]">
              <span aria-hidden="true">👋</span> {shell?.welcomeText ?? "Welcome."}
            </p>
            <p className="mt-1.5 text-[11px] text-[#8b949e]">
              {shell?.helperText ??
                (repo?.initialized
                  ? (
                    <>
                      Type <span className="text-[#79c0ff]">git status</span> to see what Git notices, or click a command below.
                    </>
                  )
                  : (
                    <>
                      This folder isn't a repository yet. Type <span className="text-[#79c0ff]">git init</span> to start one.
                    </>
                  ))}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(shell?.quickActions ?? config?.suggestions ?? (repo?.initialized ? QUICK_COMMANDS_INITIALIZED : QUICK_COMMANDS_UNINITIALIZED)).map((command) => (
                <button
                  key={command}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    submitCommand(command);
                  }}
                  className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-[#79c0ff] transition-colors hover:bg-white/[0.08] hover:text-[#e6edf3]"
                >
                  {command}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="whitespace-pre-wrap break-words"
              >
                {line.kind === "cmd" ? (
                  <span>
                    <span className="select-none font-semibold text-[#7ee787]">{PROMPT} </span>
                    <span className="text-[#e6edf3]">{line.text}</span>
                  </span>
                ) : (
                  <span className={TONE_CLASS[line.kind] ?? TONE_CLASS.output}>{line.text || "\u00a0"}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Live prompt line */}
        <p className="flex items-center gap-0.5 pt-0.5">
          <span className="select-none font-semibold text-[#7ee787]">{PROMPT} </span>
          <span className="text-[#79c0ff]">{input}</span>
          <Cursor />
        </p>
      </div>

      {/* Input — pinned to bottom */}
      <form
        onSubmit={submit}
        aria-label="Type a terminal command"
        className="flex items-center gap-2 border-t border-white/[0.03] bg-[#12161b]/80 px-3 py-2"
      >
        <span className="select-none font-mono text-[12px] font-semibold text-[#7ee787]">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={shell?.placeholder ?? (repo?.initialized ? "git status …" : "git init …")}
          aria-label="Terminal command input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-8 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-[#010409] px-3 font-mono text-[12px] text-[#e6edf3] placeholder:text-[#8b949e] focus:border-[#3fb950]/40 focus:outline-none"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#238636] px-3.5 font-mono text-[11px] font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3fb950]"
        >
          Run
          <kbd className="rounded bg-white/10 px-1 text-[9px]">⏎</kbd>
        </motion.button>
      </form>
    </div>
  );
}
