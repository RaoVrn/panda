import { useRef } from "react";
import { motion } from "framer-motion";
import { GitCommit, GitFork, History } from "lucide-react";
import type { ContentGitGraphCommit } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { VizChrome } from "./VizChrome";
import type { StepPlayer } from "./useStepPlayer";
import { useReadPlayback } from "./useReadPlayback";
import { cn } from "@/lib/utils";

function CommitDetail({ commit }: { commit: ContentGitGraphCommit }) {
  const isHead = Boolean(commit.accent);
  return (
    <motion.div
      key={commit.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="mt-3 rounded-xl border border-border-subtle bg-base-subtle/40 p-4"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
          commit
        </span>
        <span className="font-mono text-[11px] text-accent-hover">{commit.id.slice(0, 7)}</span>
        {isHead && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-hover">
            HEAD
          </span>
        )}
      </div>
      {commit.message && (
        <p className="mt-1.5 text-sm font-medium text-text">{commit.message}</p>
      )}
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted">
        {commit.branch && (
          <div className="flex items-center gap-1.5">
            <dt className="flex items-center gap-1">
              <GitFork className="size-3" aria-hidden="true" />
              branch
            </dt>
            <dd className="text-text-secondary">{commit.branch}</dd>
          </div>
        )}
        {commit.timestamp && (
          <div className="flex items-center gap-1.5">
            <dt className="flex items-center gap-1">
              <History className="size-3" aria-hidden="true" />
              saved
            </dt>
            <dd className="font-mono tabular-nums text-text-secondary">
              {commit.timestamp}
            </dd>
          </div>
        )}
      </dl>
      {commit.filesChanged && commit.filesChanged.length > 0 && (
        <div className="mt-2.5 border-t border-border-subtle pt-2.5">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">
            Files changed
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {commit.filesChanged.map((f) => (
              <li
                key={f}
                className="rounded-md bg-base-subtle px-2 py-0.5 font-mono text-[11px] text-text-secondary"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export interface GitGraphProps {
  commits: ContentGitGraphCommit[];
  title?: string;
  player: StepPlayer;
  mode: LessonMode;
}

/**
 * Animated commit timeline. In Read mode it plays itself once when scrolled
 * into view: commits appear one at a time and HEAD advances. In Interactive
 * mode Previous/Next step through them. Clicking any commit reveals its
 * message, branch, files and timestamp in both modes.
 */
export function GitGraph({ commits, title, player, mode }: GitGraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 1600 });

  const ordered = [...commits].reverse();
  const activeIndex = Math.min(player.step, ordered.length - 1);
  const active = ordered[activeIndex];

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/50 px-4 py-3">
          <GitCommit className="size-3.5 text-accent-hover" aria-hidden="true" />
          <p className="text-sm font-medium text-text">{title}</p>
        </div>
      )}

      <div className="px-4 py-4">
        <ul className="relative">
          <motion.div
            aria-hidden="true"
            className="absolute left-[21px] top-[22px] w-px bg-border-strong"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(0, activeIndex) * 46}px` }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          />

          {ordered.map((commit, index) => {
            const isActive = index === activeIndex;
            if (index > activeIndex) return null; // revealed progressively
            return (
              <motion.li
                key={commit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative flex items-center pl-[34px] pb-6"
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`Inspect ${commit.message ?? commit.label ?? commit.id}`}
                  onClick={() => player.setStep(index)}
                  className={cn(
                    "group flex min-w-0 items-center gap-2 rounded-md py-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    isActive ? "text-text" : "text-text-secondary hover:text-text",
                  )}
                >
                  <span aria-hidden="true" className="absolute left-[13px] top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full">
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-accent/30"
                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative size-4 rounded-full border transition-all",
                        isActive
                          ? "border-accent bg-card ring-2 ring-accent/20"
                          : "border-border-strong bg-card group-hover:border-accent",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute size-1.5 rounded-full",
                        isActive ? "bg-accent" : "bg-text-muted",
                      )}
                    />
                  </span>

                  <span className="truncate text-sm">
                    {commit.message ?? commit.label ?? commit.id}
                  </span>
                  {commit.accent && (
                    <span className="ml-1 inline-flex shrink-0 items-center rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-hover">
                      HEAD
                    </span>
                  )}
                  {commit.branch && commit.branch !== "main" && (
                    <span className="shrink-0 font-mono text-[10px] text-text-muted">
                      {commit.branch}
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>

        {active && <CommitDetail commit={active} />}
      </div>

      <VizChrome mode={mode} player={player} label="Commit" started={started} />
    </div>
  );
}