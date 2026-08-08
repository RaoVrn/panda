import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, GitBranch, GitCommitHorizontal, Inbox, FolderTree } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * A self-running demo of Panda's Playground. Scripts the flow
 *   git add → staging → git commit → history → git branch → graph
 * with subtle 250ms transitions, so visitors see the product actually move
 * instead of a static screenshot.
 */

interface Stage {
  command: string;
  note: string;
}

const STAGES: Stage[] = [
  { command: "git add README.md", note: "README.md moves from the working tree to the staging area." },
  { command: 'git commit -m "Add README"', note: "The staged file becomes a permanent snapshot in the repository." },
  { command: "git branch feature", note: "A new branch appears, a parallel line of work." },
  { command: "git checkout feature", note: "HEAD moves onto the feature branch." },
];

const STEP_MS = 2400;

function MiniTerminal({ command, note }: { command: string; note: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-[#010409]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#161b22] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-1 font-mono text-[10px] text-[#8b949e]">panda-shell</span>
      </div>
      <div className="space-y-2 px-4 py-3 font-mono text-[12px] leading-5">
        <div>
          <span className="select-none text-[#7ee787]">$ </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={command}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[#79c0ff]"
            >
              {command}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.p
          key={command}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-[#8b949e]"
        >
          {note}
        </motion.p>
      </div>
    </div>
  );
}

function FileChip({ name, state }: { name: string; state: "working" | "staged" | "committed" }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[11px]",
        state === "working" && "border-transparent bg-white/[0.02] text-text-secondary",
        state === "staged" && "border-accent/25 bg-accent/[0.06] text-text",
        state === "committed" && "border-[#3fb950]/25 bg-[#3fb950]/[0.06] text-[#3fb950]",
      )}
    >
      <FileText className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {state !== "working" && <Check className="size-3 shrink-0 text-accent-hover" aria-hidden="true" />}
    </motion.div>
  );
}

function Column({
  label,
  sub,
  icon,
  dot,
  children,
  active,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  dot: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border transition-colors duration-300",
        active ? "border-accent/20 bg-accent/[0.04]" : "border-border-subtle bg-white/[0.01]",
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.03] px-3 py-2">
        <span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />
        <span className="flex size-6 items-center justify-center rounded-lg bg-card text-accent-hover">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold text-text">{label}</span>
          <span className="block truncate text-[9px] text-text-muted">{sub}</span>
        </span>
      </div>
      <div className="flex min-h-[72px] flex-col gap-1.5 p-2">{children}</div>
    </div>
  );
}

function MiniGraph({ featureCheckedOut }: { featureCheckedOut: boolean }) {
  return (
    <svg viewBox="0 0 300 34" className="w-full" aria-hidden="true">
      <path
        d="M 14 17 H 92 L 108 17 H 180"
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 92 17 C 100 4, 120 4, 128 17 H 190"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[14, 92, 180].map((x) => (
        <circle key={x} cx={x} cy={17} r={5.5} className="fill-base stroke-border-strong" strokeWidth="1.3" />
      ))}
      {[128, 190].map((x) => (
        <circle key={x} cx={x} cy={17} r={5.5} className={cn("fill-base stroke-accent", featureCheckedOut && "fill-accent")} strokeWidth="1.3" />
      ))}
      <text x={14} y={31} className="fill-text-muted font-mono text-[8px]">main</text>
      <text x={188} y={31} className={cn("font-mono text-[8px]", featureCheckedOut ? "fill-accent" : "fill-text-muted")}>feature</text>
      <circle cx={14} cy={17} r={2.5} className="fill-text-muted" />
      <circle cx={92} cy={17} r={2.5} className="fill-text-muted" />
      <circle cx={180} cy={17} r={2.5} className="fill-text-muted" />
      <circle cx={128} cy={17} r={2.5} className="fill-accent" />
      <circle cx={190} cy={17} r={2.5} className={featureCheckedOut ? "fill-accent" : "fill-text-muted"} />
    </svg>
  );
}

