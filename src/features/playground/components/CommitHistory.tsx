import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitCommitHorizontal, History, User } from "lucide-react";
import type { GitCommit } from "@/lib/git";
import { usePlaygroundRepository } from "../usePlayground";
import { PlaygroundPanel } from "./Panel";
import { cn } from "@/lib/utils";

export interface CommitHistoryProps {
  className?: string;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const CHANGE_LABEL: Record<string, string> = {
  added: "text-[#3fb950]",
  modified: "text-warning",
  deleted: "text-danger",
};

function CommitNode({
  commit,
  isHead,
  selected,
  onSelect,
}: {
  commit: GitCommit;
  isHead: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex shrink-0 items-start">
      <div className="flex flex-col items-center">
        <motion.button
          type="button"
          onClick={onSelect}
          whileTap={{ scale: 0.94 }}
          aria-label={`Inspect commit ${commit.message}`}
          aria-pressed={selected}
          className={cn(
            "flex size-10 items-center justify-center rounded-full border-2 transition-colors duration-150",
            isHead
              ? "border-accent bg-accent-soft text-accent-hover shadow-glow"
              : selected
                ? "border-accent/60 bg-accent-soft/40 text-accent-hover"
                : "border-border-strong bg-card text-text-muted hover:border-accent/50 hover:text-accent-hover",
          )}
        >
          <GitCommitHorizontal className="size-5" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Label */}
      <div className="ml-3 min-w-0 max-w-[220px]">
        <p
          className={cn(
            "truncate text-[13px] font-medium leading-tight",
            isHead ? "text-text" : "text-text-secondary",
          )}
        >
          {commit.message}
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
          <span>{commit.hash.slice(0, 7)}</span>
          <span aria-hidden="true">·</span>
          <span>{timeAgo(commit.timestamp)}</span>
        </p>
        {isHead && (
          <span className="mt-1 inline-block rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-text-inverse">
            HEAD
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The commit timeline as a horizontal row of nodes — newest on the left, oldest
 * on the right. HEAD glows, the message reads large, the hash stays small, and
 * clicking a node reveals its author and changed files below the row.
 */
export function CommitHistory({ className }: CommitHistoryProps) {
  const repo = usePlaygroundRepository();
  const [open, setOpen] = useState<string | null>(null);

  const commits = useMemo(() => {
    if (!repo) return [];
    return [...repo.commits].reverse();
  }, [repo]);

  if (!repo) return null;

  const selected = commits.find((commit) => commit.hash === open);

  return (
    <PlaygroundPanel
      icon={<History className="size-3.5" aria-hidden="true" />}
      title="Commit history"
      className={className}
      right={
        <span className="rounded-full bg-base-subtle px-2 py-0.5 font-mono text-[10px] text-text-muted">
          {commits.length}
        </span>
      }
    >
      {commits.length === 0 ? (
        <p className="flex flex-col items-center gap-1 py-8 text-center text-[11px] text-text-muted">
          <GitCommitHorizontal className="size-5" aria-hidden="true" />
          No commits yet. Stage something and commit.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto pb-1">
            <div className="flex items-start gap-6">
              {commits.map((commit, index) => (
                <div key={commit.hash} className="flex shrink-0 items-start">
                  <CommitNode
                    commit={commit}
                    isHead={commit.hash === repo.head}
                    selected={selected?.hash === commit.hash}
                    onSelect={() => setOpen((current) => (current === commit.hash ? null : commit.hash))}
                  />
                  {index < commits.length - 1 && (
                    <span className="mt-[18px] ml-2 h-0.5 w-6 bg-border-subtle" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.16 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl border border-border-subtle bg-base-subtle/40 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1">
                    <User className="size-3 text-text-muted" aria-hidden="true" />
                    {selected.author.name}
                  </span>
                  <span aria-hidden="true" className="text-text-muted">·</span>
                  <span className="font-mono text-[10px] text-text-muted">{selected.hash}</span>
                  <span aria-hidden="true" className="text-text-muted">·</span>
                  <span className="text-text-muted">{timeAgo(selected.timestamp)}</span>
                </div>
                {selected.changedFiles.length > 0 && (
                  <ul className="mt-2 space-y-0.5 border-t border-border-subtle pt-2">
                    {selected.changedFiles.map((file) => (
                      <li key={file.path} className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={cn("w-16 shrink-0 uppercase text-[9px]", CHANGE_LABEL[file.status] ?? "")}>
                          {file.status}
                        </span>
                        <span className="min-w-0 truncate text-text-secondary">{file.path}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </PlaygroundPanel>
  );
}
