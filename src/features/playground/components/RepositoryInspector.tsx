import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronDown,
  File,
  FileCode,
  FileImage,
  FileJson,
  FilePlus2,
  FileText,
  FolderTree,
  GitBranch,
  GitCommitHorizontal,
  History,
  Inbox,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { fileStatusOf, isIgnored, statusRows } from "@/lib/git";
import type { GitFileStatus } from "@/lib/git";
import { usePlaygroundRepository } from "../usePlayground";
import { usePlaygroundStore } from "../playgroundStore";
import { PlaygroundPanel } from "./Panel";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

type Tab = "files" | "history";

type FileMode =
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
  if (status.untracked) return { label: "new", cls: "border-white/[0.04] bg-white/[0.02] text-text-muted" };
  return { label: "tracked", cls: "border-white/[0.03] bg-white/[0.01] text-text-muted" };
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

const CHANGE_LABEL: Record<string, string> = { added: "text-[#3fb950]", modified: "text-warning", deleted: "text-danger" };

function MiniStat({
  icon, label, value, tone = "default",
}: { icon: React.ReactNode; label: string; value: string; tone?: "default" | "success" | "warning" | "accent" | "danger" }) {
  const t = tone === "success" ? "text-[#3fb950]" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent-hover" : "text-text-secondary";
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.02] bg-white/[0.01] px-2 py-1.5">
      <span className={cn("shrink-0", t)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <p className={cn("truncate font-mono text-[11px] leading-tight", tone === "success" ? "text-[#3fb950]" : "text-text")}>{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RepositoryInspector                                                  */
/* ------------------------------------------------------------------ */

export interface RepositoryInspectorProps {
  className?: string;
}

/**
 * One inspector panel replacing three separate cards. Two tabs:
 *
 *   Files & Status  —  file explorer (always-visible actions) + repo status grid
 *   History          —  commit timeline (compact when ≤2, full timeline otherwise)
 *
 * Everything reads from the engine; every file action drives it.
 */
export function RepositoryInspector({ className }: RepositoryInspectorProps) {
  const repo = usePlaygroundRepository();
  const writeFile = usePlaygroundStore((state) => state.writeFile);
  const deleteFile = usePlaygroundStore((state) => state.deleteFile);
  const renameFile = usePlaygroundStore((state) => state.renameFile);

  const [tab, setTab] = useState<Tab>("files");
  const [fileMode, setFileMode] = useState<FileMode>(null);
  const [draft, setDraft] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [commitOpen, setCommitOpen] = useState<string | null>(null);

  const files = useMemo(() => repo ? [...repo.workingTree.keys()].sort() : [], [repo]);
  const counts = useMemo(() => {
    if (!repo) return { staged: 0, changed: 0, untracked: 0, tracked: 0 };
    const rows = statusRows(repo);
    return {
      staged: rows.filter((r) => r.staged).length,
      changed: rows.filter((r) => !r.staged && (r.modified || r.deleted)).length,
      untracked: rows.filter((r) => r.untracked && !r.staged && !isIgnored(repo, r.path)).length,
      tracked: rows.filter((r) => r.tracked).length,
    };
  }, [repo]);
  const commits = useMemo(() => repo ? [...repo.commits].reverse() : [], [repo]);

  if (!repo) return null;

  const latest = repo.commits[repo.commits.length - 1];
  const workingTreeValue = counts.changed + counts.untracked > 0 ? `${counts.changed}+${counts.untracked}` : "clean";
  const compactHistory = commits.length <= 2;

  // file actions
  const startCreate = () => { setFileMode({ kind: "create" }); setDraft(""); };
  const confirmCreate = () => { const p = draft.trim(); if (!p || repo.workingTree.has(p)) { setFileMode(null); return; } writeFile(p, ""); setFileMode(null); };
  const startEdit = (path: string) => { setEditingContent(repo.workingTree.get(path)?.content ?? ""); setFileMode({ kind: "edit", path }); };
  const confirmEdit = () => { if (!fileMode || fileMode.kind !== "edit") return; writeFile(fileMode.path, editingContent); setFileMode(null); };
  const startRename = (path: string) => { setDraft(path); setFileMode({ kind: "rename", path }); };
  const confirmRename = () => { if (!fileMode || fileMode.kind !== "rename") return; const to = draft.trim(); if (!to || to === fileMode.path) { setFileMode(null); return; } renameFile(fileMode.path, to); setFileMode(null); };
  const confirmDelete = (path: string) => { deleteFile(path); setFileMode(null); };

  const actionBtn = (label: string, onClick: () => void, icon: React.ReactNode, danger?: boolean) => (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={cn("flex size-6 items-center justify-center rounded-md opacity-50 transition-all hover:opacity-100 hover:bg-white/[0.01]", danger ? "hover:text-danger" : "hover:text-text")}>
      {icon}
    </button>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "files", label: "Files & Status", icon: <FolderTree className="size-3.5" aria-hidden="true" /> },
    { id: "history", label: "History", icon: <History className="size-3.5" aria-hidden="true" /> },
  ];

  return (
    <PlaygroundPanel
      icon={tabs.find((t) => t.id === tab)?.icon}
      title={tabs.find((t) => t.id === tab)?.label ?? "Inspector"}
      className={className}
      bodyClassName="p-0"
      right={
        <div className="flex items-center gap-1">
          {tab === "files" && (
            <button type="button" onClick={startCreate} className="flex h-8 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-white/[0.10] hover:bg-white/[0.06] hover:text-text">
              <FilePlus2 className="size-3.5" />New file
            </button>
          )}
          {tabs.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
                  active ? "bg-base-elevated text-text shadow-sm" : "text-text-muted hover:text-text",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="border-t border-white/[0.03]">
        {tab === "files" && (
          <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-4 p-3">
            {/* Files */}
            <div className="max-h-[220px] overflow-y-auto">
              {fileMode?.kind === "create" && (
                <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft/30 p-1.5">
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmCreate(); if (e.key === "Escape") setFileMode(null); }}
                    placeholder="path/to/file.txt" aria-label="New file path"
                    className="h-7 min-w-0 flex-1 rounded-md bg-card px-2 font-mono text-[11px] text-text placeholder:text-text-muted focus:outline-none" />
                  <button type="button" onClick={confirmCreate} aria-label="Create" className="flex size-7 items-center justify-center rounded-md bg-accent text-text-inverse hover:bg-accent-hover"><Check className="size-3.5" /></button>
                  <button type="button" onClick={() => setFileMode(null)} aria-label="Cancel" className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-white/[0.01] hover:text-text"><X className="size-3.5" /></button>
                </div>
              )}

              {files.length === 0 && !fileMode ? (
                <p className="px-2 py-6 text-center text-[11px] text-text-muted">Empty working tree. Create a file to get started.</p>
              ) : (
                <ul className="space-y-1">
                  {files.map((path) => {
                    const status = fileStatusOf(repo, path);
                    const ignored = !status.tracked && isIgnored(repo, path);
                    const badge = statusBadge(status, ignored);
                    const icon = fileIcon(path);
                    return (
                      <li key={path}>
                        {fileMode?.kind === "rename" && fileMode.path === path ? (
                          <div className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft/30 p-1.5">
                            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setFileMode(null); }}
                              aria-label="Rename to" className="h-7 min-w-0 flex-1 rounded-md bg-card px-2 font-mono text-[11px] text-text focus:outline-none" />
                            <button onClick={confirmRename} className="flex size-7 items-center justify-center rounded-md bg-accent text-text-inverse hover:bg-accent-hover"><Check className="size-3.5" /></button>
                            <button onClick={() => setFileMode(null)} className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-white/[0.01] hover:text-text"><X className="size-3.5" /></button>
                          </div>
                        ) : (
                          <div className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.05]", ignored && "opacity-40")}>
                            {icon}
                            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-text-secondary">{path}</span>
                            <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide", badge.cls)}>{badge.label}</span>
                            <span className="flex shrink-0 items-center gap-0.5">
                              {actionBtn("Edit", () => startEdit(path), <Pencil className="size-3.5" />)}
                              {actionBtn("Rename", () => startRename(path), <RotateCcw className="size-3.5" />)}
                              {fileMode?.kind === "confirmDelete" && fileMode.path === path ? (
                                <button onClick={() => confirmDelete(path)} className="flex h-6 items-center gap-1 rounded-md bg-danger px-1.5 text-[10px] font-semibold text-white">Delete? <span className="text-[8px]">(click)</span></button>
                              ) : (
                                actionBtn("Delete", () => setFileMode({ kind: "confirmDelete", path }), <Trash2 className="size-3.5" />, true)
                              )}
                            </span>
                          </div>
                        )}
                        {fileMode?.kind === "edit" && fileMode.path === path && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.15 }} className="mt-1.5 overflow-hidden rounded-lg border border-accent/30">
                            <div className="bg-[#010409]">
                              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5"><span className="font-mono text-[10px] text-text-muted">{path}</span><span className="text-[10px] text-text-muted">{editingContent.split("\n").length} lines</span></div>
                              <textarea autoFocus value={editingContent} onChange={(e) => setEditingContent(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setFileMode(null); if (e.key === "s" && e.metaKey) { e.preventDefault(); confirmEdit(); } }} rows={4} aria-label={`Edit ${path}`} className="w-full resize-none bg-[#010409] px-3 py-2 font-mono text-[11px] leading-5 text-[#e6edf3] focus:outline-none max-h-[140px]" />
                              <div className="flex items-center justify-end gap-1.5 border-t border-white/[0.06] px-2 py-1.5"><button onClick={() => setFileMode(null)} className="h-6 rounded-md px-2 text-[10px] text-text-muted hover:bg-white/[0.06]">Cancel</button><button onClick={confirmEdit} className="h-6 rounded-md bg-[#3fb950] px-2 text-[10px] font-semibold text-[#010409] hover:bg-[#4cc760]">Save</button></div>
                            </div>
                          </motion.div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Status */}
            <div className="mt-3 shrink-0 border-t border-white/[0.03] pt-3 lg:mt-0 lg:min-w-[252px] lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              <p className="flex items-center gap-1.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted"><Activity className="size-3" />Status</p>
              <div className="grid grid-cols-2 gap-1.5">
                <MiniStat icon={<GitBranch className="size-3" />} label="Current branch" value={repo.branch} tone="accent" />
                <MiniStat icon={<GitCommitHorizontal className="size-3" />} label="Latest commit" value={repo.head ? repo.head.slice(0, 7) : "unborn"} tone={repo.head ? "accent" : "default"} />
                <MiniStat icon={<FolderTree className="size-3" />} label="Files changed" value={workingTreeValue} tone={counts.changed + counts.untracked > 0 ? "warning" : "success"} />
                <MiniStat icon={<Inbox className="size-3" />} label="Ready to save" value={counts.staged > 0 ? String(counts.staged) : "0"} tone={counts.staged > 0 ? "warning" : "default"} />
                <MiniStat icon={<CheckCircle2 className="size-3" />} label="Snapshots" value={String(repo.commits.length)} />
                <MiniStat icon={<ShieldCheck className="size-3" />} label="Repository" value={repo.initialized ? "active" : "empty"} tone={repo.initialized ? "success" : "danger"} />
              </div>
              <p className="mt-1.5 truncate font-mono text-[9px] text-text-muted">{repo.initialized ? latest ? `${latest.hash.slice(0, 7)} · ${latest.message}` : `${counts.tracked} tracked · no commits yet` : "run git init to begin"}</p>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="p-3">
            {commits.length === 0 ? (
              <p className="flex flex-col items-center gap-1 py-10 text-center text-[12px] text-text-muted">
                <GitCommitHorizontal className="size-6" />No commits yet. Stage something and commit.
              </p>
            ) : compactHistory ? (
              /* Compact list for ≤2 commits */
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                {commits.map((commit) => {
                  const isHead = commit.hash === repo.head;
                  const expanded = commitOpen === commit.hash;
                  return (
                    <motion.li
                      key={commit.hash}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <button
                        type="button"
                        onClick={() => setCommitOpen((c) => (c === commit.hash ? null : commit.hash))}
                        className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors", isHead ? "bg-accent/6 border border-accent/15" : "bg-white/[0.01] hover:bg-white/[0.04]")}
                      >
                        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border-2", isHead ? "border-accent bg-accent-soft text-accent-hover shadow-glow" : "border-border-strong bg-card text-text-muted")}>
                          <GitCommitHorizontal className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-[14px] font-medium", isHead ? "text-text" : "text-text-secondary")}>{commit.message}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-text-muted">{commit.hash.slice(0, 7)} · {timeAgo(commit.timestamp)}</span>
                        </span>
                        {isHead && <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold text-text-inverse">HEAD</span>}
                        <ChevronDown className={cn("size-3.5 shrink-0 text-text-muted transition-transform", expanded && "rotate-180")} />
                      </button>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                          <div className="mx-4 mt-1 rounded-lg border border-white/[0.03] bg-white/[0.01] px-3 py-2">
                            <p className="flex items-center gap-1 text-[11px] text-text-muted"><User className="size-3" /> {commit.author.name} <span className="text-border-strong">·</span> <span className="font-mono text-[10px]">{commit.hash}</span></p>
                            {commit.changedFiles.length > 0 && (
                              <ul className="mt-1.5 space-y-0.5 border-t border-white/[0.03] pt-1.5">
                                {commit.changedFiles.map((f) => (
                                  <li key={f.path} className="flex items-center gap-2 font-mono text-[11px]"><span className={cn("w-16 shrink-0 uppercase text-[9px]", CHANGE_LABEL[f.status] ?? "")}>{f.status}</span><span className="text-text-secondary">{f.path}</span></li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.li>
                  );
                })}
                </AnimatePresence>
              </ul>
            ) : (
              /* Full timeline for >2 commits */
              <div className="overflow-x-auto">
                <div className="flex items-start gap-6">
                {commits.map((commit, index) => {
                    const isHead = commit.hash === repo.head;
                    const expanded = commitOpen === commit.hash;
                    return (
                      <div key={commit.hash} className="relative flex shrink-0 items-start">
                        <div className="flex flex-col items-center">
                          <motion.button
                            type="button" onClick={() => setCommitOpen((c) => (c === commit.hash ? null : commit.hash))}
                            whileTap={{ scale: 0.94 }}
                            aria-label={`Inspect commit ${commit.message}`} aria-pressed={expanded}
                            className={cn("flex size-10 items-center justify-center rounded-full border-2 transition-colors duration-150", isHead ? "border-accent bg-accent-soft text-accent-hover shadow-glow" : expanded ? "border-accent/60 bg-accent-soft/40 text-accent-hover" : "border-border-strong bg-card text-text-muted hover:border-accent/50 hover:text-accent-hover")}
                          >
                            <GitCommitHorizontal className="size-5" />
                          </motion.button>
                        </div>
                        <div className="ml-3 min-w-0 max-w-[220px]">
                          <p className={cn("truncate text-[13px] font-medium leading-tight", isHead ? "text-text" : "text-text-secondary")}>{commit.message}</p>
                          <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-text-muted"><span>{commit.hash.slice(0, 7)}</span><span>·</span><span>{timeAgo(commit.timestamp)}</span></p>
                          {isHead && <span className="mt-1 inline-block rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-text-inverse">HEAD</span>}
                        </div>
                        {index < commits.length - 1 && <span className="mt-[18px] ml-2 h-0.5 w-6 bg-border-subtle" />}
                        {expanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.15 }} className="absolute top-full left-0 z-10 mt-2 w-64 rounded-xl border border-white/[0.04] bg-card px-4 py-3 shadow-lg">
                            <p className="flex items-center gap-1 text-[11px] text-text-muted"><User className="size-3" /> {commit.author.name} <span className="text-border-strong">·</span> <span className="font-mono text-[10px]">{commit.hash}</span></p>
                            {commit.changedFiles.length > 0 && (
                              <ul className="mt-1.5 space-y-0.5 border-t border-white/[0.03] pt-1.5">
                                {commit.changedFiles.map((f) => (<li key={f.path} className="flex items-center gap-2 font-mono text-[11px]"><span className={cn("w-16 shrink-0 uppercase text-[9px]", CHANGE_LABEL[f.status] ?? "")}>{f.status}</span><span className="text-text-secondary">{f.path}</span></li>))}
                              </ul>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PlaygroundPanel>
  );
}
