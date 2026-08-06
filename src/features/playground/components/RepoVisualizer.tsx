import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowBigRight,
  Boxes,
  Check,
  FileText,
  GitBranch,
  GitCommitHorizontal,
  Inbox,
  FolderTree,
  Star,
} from "lucide-react";
import { isIgnored, statusRows } from "@/lib/git";
import { usePlaygroundRepository } from "../usePlayground";
import { usePlaygroundStore } from "../playgroundStore";
import { PlaygroundPanel } from "./Panel";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

/* ------------------------------------------------------------------ */
/* Column                                                              */
/* ------------------------------------------------------------------ */

function Column({
  title,
  subtitle,
  icon,
  dotColor,
  count,
  children,
  footer,
  highlighted = false,
  dimmed = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  dotColor: string;
  count?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  highlighted?: boolean;
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border transition-[opacity,border-color,box-shadow] duration-300",
        highlighted
          ? "border-accent/25 bg-accent/5 shadow-[0_0_8px_rgba(52,179,160,0.05)]"
          : dimmed
            ? "border-white/[0.01] bg-white/[0.01] opacity-60"
            : "border-white/[0.02] bg-white/[0.01]",
      )}
    >
      <header className="flex items-center gap-2.5 border-b border-white/[0.03] bg-white/[0.01] px-4 py-3">
        <span className={cn("size-2 shrink-0 rounded-full", dotColor)} aria-hidden="true" />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-accent-hover">
          {icon}
        </span>
        <div className="min-w-0">
          <h4 className="flex items-center gap-2 text-[14px] font-semibold text-text">
            {title}
            {count !== undefined && (
              <span className="rounded-full bg-white/[0.01] px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
                {count}
              </span>
            )}
          </h4>
          <p className="truncate text-[11px] text-text-muted">{subtitle}</p>
        </div>
      </header>
      <div className="flex min-h-[130px] flex-col gap-1.5 p-3">{children}</div>
      {footer && (
        <div className="border-t border-white/[0.02] bg-white/[0.01] px-3 py-2 text-center text-[10px] text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flow arrow                                                          */
/* ------------------------------------------------------------------ */

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 py-2">
      <motion.span
        aria-hidden="true"
        animate={{ x: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-8 items-center justify-center rounded-full border border-accent/12 bg-accent/4 text-accent-hover"
      >
        <ArrowBigRight className="size-4" />
      </motion.span>
      <span className="font-mono text-[10px] font-medium text-accent-hover">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* File chip                                                           */
/* ------------------------------------------------------------------ */

function FileChip({
  path,
  staged,
  deleted,
  onClick,
  hint,
}: {
  path: string;
  staged?: boolean;
  deleted?: boolean;
  onClick?: () => void;
  hint?: string;
}) {
  const asButton = Boolean(onClick);
  const name = path.split("/").pop() ?? path;
  return (
    <motion.button
      type="button"
      layout
      layoutId={`play-file-${path}`}
      transition={spring}
      onClick={onClick}
      disabled={!onClick}
      title={hint ?? path}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors border",
        staged
          ? "border-accent/25 bg-accent/[0.06] text-text"
          : deleted
            ? "border-white/[0.02] bg-white/[0.01] text-text-muted line-through"
            : "border-transparent bg-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text",
        asButton &&
          "hover:border-border-strong hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        !onClick && "cursor-default",
      )}
    >
      <FileText className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{name}</span>
      {staged && <Check className="size-3.5 shrink-0 text-accent-hover" aria-hidden="true" />}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* RepoVisualizer                                                       */
/* ------------------------------------------------------------------ */

export interface RepoVisualizerProps {
  className?: string;
}

/**
 * The centerpiece of the playground. Four large, equal columns make the
 * working-tree → staging → repository → HEAD flow unmistakable:
 *
 *   Working Tree  →  Staging Area  →  Repository  →  HEAD
 *    (your edits)     (next snapshot)   (history)      (you are here)
 *
 * Every interaction is a real engine command, so the terminal, files and
 * mission update in the same tick. Files animate between columns via
 * framer-motion layout animations.
 */
export function RepoVisualizer({ className }: RepoVisualizerProps) {
  const repo = usePlaygroundRepository();
  const run = usePlaygroundStore((state) => state.run);
  const config = usePlaygroundStore((state) => state.config);
  const activeAreas = usePlaygroundStore((state) => state.activeAreas);
  const [message, setMessage] = useState("Save my work");

  const rows = useMemo(() => (repo ? statusRows(repo) : []), [repo]);

  if (!repo) return null;

  const working = rows.filter(
    (row) =>
      !row.staged &&
      (row.untracked || row.modified || row.deleted) &&
      !isIgnored(repo, row.path),
  );
  const staged = rows.filter((row) => row.staged);
  const commits = [...repo.commits].reverse();
  const latest = repo.commits[repo.commits.length - 1];

  const stage = (path: string) => run(`git add ${path}`);
  const unstage = (path: string) => run(`git restore --staged ${path}`);
  const commit = () => {
    if (staged.length === 0) return;
    const sanitized = message.replace(/\\/g, "").replace(/"/g, '\\"').replace(/\n/g, " ").trim();
    if (!sanitized) return;
    run(`git commit -m "${sanitized}"`);
  };

  const viz = config?.visualizer;
  const h = viz?.highlight;
  const col = (key: string) => ({
    highlighted: h === key || activeAreas.includes(key),
    dimmed: (h !== undefined || activeAreas.length > 0) && h !== key && !activeAreas.includes(key),
  });

  return (
    <PlaygroundPanel
      icon={<Boxes className="size-4" aria-hidden="true" />}
      title="Repository visualizer"
      className={className}
      right={
        <span className="flex items-center gap-1.5 rounded-full bg-white/[0.01] px-2 py-0.5 text-[10px] text-text-muted">
          <span className="size-1.5 animate-pulse rounded-full bg-[#3fb950]" aria-hidden="true" />
          live state
        </span>
      }
      bodyClassName="p-4"
    >
      {viz?.banner && (
        <p className="mb-4 text-center text-[13px] font-medium text-accent-hover">{viz.banner}</p>
      )}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* 1. Working Tree */}
        <Column
          title="Working Tree"
          subtitle={working.length ? `${working.length} file${working.length === 1 ? "" : "s"} changed` : "all files up to date"}
          icon={<FolderTree className="size-4" aria-hidden="true" />}
          dotColor="bg-accent"
          count={repo.workingTree.size}
          footer={working.length > 0 ? "Click a file to stage it" : undefined}
          {...col("working-tree")}
        >
          {working.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.04] py-4 text-center text-[12px] text-text-muted">
              Add or edit files to see them here.
            </div>
          ) : (
            working.map((row) => (
              <FileChip
                key={row.path}
                path={row.path}
                deleted={row.deleted}
                onClick={() => stage(row.path)}
                hint={`git add ${row.path}`}
              />
            ))
          )}
        </Column>

        <FlowArrow label={staged.length > 0 ? "git add" : "↓"} />

        {/* 2. Staging Area */}
        <Column
          title="Staging Area"
          subtitle={staged.length ? `${staged.length} file${staged.length === 1 ? "" : "s"} staged` : "nothing staged"}
          icon={<Inbox className="size-4" aria-hidden="true" />}
          dotColor="bg-warning"
          count={staged.length}
          footer={staged.length > 0 ? "Click to unstage" : undefined}
          {...col("staging")}
        >
          {staged.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.04] py-4 text-center text-[12px] text-text-muted">
              {repo.initialized ? "Use git add to choose files for your next snapshot." : "Run git init to get started."}
            </div>
          ) : (
            staged.map((row) => (
              <FileChip
                key={row.path}
                path={row.path}
                staged
                onClick={() => unstage(row.path)}
                hint={`git restore --staged ${row.path}`}
              />
            ))
          )}
        </Column>

        <FlowArrow label={commits.length > 0 ? "git commit" : "↓"} />

        {/* 3. Repository */}
        <Column
          title="Repository"
          subtitle={commits.length ? `${commits.length} commit${commits.length === 1 ? "" : "s"}` : "no commits yet"}
          icon={<GitCommitHorizontal className="size-4" aria-hidden="true" />}
          dotColor="bg-[#3fb950]"
          count={commits.length}
          {...col("repository")}
        >
          {commits.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.04] py-4 text-center text-[12px] text-text-muted">
              Use git commit to save your work as a permanent snapshot.
            </div>
          ) : (
            <>
              <div className="mb-2 max-h-[120px] space-y-1 overflow-y-auto">
                {commits.map((commit) => (
                  <div
                    key={commit.hash}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.03] bg-white/[0.01] px-3 py-2"
                  >
                    <GitCommitHorizontal className="size-3.5 shrink-0 text-[#3fb950]" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-text-secondary">
                      {commit.message}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-text-muted">
                      {commit.hash.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-1.5 border-t border-white/[0.03] pt-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commit();
                  }}
                  placeholder="Commit message"
                  aria-label="Commit message"
                  className="h-9 w-full rounded-md border border-white/[0.04] bg-white/[0.02] px-3 font-mono text-[12px] text-text placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={commit}
                  disabled={staged.length === 0}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#3fb950] px-3 text-xs font-semibold text-[#010409] transition-colors hover:bg-[#4cc760] disabled:pointer-events-none disabled:opacity-40"
                >
                  <GitCommitHorizontal className="size-4" aria-hidden="true" />
                  Commit {staged.length > 0 ? `(${staged.length})` : ""}
                </button>
              </div>
            </>
          )}
        </Column>

        <FlowArrow label="HEAD →" />

        {/* 4. HEAD */}
        <Column
          title="HEAD"
          subtitle="you are here"
          icon={<Star className="size-4" aria-hidden="true" />}
          dotColor="bg-accent"
          {...col("head")}
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-accent/20 bg-accent-soft/10 p-4 text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent-hover shadow-glow">
              <GitBranch className="size-4" aria-hidden="true" />
            </span>
            {repo.initialized ? (
              <>
                <p className="text-[13px] font-semibold text-text">
                  <span className="text-accent-hover">HEAD</span> → {repo.branch}
                </p>
                {latest ? (
                  <div className="space-y-0.5">
                    <p className="font-mono text-[11px] text-text-muted">{latest.hash.slice(0, 7)}</p>
                    <p className="max-w-full truncate text-[12px] text-text-secondary">{latest.message}</p>
                  </div>
                ) : (
                  <p className="text-[12px] text-text-muted">unborn — no commits yet</p>
                )}
                <span
                  className={cn(
                    "mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    staged.length + working.length === 0
                      ? "bg-[#3fb950]/15 text-[#3fb950]"
                      : "bg-warning/15 text-warning",
                  )}
                >
                  {working.length + staged.length === 0 ? "working tree clean" : "uncommitted changes"}
                </span>
              </>
            ) : (
              <>
                <p className="text-[13px] text-text-muted">Repository not initialized</p>
                <p className="text-[12px] text-text-muted">Run git init to begin</p>
              </>
            )}
          </div>
        </Column>
      </div>
    </PlaygroundPanel>
  );
}
