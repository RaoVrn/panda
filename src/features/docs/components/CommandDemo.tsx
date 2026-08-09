import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FileCode2,
  FolderGit2,
  GitBranch,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommandId = "add" | "commit" | "branch" | "checkout";

interface StatePill {
  lane: string;
  detail: string;
}

interface CommandDef {
  id: CommandId;
  label: string;
  code: string;
  before: StatePill;
  after: StatePill;
  what: string;
}

const COMMANDS: CommandDef[] = [
  {
    id: "add",
    label: "git add",
    code: "git add README.md",
    before: { lane: "Working Tree", detail: "README.md changed" },
    after: { lane: "Staging Area", detail: "README.md staged" },
    what: "Stages your changes so they're ready to be committed.",
  },
  {
    id: "commit",
    label: "git commit",
    code: 'git commit -m "Save changes"',
    before: { lane: "Staging Area", detail: "2 files staged" },
    after: { lane: "Repository", detail: "Snapshot saved in history" },
    what: "Turns your staged changes into a permanent snapshot.",
  },
  {
    id: "branch",
    label: "git branch",
    code: "git branch new-feature",
    before: { lane: "Repository", detail: "You are on main" },
    after: { lane: "Branch History", detail: "new-feature created" },
    what: "Creates a new branch at your current commit, ready to diverge.",
  },
  {
    id: "checkout",
    label: "git checkout",
    code: "git checkout new-feature",
    before: { lane: "Branch History", detail: "On main" },
    after: { lane: "Branch History", detail: "On new-feature, HEAD moves" },
    what: "Switches your working copy onto another branch.",
  },
];

const LANE_ICONS: Record<string, LucideIcon> = {
  "Working Tree": FileCode2,
  "Staging Area": FolderGit2,
  Repository: PackageCheck,
  "Branch History": GitBranch,
};

/**
 * Interactive teaching example. Pick a Git command and see the before/after
 * repository state. Every behavior matches the real Panda simulator.
 */
export function CommandDemo() {
  const [selected, setSelected] = useState<CommandDef>(COMMANDS[0]!);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card">
      {/* Command selector */}
      <div
        role="tablist"
        aria-label="Git commands"
        className="flex flex-wrap gap-1 border-b border-border-subtle bg-base-subtle/40 p-1.5"
      >
        {COMMANDS.map((command) => (
          <button
            key={command.id}
            type="button"
            role="tab"
            aria-selected={selected.id === command.id}
            onClick={() => setSelected(command)}
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-[12.5px] font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
              selected.id === command.id
                ? "bg-accent text-text-inverse shadow-[0_1px_2px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/10"
                : "text-text-secondary hover:bg-base-subtle hover:text-text",
            )}
          >
            {command.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        <p className="sr-only">
          {selected.label}: {selected.what}
        </p>

        <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <StatePillCard pill={selected.before} label="Before" accent={false} />
          <div className="hidden items-center justify-center sm:flex">
            <motion.span
              key={`arrow-${selected.id}`}
              initial={{ x: -6, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent-hover"
            >
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </motion.span>
          </div>
          <StatePillCard pill={selected.after} label="After" accent />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-4"
          >
            <code className="shrink-0 self-start rounded-lg border border-border-subtle bg-[#0d1117] px-3 py-1.5 font-mono text-[12.5px] text-[#e6edf3]">
              <span className="text-text-muted">$ </span>
              {selected.code}
            </code>
            <p className="text-[13px] leading-relaxed text-text-secondary">{selected.what}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatePillCard({
  pill,
  label,
  accent,
}: {
  pill: StatePill;
  label: string;
  accent: boolean;
}) {
  const Icon = LANE_ICONS[pill.lane] ?? FileCode2;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-4 py-3",
        accent ? "border-accent/40 bg-accent-soft/20" : "border-border-subtle bg-base-subtle/40",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            accent ? "bg-accent-soft text-accent-hover" : "bg-base-subtle text-text-secondary",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className={cn("block text-sm font-semibold", accent ? "text-text" : "text-text-secondary")}>
            {pill.lane}
          </span>
          <span className="block text-[12px] text-text-muted">{pill.detail}</span>
        </span>
      </div>
    </div>
  );
}
