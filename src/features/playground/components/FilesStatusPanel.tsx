import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Check,
  CheckCircle2,
  File,
  FileCode,
  FileImage,
  FileJson,
  FilePlus2,
  FileText,
  FolderTree,
  GitBranch,
  GitCommitHorizontal,
  Inbox,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { fileStatusOf, isIgnored, statusRows } from "@/lib/git";
import type { GitFileStatus } from "@/lib/git";
import { usePlaygroundRepository } from "../usePlayground";
import { usePlaygroundStore } from "../playgroundStore";
import { PlaygroundPanel } from "./Panel";
import { cn } from "@/lib/utils";

export interface FilesStatusPanelProps {
  className?: string;
}

type Mode =
  | { kind: "create" }
  | { kind: "edit"; path: string }
  | { kind: "rename"; path: string }
  | { kind: "confirmDelete"; path: string }
  | null;

function fileIcon(path: string): React.ReactNode {
  const name = path.split("/").pop() ?? path;
  const cls = "size-3.5 shrink-0";
  if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) return <FileImage className={cn(cls, "text-[#a5d6ff]")} aria-hidden="true" />;
  if (/\.json$/i.test(name)) return <FileJson className={cn(cls, "text-[#e3b341]")} aria-hidden="true" />;
  if (/\.(js|ts|tsx|jsx|css|html|py|rs|go)$/i.test(name)) return <FileCode className={cn(cls, "text-[#79c0ff]")} aria-hidden="true" />;
  if (/\.(md|txt)$/i.test(name)) return <FileText className={cn(cls, "text-[#d2a8ff]")} aria-hidden="true" />;
  return <File className={cn(cls, "text-text-muted")} aria-hidden="true" />;
}

function statusBadge(status: GitFileStatus, ignored: boolean): { label: string; cls: string } {
  if (ignored) return { label: "ignored", cls: "border-warning/20 bg-warning/10 text-warning" };
  if (status.staged) return { label: "staged", cls: "border-accent/30 bg-accent-soft/40 text-accent-hover" };
  if (status.deleted) return { label: "deleted", cls: "border-danger/20 bg-danger-soft/30 text-danger" };
  if (status.modified) return { label: "modified", cls: "border-warning/20 bg-warning/10 text-warning" };
  if (status.untracked) return { label: "new", cls: "border-border-subtle bg-base-subtle text-text-muted" };
  return { label: "tracked", cls: "border-border-subtle bg-base-subtle/60 text-text-muted" };
}

