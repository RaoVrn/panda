import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/IconButton";

export interface EditorLine {
  content: string;
  highlight?: boolean;
}

export interface EditorProps {
  language?: string;
  filename?: string;
  lines?: EditorLine[];
  defaultValue?: string;
  minHeight?: number;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Reusable code editor.
 * Currently a Monaco-style placeholder (syntax-highlighted, resizable) that
 * can be swapped for Monaco Editor later without changing its API.
 */
export function Editor({
  language = "bash",
  filename = "terminal",
  lines = [],
  defaultValue = "",
  minHeight = 160,
  defaultExpanded = false,
  className,
}: EditorProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState(minHeight);
  const dragStart = useRef<{ y: number; height: number } | null>(null);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    dragStart.current = { y: e.clientY, height: e.currentTarget.parentElement?.offsetHeight ?? 0 };
    const onMove = (ev: PointerEvent) => {
      if (!dragStart.current) return;
      const delta = dragStart.current.y - ev.clientY;
      setHeight(Math.max(120, dragStart.current.height + delta));
    };
    const onUp = () => {
      dragStart.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const displayLines: EditorLine[] =
    lines.length > 0
      ? lines
      : defaultValue.split("\n").map((content) => ({ content }));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-[#010409] shadow-card",
        expanded && "fixed inset-0 z-40 flex flex-col rounded-none",
        className,
      )}
      style={expanded ? undefined : { height }}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="truncate font-mono text-xs text-[#8b949e]">{filename}</span>
        <span className="ml-auto rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-[#8b949e]">
          {language}
        </span>
        <IconButton
          label={expanded ? "Minimize editor" : "Expand editor"}
          onClick={() => setExpanded((v) => !v)}
          className="size-7 text-[#8b949e] hover:bg-white/[0.06] hover:text-[#e6edf3]"
        >
          {expanded ? (
            <Minimize2 className="size-3.5" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-3.5" aria-hidden="true" />
          )}
        </IconButton>
      </div>

      <div
        className={cn("overflow-auto bg-[#010409] py-3 font-mono text-[13px] leading-6", expanded && "flex-1")}
        style={expanded ? undefined : { height: `calc(100% - 45px)` }}
      >
        {displayLines.map((line, index) => (
          <div key={index} className={cn("flex", line.highlight && "bg-accent/10")}>
            <span
              className="w-9 shrink-0 select-none border-r border-white/[0.03] pr-3 text-right text-[#484f58]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="whitespace-pre pl-3 text-[#e6edf3]">{line.content}</span>
          </div>
        ))}
      </div>

      {!expanded && (
        <div
          role="separator"
          aria-label="Resize editor"
          onPointerDown={onPointerDown}
          className="flex h-1.5 cursor-row-resize items-center justify-center bg-[#161b22] text-[#484f58] hover:text-[#8b949e]"
        >
          <span className="h-0.5 w-8 rounded bg-current" />
        </div>
      )}
    </div>
  );
}