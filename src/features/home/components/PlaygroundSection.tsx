import { motion } from "framer-motion";
import {
  Check,
  Flag,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { allLessons } from "@/content/lessons";

const bullets = [
  {
    title: "Run real Git commands",
    body: "git init, add, commit, branch, merge, rebase, all of it in a safe simulated repository.",
  },
  {
    title: "Break repositories safely",
    body: "Make a mess on purpose. Nothing you break here can hurt a real project.",
  },
  {
    title: "Instant visual feedback",
    body: "Every command updates the visualizer the moment you press Enter.",
  },
  {
    title: "Reset in one click",
    body: "Get a fresh repository anytime and experiment forever.",
  },
];

function MissionSidebar() {
  const items = [
    { label: "Stage one file by name", done: true },
    { label: "Stage several files by name", done: false },
    { label: "Sweep the rest with git add .", done: false },
  ];
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border-subtle bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-white/[0.03] bg-white/[0.01] px-3 py-2">
        <span className="flex size-5 items-center justify-center rounded-lg bg-accent/8 text-accent-hover">
          <Flag className="size-3" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-medium text-text">Mission</span>
        <span className="ml-auto font-mono text-[10px] font-semibold text-text-secondary">33%</span>
      </div>
      <div className="space-y-1.5 p-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={
              "flex items-start gap-2 rounded-lg border px-2 py-1.5 " +
              (item.done
                ? "border-transparent bg-[#3fb950]/[0.05]"
                : item.label.startsWith("Stage several")
                  ? "border-accent/20 bg-accent/[0.06]"
                  : "border-white/[0.03] bg-white/[0.02]")
            }
          >
            <span
              className={
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border " +
                (item.done
                  ? "border-[#3fb950] bg-[#3fb950] text-[#010409]"
                  : "border-border-strong bg-card")
              }
            >
              {item.done && <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />}
            </span>
            <span
              className={
                "text-[11px] leading-snug " +
                (item.done ? "text-text-muted line-through" : "text-text-secondary")
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalMock() {
  const lines = [
    { prompt: true, text: "git add README.md", color: "text-[#79c0ff]" },
    { prompt: false, text: "README.md is staged and ready for the next snapshot.", color: "text-[#8b949e]" },
    { prompt: true, text: "git status", color: "text-[#79c0ff]" },
    { prompt: false, text: "Changes to be committed:", color: "text-[#8b949e]" },
    { prompt: false, text: "  new file:   README.md", color: "text-[#7ee787]" },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-[#010409]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#161b22] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-1 flex items-center gap-1.5 font-mono text-[10px] text-[#8b949e]">
          <Terminal className="size-3" aria-hidden="true" /> panda-shell
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-[#8b949e]">
          <RotateCcw className="size-2.5" aria-hidden="true" /> Reset sandbox
        </span>
      </div>
      <div className="space-y-1.5 px-4 py-3 font-mono text-[12px] leading-5">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            {line.prompt && <span className="select-none text-[#7ee787]">$ </span>}
            <span className={line.color}>{line.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-0.5 pt-0.5">
          <span className="select-none text-[#7ee787]">$ </span>
          <span className="inline-block h-4 w-2 animate-pulse bg-[#e6edf3]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function StatusGrid() {
  const cells = [
    { label: "Branch", value: "main", icon: <GitBranch className="size-3" aria-hidden="true" />, tone: "text-accent-hover" },
    { label: "HEAD", value: "a1f8b3", icon: <GitBranch className="size-3" aria-hidden="true" />, tone: "text-accent-hover" },
    { label: "Working tree", value: "0+3", icon: <GitBranch className="size-3" aria-hidden="true" />, tone: "text-warning" },
    { label: "Staged", value: "1", icon: <GitBranch className="size-3" aria-hidden="true" />, tone: "text-warning" },
    { label: "Commits", value: "2", icon: <GitBranch className="size-3" aria-hidden="true" />, tone: "text-text-secondary" },
    { label: "Repository", value: "active", icon: <ShieldCheck className="size-3" aria-hidden="true" />, tone: "text-[#3fb950]" },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg border border-white/[0.02] bg-white/[0.01] px-2 py-1.5">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-text-muted">{c.label}</p>
          <p className={c.tone + " truncate font-mono text-[11px]"}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

export function PlaygroundSection() {
  // "Try the Playground" opens the real hands-on playground of the first
  // lesson that ships one, instead of just dropping the visitor on the course.
  const playgroundLesson = allLessons().find((lesson) => lesson.playground);

  return (
    <section className="py-16 sm:py-20">
      <SectionTitle
        eyebrow="The Playground"
        title="Practice without breaking anything."
        description="Panda's biggest differentiator. A real Git sandbox on every lesson, so you learn by doing, not by watching."
      />
      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Copy */}
        <div>
          <ul className="space-y-5">
            {bullets.map((bullet) => (
              <li key={bullet.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-card text-accent-hover">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-text">{bullet.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{bullet.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button
            href={playgroundLesson ? `/lesson/${playgroundLesson.slug}?mode=interactive` : "/dashboard"}
            className="mt-8"
          >
            Try the Playground
          </Button>
        </div>

        {/* Playground mockup */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <TerminalMock />
            </div>
            <div className="w-full sm:w-44">
              <MissionSidebar />
            </div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-card p-3 shadow-card">
            <StatusGrid />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
