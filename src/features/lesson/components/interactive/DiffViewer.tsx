import { useRef } from "react";
import { Diff, FileDiff } from "lucide-react";
import type { DiffRow } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { VizChrome } from "./VizChrome";
import type { StepPlayer } from "./useStepPlayer";
import { useReadPlayback } from "./useReadPlayback";
import { useReportAi } from "@/stores/aiContextStore";
import { cn } from "@/lib/utils";

function RowCell({
  text,
  kind,
  side,
  empty,
}: {
  text?: string;
  kind: "context" | "add" | "remove";
  side: "left" | "right";
  empty?: boolean;
}) {
  const isRemove = kind === "remove" && side === "left";
  const isAdd = kind === "add" && side === "right";
  const isChange =
    (kind === "remove" && side === "right") || (kind === "add" && side === "left");
  return (
    <div
      className={cn(
        "flex min-h-[22px] items-center gap-2 px-3 font-mono text-[12px] leading-[22px]",
        isRemove && "bg-[#ff7b72]/10 text-[#ffa198]",
        isAdd && "bg-[#3fb950]/12 text-[#7ee787]",
        isChange && "bg-base-subtle/50 text-[#8b949e]",
        !isRemove && !isAdd && !isChange && "text-[#8b949e]",
        empty && "text-transparent",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "w-4 shrink-0 select-none text-center",
          isRemove ? "text-[#ff7b72]" : isAdd ? "text-[#3fb950]" : "text-transparent",
        )}
      >
        {isRemove ? "−" : isAdd ? "+" : ""}
      </span>
      <span className="truncate whitespace-pre">{text ?? ""}</span>
    </div>
  );
}

export interface DiffViewerProps {
  title?: string;
  filename: string;
  rows: DiffRow[];
  player: StepPlayer;
  mode: LessonMode;
}

/**
 * Animated before/after diff. Each step reveals one more row; removals glow
 * red on the left, additions glow green on the right, context stays quiet.
 */
export function DiffViewer({ title, filename, rows, player, mode }: DiffViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 700 });

  const count = Math.max(1, Math.min(player.step + 1, rows.length));
  const visible = rows.slice(0, count);

  const removed = rows.filter((r) => r.kind === "remove").length;
  const added = rows.filter((r) => r.kind === "add").length;

  useReportAi(
    { visualization: `Diff of ${filename}: ${removed} removed, ${added} added` },
    [filename, rows.length],
  );

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/50 px-4 py-3">
        <Diff className="size-3.5 text-accent-hover" aria-hidden="true" />
        <p className="truncate text-sm font-medium text-text">
          {title ?? "What changed"}
        </p>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-text-muted">
          <FileDiff className="size-3" aria-hidden="true" />
          {filename}
        </span>
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="min-w-0 border-b border-border-subtle sm:border-b-0 sm:border-r">
          <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/30 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-[#ff7b72]" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-[#ffa198]">before</span>
          </div>
          {visible.map((row, i) => (
            <RowCell
              key={`l-${i}`}
              text={row.kind === "add" ? undefined : row.left}
              kind={row.kind}
              side="left"
              empty={row.kind === "add"}
            />
          ))}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/30 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-[#3fb950]" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-[#7ee787]">after</span>
          </div>
          {visible.map((row, i) => (
            <RowCell
              key={`r-${i}`}
              text={row.kind === "remove" ? undefined : row.right}
              kind={row.kind}
              side="right"
              empty={row.kind === "remove"}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border-subtle bg-base-subtle/30 px-4 py-2.5">
        <p className="text-[11px] text-text-muted">
          <span className="font-semibold text-[#ff7b72]">− {removed}</span> line
          {removed === 1 ? "" : "s"} removed ·{" "}
          <span className="font-semibold text-[#3fb950]">+ {added}</span> line
          {added === 1 ? "" : "s"} added
        </p>
      </div>

      <VizChrome mode={mode} player={player} label="Line" started={started} />
    </div>
  );
}
