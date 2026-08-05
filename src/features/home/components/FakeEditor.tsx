import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const COMMANDS = new Set([
  "init",
  "add",
  "commit",
  "branch",
  "checkout",
  "switch",
  "merge",
  "rebase",
  "status",
  "push",
  "pull",
  "clone",
  "log",
  "reset",
  "remote",
]);

type Token =
  | { type: "comment"; value: string }
  | { type: "command"; value: string }
  | { type: "subcommand"; value: string }
  | { type: "flag"; value: string }
  | { type: "string"; value: string }
  | { type: "plain"; value: string };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const regex =
    /(#[^\n]*)|("[^"]*"|'[^']*')|(--?[a-zA-Z0-9-]+)|(\S+)|(\s+)/g;
  let match: RegExpExecArray | null;
  let afterCommand = false;

  while ((match = regex.exec(line)) !== null) {
    const [raw, comment, str, flag, word, space] = match;
    if (space) {
      tokens.push({ type: "plain", value: space });
      continue;
    }
    if (comment) {
      tokens.push({ type: "comment", value: raw });
      continue;
    }
    if (str) {
      tokens.push({ type: "string", value: raw });
      continue;
    }
    if (flag) {
      tokens.push({ type: "flag", value: raw });
      continue;
    }
    if (word) {
      if (afterCommand && COMMANDS.has(word)) {
        tokens.push({ type: "subcommand", value: raw });
      } else if (word === "git") {
        tokens.push({ type: "command", value: raw });
        afterCommand = true;
      } else {
        tokens.push({ type: "plain", value: raw });
      }
    }
  }

  return tokens;
}

const tokenClass: Record<Token["type"], string> = {
  comment: "text-[#6e7681] italic",
  command: "text-[#ff7b72]",
  subcommand: "text-[#79c0ff]",
  flag: "text-[#ffa657]",
  string: "text-[#a5d6ff]",
  plain: "text-[#e6edf3]",
};

function highlight(content: string): ReactNode {
  return tokenize(content).map((token, i) => (
    <span key={i} className={tokenClass[token.type]}>
      {token.value}
    </span>
  ));
}

export interface FakeEditorLine {
  content: string;
  highlight?: boolean;
}

export interface FakeEditorTab {
  name: string;
  icon: string;
  active?: boolean;
  modified?: boolean;
}

export interface FakeEditorProps {
  title?: string;
  tabs?: FakeEditorTab[];
  lines: FakeEditorLine[];
  className?: string;
}

export function FakeEditor({
  title = "panda-repo",
  tabs,
  lines,
  className,
}: FakeEditorProps) {
  const defaultTabs: FakeEditorTab[] = tabs ?? [
    { name: "README.md", icon: "M" },
    { name: "git-commands.sh", icon: "S", active: true },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-[#010409] shadow-card",
        className,
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="truncate text-center font-mono text-xs text-[#8b949e]">
          {title} · Visual Studio Code
        </span>
      </div>

      {/* Tab bar (decorative preview, not interactive) */}
      <div className="flex items-end gap-1 overflow-x-auto bg-[#0d1117] px-2 pt-2" role="tablist" aria-label="Open files">
        {defaultTabs.map((tab) => (
          <span
            key={tab.name}
            role="tab"
            aria-selected={tab.active}
            className={cn(
              "flex shrink-0 cursor-default items-center gap-1.5 rounded-t-md border border-b-0 px-3 py-1.5 font-mono text-xs select-none",
              tab.active
                ? "border-[#30363d] bg-[#010409] text-[#e6edf3]"
                : "border-transparent text-[#8b949e]",
            )}
          >
            <span className="text-[10px] text-[#58a6ff]">{tab.icon}</span>
            {tab.name}
            {tab.modified && <span className="text-[#f0883e]">●</span>}
          </span>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-[#010409] py-3 font-mono text-[13px] leading-6">
        {lines.map((line, index) => (
          <div
            key={index}
            className={cn("flex", line.highlight && "bg-accent/10")}
          >
            <span
              className="w-9 shrink-0 select-none border-r border-white/[0.03] pr-3 text-right text-[#484f58]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="whitespace-pre pl-3">{highlight(line.content)}</span>
            {index === lines.length - 1 && (
              <span className="ml-0.5 h-[1.2em] w-[7px] animate-pulse bg-[#e6edf3]" />
            )}
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 bg-[#161b22] px-4 py-1.5 font-mono text-[10px] text-[#8b949e]">
        <span>main</span>
        <span>✓ Ready</span>
        <span className="ml-auto">UTF-8</span>
        <span>Bash</span>
      </div>
    </div>
  );
}