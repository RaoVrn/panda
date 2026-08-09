import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Check,
  FileText,
  FolderTree,
  GitCommitHorizontal,
  Inbox,
  RotateCcw,
} from "lucide-react";
import type { ContentStageAreaBlock } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { useGitSimStore } from "@/stores/gitSimStore";
import { useLessonId } from "@/features/lesson/lessonModeContext";
import { fileStatus } from "./gitEngine";
import { VizChrome } from "./VizChrome";
import type { StepPlayer } from "./useStepPlayer";
import { useReadPlayback } from "./useReadPlayback";
import { useReportAi } from "@/stores/aiContextStore";
import { cn } from "@/lib/utils";

const spring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 26,
};

function ColumnShell({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "accent" | "warning" | "success";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent-hover"
      : tone === "warning"
        ? "text-warning"
        : "text-[#3fb950]";
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-subtle bg-base-subtle/40">
      <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-2">
        <span className={toneClass}>{icon}</span>
        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-col gap-1.5 p-2.5">{children}</div>
    </div>
  );
}

function FileChip({
  name,
  status,
  onClick,
  staged,
  disabled,
}: {
  name: string;
  status?: "new" | "modified";
  onClick?: () => void;
  staged?: boolean;
  disabled?: boolean;
}) {
  const dot = status === "modified" ? "bg-warning" : "bg-text-muted";
  const asButton = Boolean(onClick);
  return (
    <motion.button
      type="button"
      layout
      layoutId={`file-${name}`}
      transition={spring}
      onClick={onClick}
      disabled={disabled || !onClick}
      title={onClick ? undefined : name}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
        staged
          ? "border-accent/30 bg-accent-soft/50 text-text"
          : "border-border-subtle bg-card text-text-secondary",
        asButton &&
          !disabled &&
          "hover:border-border-strong hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        !onClick && "cursor-default",
      )}
    >
      <FileText className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate font-mono text-[11px]">{name}</span>
      {staged ? (
        <Check className="size-3 shrink-0 text-accent-hover" aria-hidden="true" />
      ) : (
        status && <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      )}
    </motion.button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-subtle px-2 py-4 text-[11px] text-text-muted">
      {text}
    </div>
  );
}

export interface StageAreaProps {
  block: ContentStageAreaBlock;
  player: StepPlayer;
  mode: LessonMode;
}

/**
 * Working Tree → Staging Area → Repository.
 *
 *  · Read: a documentary  -  files appear in the working tree, move into the
 *    staging area one by one, then a commit lands in the repository.
 *
 *  · Interactive: a sandbox. Click a file to stage it (git add), click a
 *    staged file to unstage it (git restore --staged), and press Commit. This
 *    drives the shared Git simulation, so the terminal reflects every click.
 */