function MiniStat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "accent" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-[#3fb950]"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : tone === "accent"
            ? "text-accent-hover"
            : "text-text-secondary";
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-base-subtle/40 px-2 py-1.5">
      <span className={cn("shrink-0", toneClass)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <p className={cn("truncate font-mono text-[11px] leading-tight", tone === "success" ? "text-[#3fb950]" : "text-text")}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Files + Live Status in one card: the working-tree file explorer on top and
 * a compact repository status grid below (Branch, HEAD, Working Tree, Staged,
 * Commits, Repository). One card, one header — saves a whole widget.
 */
export function FilesStatusPanel({ className }: FilesStatusPanelProps) {
  const repo = usePlaygroundRepository();
  const writeFile = usePlaygroundStore((state) => state.writeFile);
  const deleteFile = usePlaygroundStore((state) => state.deleteFile);
  const renameFile = usePlaygroundStore((state) => state.renameFile);

  const [mode, setMode] = useState<Mode>(null);
  const [draft, setDraft] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const files = useMemo(() => {
    if (!repo) return [];
    return [...repo.workingTree.keys()].sort();
  }, [repo]);

  const counts = useMemo(() => {
    if (!repo) return { staged: 0, changed: 0, untracked: 0, tracked: 0 };
    const rows = statusRows(repo);
    return {
      staged: rows.filter((row) => row.staged).length,
      changed: rows.filter((row) => !row.staged && (row.modified || row.deleted)).length,
      untracked: rows.filter((row) => row.untracked && !row.staged && !isIgnored(repo, row.path)).length,
      tracked: rows.filter((row) => row.tracked).length,
    };
  }, [repo]);

  if (!repo) return null;

  const startCreate = () => {
    setMode({ kind: "create" });
    setDraft("");
  };
  const confirmCreate = () => {
    const path = draft.trim();
    if (!path || repo.workingTree.has(path)) {
      setMode(null);
      return;
    }
    writeFile(path, "");
    setMode(null);
  };
  const startEdit = (path: string) => {
    setEditingContent(repo.workingTree.get(path)?.content ?? "");
    setDraft(path);
    setMode({ kind: "edit", path });
  };
  const confirmEdit = () => {
    if (!mode || mode.kind !== "edit") return;
    writeFile(mode.path, editingContent);
    setMode(null);
  };
  const startRename = (path: string) => {
    setDraft(path);
    setMode({ kind: "rename", path });
  };
  const confirmRename = () => {
    if (!mode || mode.kind !== "rename") return;
    const to = draft.trim();
    if (!to || to === mode.path) {
      setMode(null);
      return;
    }
    renameFile(mode.path, to);
    setMode(null);
  };
  const confirmDelete = (path: string) => {
    deleteFile(path);
    setMode(null);
  };

  const actionButton = (label: string, onClick: () => void, icon: React.ReactNode, danger?: boolean) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle",
        danger ? "hover:text-danger" : "hover:text-text",
      )}
    >
      {icon}
    </button>
  );

  const latest = repo.commits[repo.commits.length - 1];
  const workingTreeValue =
    counts.changed + counts.untracked > 0 ? `${counts.changed}+${counts.untracked}` : "clean";

  return (
    <PlaygroundPanel
      icon={<FolderTree className="size-3.5" aria-hidden="true" />}
      title="Files & status"
      bodyClassName="p-2.5"
      className={className}
      right={
        <button
          type="button"
          onClick={startCreate}
          className="flex h-7 items-center gap-1 rounded-lg border border-border-subtle bg-base-subtle px-2 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text"
        >
          <FilePlus2 className="size-3.5" aria-hidden="true" />
          New file
        </button>
      }
    >
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-4">
        {/* Files */}
        <div className="max-h-[220px] overflow-y-auto">
          {mode?.kind === "create" && (
          <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft/30 p-1.5">
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") confirmCreate();
                if (event.key === "Escape") setMode(null);
              }}
              placeholder="path/to/file.txt"
              aria-label="New file path"
              className="h-7 min-w-0 flex-1 rounded-md bg-card px-2 font-mono text-[11px] text-text placeholder:text-text-muted focus:outline-none"
            />
            <button type="button" onClick={confirmCreate} aria-label="Create" className="flex size-7 items-center justify-center rounded-md bg-accent text-text-inverse hover:bg-accent-hover">
              <Check className="size-3.5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setMode(null)} aria-label="Cancel" className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-base-subtle hover:text-text">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {files.length === 0 && !mode ? (
          <p className="px-2 py-6 text-center text-[11px] text-text-muted">
            Empty working tree. Create a file to get started.
          </p>
        ) : (
          <ul className="space-y-1">
            {files.map((path) => {
              const status = fileStatusOf(repo, path);
              const ignored = !status.tracked && isIgnored(repo, path);
              const badge = statusBadge(status, ignored);
              const icon = fileIcon(path);

              return (
                <li key={path} className="group relative">
                  {mode?.kind === "rename" && mode.path === path ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft/30 p-1.5">
                      <input
                        autoFocus
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") confirmRename();
                          if (event.key === "Escape") setMode(null);
                        }}
                        aria-label="Rename to"
                        className="h-7 min-w-0 flex-1 rounded-md bg-card px-2 font-mono text-[11px] text-text focus:outline-none"
                      />
                      <button type="button" onClick={confirmRename} aria-label="Rename" className="flex size-7 items-center justify-center rounded-md bg-accent text-text-inverse hover:bg-accent-hover">
                        <Check className="size-3.5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setMode(null)} aria-label="Cancel" className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-base-subtle hover:text-text">
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border-subtle hover:bg-base-subtle/60",
                        ignored && "opacity-50",
                      )}
                    >
                      {icon}
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-text-secondary">{path}</span>
                      <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide", badge.cls)}>
                        {badge.label}
                      </span>
                      <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                        {actionButton("Edit", () => startEdit(path), <Pencil className="size-3.5" aria-hidden="true" />)}
                        {actionButton("Rename", () => startRename(path), <RotateCcw className="size-3.5" aria-hidden="true" />)}
                        {mode?.kind === "confirmDelete" && mode.path === path ? (
                          <button
                            type="button"
                            onClick={() => confirmDelete(path)}
                            className="flex h-6 items-center gap-1 rounded-md bg-danger px-1.5 text-[10px] font-semibold text-white"
                          >
                            Delete? <span className="text-[8px]">(click)</span>
                          </button>
                        ) : (
                          actionButton("Delete", () => setMode({ kind: "confirmDelete", path }), <Trash2 className="size-3.5" aria-hidden="true" />, true)
                        )}
                      </span>
                    </div>
                  )}

                  {mode?.kind === "edit" && mode.path === path && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-1.5 overflow-hidden rounded-lg border border-accent/30"
                    >
                      <div className="bg-[#010409]">
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
                          <span className="font-mono text-[10px] text-text-muted">{mode.path}</span>
                          <span className="text-[10px] text-text-muted">{editingContent.split("\n").length} lines</span>
                        </div>
                        <textarea
                          autoFocus
                          value={editingContent}
                          onChange={(event) => setEditingContent(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") setMode(null);
                            if (event.key === "s" && event.metaKey) {
                              event.preventDefault();
                              confirmEdit();
                            }
                          }}
                          rows={5}
                          aria-label={`Edit ${mode.path}`}
                          className="w-full resize-y bg-[#010409] px-3 py-2 font-mono text-[11px] leading-5 text-[#e6edf3] focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-1.5 border-t border-white/[0.06] px-2 py-1.5">
                          <button type="button" onClick={() => setMode(null)} className="h-6 rounded-md px-2 text-[10px] text-text-muted hover:bg-white/[0.06]">
                            Cancel
                          </button>
                          <button type="button" onClick={confirmEdit} className="h-6 rounded-md bg-[#3fb950] px-2 text-[10px] font-semibold text-[#010409] hover:bg-[#4cc760]">
                            Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        </div>

        {/* Repository status */}
        <div className="mt-4 shrink-0 border-t border-border-subtle pt-3 lg:mt-0 lg:min-w-[260px] lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <p className="flex items-center gap-1.5 px-0.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          <Activity className="size-3" aria-hidden="true" />
          Repository status
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <MiniStat
            icon={<GitBranch className="size-3" aria-hidden="true" />}
            label="Branch"
            value={repo.branch}
            tone="accent"
          />
          <MiniStat
            icon={<GitCommitHorizontal className="size-3" aria-hidden="true" />}
            label="HEAD"
            value={repo.head ? repo.head.slice(0, 7) : "unborn"}
            tone={repo.head ? "accent" : "default"}
          />
          <MiniStat
            icon={<FolderTree className="size-3" aria-hidden="true" />}
            label="Working tree"
            value={workingTreeValue}
            tone={counts.changed + counts.untracked > 0 ? "warning" : "success"}
          />
          <MiniStat
            icon={<Inbox className="size-3" aria-hidden="true" />}
            label="Staged"
            value={counts.staged > 0 ? String(counts.staged) : "0"}
            tone={counts.staged > 0 ? "warning" : "default"}
          />
          <MiniStat
            icon={<CheckCircle2 className="size-3" aria-hidden="true" />}
            label="Commits"
            value={String(repo.commits.length)}
          />
          <MiniStat
            icon={<ShieldCheck className="size-3" aria-hidden="true" />}
            label="Repo"
            value={repo.initialized ? "active" : "empty"}
            tone={repo.initialized ? "success" : "danger"}
          />
        </div>
        <p className="mt-1.5 truncate px-0.5 font-mono text-[9px] text-text-muted">
          {repo.initialized
            ? latest
              ? `${latest.hash.slice(0, 7)} — ${latest.message}`
              : `${counts.tracked} tracked · no commits yet`
            : "run git init to begin"}
        </p>
      </div>
      </div>
    </PlaygroundPanel>
  );
}