export function ProductShowcase() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setStage((s) => (s + 1) % STAGES.length), STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  const current = STAGES[stage]!;
  const committed = stage >= 1;
  const branched = stage >= 2;
  const onFeature = stage >= 3;

  const repo: Array<{ name: string; state: "working" | "staged" | "committed" }> = useMemo(() => {
    if (committed) return [{ name: "README.md", state: "committed" }];
    return [{ name: "README.md", state: "working" }];
  }, [committed]);

  const committedFiles = committed ? repo : [];

  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="See it in action"
        title="Watch Git happen"
        description="Every command you type updates the working tree, the staging area, the repository and the branch graph, instantly, on one screen."
      />
      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Copy */}
        <div>
          <Badge tone="accent">Live Preview</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Git, made visible
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            Don't guess what{" "}
            <code className="rounded bg-base-subtle px-1.5 py-0.5 font-mono text-[0.9em] text-text">git add</code>{" "}
            does. Watch a file leave your working tree, land in the staging
            area, then become a permanent snapshot, and see the branch graph
            change as you go.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "See the working tree, staging area and history side by side.",
              "Watch branches split and merge in real time.",
              "Type real Git commands and get real responses.",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                  <Check className="size-3 text-accent-hover" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Animated demo */}
        <div className="space-y-3">
          <MiniTerminal command={current.command} note={current.note} />

          {/* Visualizer */}
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-card p-3 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-text">Repository visualizer</p>
              <span className="flex items-center gap-1.5 text-[9px] text-text-muted">
                <span className="size-1.5 animate-pulse rounded-full bg-[#3fb950]" aria-hidden="true" />
                live state
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Column label="Working Tree" sub={committed ? "all files up to date" : "1 file changed"} icon={<FolderTree className="size-3.5" aria-hidden="true" />} dot="bg-accent" active={!committed}>
                {committed ? (
                  <div className="flex flex-1 items-center justify-center text-center text-[10px] text-text-muted">No changes</div>
                ) : (
                  <FileChip name="README.md" state="working" />
                )}
              </Column>
              <Column label="Staging Area" sub={committed ? "nothing staged" : "1 file staged"} icon={<Inbox className="size-3.5" aria-hidden="true" />} dot="bg-warning" active={!committed}>
                {!committed ? (
                  <FileChip name="README.md" state="staged" />
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-[10px] text-text-muted">Empty</div>
                )}
              </Column>
              <Column label="Repository" sub={committed ? "1 commit" : "no commits yet"} icon={<GitCommitHorizontal className="size-3.5" aria-hidden="true" />} dot="bg-[#3fb950]" active={committed}>
                {committed ? (
                  <div className="flex flex-1 flex-col gap-1">
                    {committedFiles.map((f) => (
                      <FileChip key={f.name} name={f.name} state={f.state} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-[10px] text-text-muted">No snapshots</div>
                )}
              </Column>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.03] bg-white/[0.01] px-2.5 py-1.5">
              <span className="font-mono text-[10px] text-text-muted">
                {onFeature ? "HEAD → feature" : "HEAD → main"}
              </span>
              <MiniGraph featureCheckedOut={onFeature} />
            </div>
          </div>

          {/* Mission strip */}
          <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card px-3.5 py-2.5">
            <span className="flex size-6 items-center justify-center rounded-lg bg-accent-soft">
              <GitBranch className="size-3.5 text-accent-hover" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-text">Your mission</p>
                <span className="font-mono text-[10px] text-text-muted">{branched ? "2/3" : "1/3"} · {branched ? "66%" : "33%"}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.03]">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  animate={{ width: branched ? "66%" : "33%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <p className="mt-1 truncate text-[10px] text-text-muted">
                {onFeature ? "Next: commit on feature" : current.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