export function StageArea({ block, player, mode }: StageAreaProps) {
  const interactive = mode === "interactive";
  const lessonId = useLessonId();
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 1400 });

  // Read mode script: stage each readFile, then commit.
  const readFiles = block.readFiles ?? [];
  const readSteps = readFiles.length + 1;
  const readStaged = Math.min(player.step, readFiles.length);
  const readCommitted = player.step >= readSteps - 1;

  // Interactive mode: the shared lesson repository.
  const sync = useGitSimStore((s) => s.sync);
  const state = useGitSimStore((s) => s.state);
  const run = useGitSimStore((s) => s.run);
  const lastCommand = useGitSimStore((s) => s.lastCommand);

  useEffect(() => {
    if (interactive) sync(lessonId, block.seedId ?? lessonId, block.seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, lessonId, block.seedId, block.seed]);

  useReportAi(
    {
      visualization: "Working tree → Staging area → Repository",
      terminal: lastCommand || undefined,
    },
    [lastCommand],
  );

  const files = interactive
    ? [...state.files.keys()].sort()
    : readFiles.map((f) => f.name);
  const staged = interactive
    ? [...state.staged].sort()
    : readFiles.slice(0, readStaged).map((f) => f.name);
  const commits = interactive
    ? [...state.commits].reverse()
    : readCommitted
      ? [
          {
            hash: "read-commit",
            message: block.commitMessage ?? "Save my work",
            files: readFiles.map((f) => f.name),
          },
        ]
      : [];

  const workingStatus = (name: string): "new" | "modified" | undefined => {
    if (!interactive) {
      return readFiles.find((f) => f.name === name)?.status;
    }
    const status = fileStatus(state, name);
    if (status === "untracked") return "new";
    if (status === "modified") return "modified";
    return undefined;
  };

  const clickFile = (name: string) => {
    if (!interactive) return;
    run(`git add ${name}`);
  };
  const unstage = (name: string) => {
    if (!interactive) return;
    run(`git restore --staged ${name}`);
  };
  const commit = () => {
    if (!interactive || staged.length === 0) return;
    run(`git commit -m "${block.commitMessage ?? "Save my work"}"`);
  };

  const headHash = state.branches.get(state.branch);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/50 px-4 py-3">
        <Boxes className="size-3.5 text-accent-hover" aria-hidden="true" />
        <p className="text-sm font-medium text-text">
          {block.title ?? "From working tree to snapshot"}
        </p>
      </div>

      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-stretch">
        {/* Working tree */}
        <ColumnShell
          title="Working tree"
          icon={<FolderTree className="size-3.5" aria-hidden="true" />}
          tone="accent"
        >
          {files.length === 0 ? (
            <Empty text="no files yet" />
          ) : (
            files.map((name) =>
              staged.includes(name) ? null : (
                <FileChip
                  key={name}
                  name={name}
                  status={workingStatus(name)}
                  onClick={interactive ? () => clickFile(name) : undefined}
                  disabled={!interactive}
                />
              ),
            )
          )}
          {interactive && files.length > 0 && (
            <p className="px-0.5 pt-0.5 text-[10px] text-text-muted">
              click a file to stage it
            </p>
          )}
        </ColumnShell>

        {/* Arrow */}
        <div className="flex shrink-0 items-center justify-center py-1 sm:px-1 sm:py-0">
          <motion.span
            aria-hidden="true"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex size-6 items-center justify-center rounded-full bg-base-subtle"
          >
            <ArrowRight className="size-3 text-text-muted" />
          </motion.span>
        </div>

        {/* Staging area */}
        <ColumnShell
          title="Staging area"
          icon={<Inbox className="size-3.5" aria-hidden="true" />}
          tone="warning"
        >
          {staged.length === 0 ? (
            <Empty text="nothing staged yet" />
          ) : (
            staged.map((name) => (
              <FileChip
                key={name}
                name={name}
                staged
                onClick={interactive ? () => unstage(name) : undefined}
                disabled={!interactive}
              />
            ))
          )}
          {interactive && staged.length > 0 && (
            <p className="px-0.5 pt-0.5 text-[10px] text-text-muted">
              click to unstage
            </p>
          )}
        </ColumnShell>

        {/* Arrow */}
        <div className="flex shrink-0 items-center justify-center py-1 sm:px-1 sm:py-0">
          <motion.span
            aria-hidden="true"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex size-6 items-center justify-center rounded-full bg-base-subtle"
          >
            <ArrowRight className="size-3 text-text-muted" />
          </motion.span>
        </div>

        {/* Repository */}
        <ColumnShell
          title="Repository"
          icon={<GitCommitHorizontal className="size-3.5" aria-hidden="true" />}
          tone="success"
        >
          {commits.length === 0 ? (
            <Empty text="no snapshots yet" />
          ) : (
            commits.map((c) => {
              const isHead = interactive && c.hash === headHash;
              return (
                <motion.div
                  key={c.hash}
                  layout
                  transition={spring}
                  className="flex items-center gap-2 rounded-lg border border-border-subtle bg-card px-2.5 py-1.5"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3fb950]/15">
                    <GitCommitHorizontal className="size-3 text-[#3fb950]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-text-secondary">
                    {c.message}
                  </span>
                  {isHead && (
                    <span className="rounded bg-[#3fb950]/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#3fb950]">
                      HEAD
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
          {interactive && (
            <div className="mt-auto flex flex-col gap-1.5 border-t border-border-subtle pt-2">
              <button
                type="button"
                onClick={commit}
                disabled={staged.length === 0}
                className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#3fb950] px-3 text-xs font-semibold text-[#010409] transition-colors hover:bg-[#4cc760] disabled:pointer-events-none disabled:opacity-40"
              >
                <GitCommitHorizontal className="size-3.5" aria-hidden="true" />
                Commit {staged.length > 0 ? `(${staged.length})` : ""}
              </button>
              <p className="text-center text-[10px] text-text-muted">
                {staged.length === 0
                  ? "stage a file first"
                  : `saves “${block.commitMessage ?? "Save my work"}”`}
              </p>
            </div>
          )}
        </ColumnShell>
      </div>

      {interactive && (
        <div className="border-t border-border-subtle bg-base-subtle/30 px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <RotateCcw className="size-3" aria-hidden="true" />
            This is live Git state. Type{" "}
            <code className="rounded bg-base-subtle px-1 font-mono">git status</code>{" "}
            in any terminal in this lesson and you'll see the same thing.
          </p>
        </div>
      )}

      <VizChrome mode={mode} player={player} label="Step" started={started} />
    </div>
  );
}
