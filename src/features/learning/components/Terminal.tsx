import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface TerminalLine {
  text: string;
  kind?: "output" | "command" | "error" | "success" | "muted";
}

export interface TerminalProps {
  title?: string;
  lines?: TerminalLine[];
  prompt?: string;
  height?: number;
  className?: string;
}

const kindClass: Record<NonNullable<TerminalLine["kind"]>, string> = {
  output: "text-[#e6edf3]",
  command: "text-[#79c0ff]",
  error: "text-[#ff7b72]",
  success: "text-[#7ee787]",
  muted: "text-[#8b949e]",
};

/**
 * Reusable terminal. Dark, scrollable output with a live prompt.
 * Future-ready: commands can be wired up without changing the shell chrome.
 */
export function Terminal({
  title = "terminal",
  lines = [],
  prompt = "$",
  height = 240,
  className,
}: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-[#010409] shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="truncate font-mono text-xs text-[#8b949e]">{title}</span>
      </div>

      <div
        ref={ref}
        className="overflow-auto bg-[#010409] p-4 font-mono text-[13px] leading-6"
        style={{ height }}
      >
        {lines.length === 0 && (
          <p className="text-[#8b949e]">Ready — type a command to begin.</p>
        )}
        {lines.map((line, index) => (
          <div
            key={index}
            className={cn("whitespace-pre-wrap", kindClass[line.kind ?? "output"])}
          >
            {line.kind === "command" && (
              <span className="select-none text-[#7ee787]">{prompt} </span>
            )}
            {line.text}
          </div>
        ))}
        <div className="flex items-center">
          <span className="select-none text-[#7ee787]">{prompt} </span>
          <span className="inline-block h-4 w-2 animate-pulse bg-[#e6edf3]" />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-[#161b22] px-4 py-1.5 font-mono text-[10px] text-[#8b949e]">
        <span>bash</span>
        <span className="ml-auto">UTF-8</span>
      </div>
    </div>
  );
}