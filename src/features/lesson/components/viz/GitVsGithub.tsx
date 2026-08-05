import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Cloud, Laptop, Share2 } from "lucide-react";
import type { LessonMode } from "@/stores/lessonModeStore";
import { cn } from "@/lib/utils";
import { DiagramContainer } from "@/features/lesson/components/DiagramContainer";
import { VizChrome } from "@/features/lesson/components/interactive/VizChrome";
import { useReadPlayback } from "@/features/lesson/components/interactive/useReadPlayback";
import type { StepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";

const TOTAL_STEPS = 4;

function Cue({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface GitVsGithubProps {
  title?: string;
  player: StepPlayer;
  mode: LessonMode;
}

/**
 * A one-picture answer to "Git vs GitHub": your laptop (Git lives here) on the
 * left, the cloud (GitHub lives here) on the right, with push/pull arrows
 * animating between them. No long paragraphs. The picture teaches.
 */
export function GitVsGithub({ title, player, mode }: GitVsGithubProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 2000 });

  const step = Math.min(player.step, TOTAL_STEPS - 1);
  const showLaptop = step >= 0;
  const showCloud = step >= 1;
  const showPush = step >= 2;
  const showPull = step >= 3;

  return (
    <div ref={ref}>
      <DiagramContainer
        title={title}
        icon={Share2}
        footer={<VizChrome mode={mode} player={player} label="Step" started={started} />}
      >
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
          {/* Laptop: Git */}
          <Cue show={showLaptop} className="mx-auto w-full max-w-[220px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-base-subtle/50 px-5 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft">
                <Laptop className="size-6 text-accent-hover" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text">Your computer</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                  Git lives here. It runs offline, and it's all yours.
                </p>
              </div>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent-hover">
                Git
              </span>
            </div>
          </Cue>

          {/* Middle: push / pull */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-base-subtle px-3 py-1 text-[11px] font-medium text-text-secondary"
              animate={showPush ? { x: [0, 6, 0] } : undefined}
              transition={{ duration: 1.2, repeat: showPush ? Infinity : 0, ease: "easeInOut" }}
            >
              <ArrowUp className="size-3 text-accent-hover" aria-hidden="true" />
              push
            </motion.div>
            <motion.div
              className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-base-subtle px-3 py-1 text-[11px] font-medium text-text-secondary"
              animate={showPull ? { x: [0, -6, 0] } : undefined}
              transition={{ duration: 1.2, repeat: showPull ? Infinity : 0, ease: "easeInOut" }}
            >
              <ArrowDown className="size-3 text-accent-hover" aria-hidden="true" />
              pull
            </motion.div>
          </div>

          {/* Cloud: GitHub */}
          <Cue show={showCloud} className="mx-auto w-full max-w-[220px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-base-subtle/50 px-5 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-warning-soft">
                <Cloud className="size-6 text-warning" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text">The internet</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                  GitHub lives here. It's a website for sharing your work.
                </p>
              </div>
              <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-[11px] font-semibold text-warning">
                GitHub
              </span>
            </div>
          </Cue>
        </div>

        <div className="mt-5 rounded-xl border border-border-subtle bg-base-subtle/40 px-4 py-3">
          <p className={cn("text-xs leading-relaxed text-text-secondary")}>
            <span className="font-semibold text-text">push</span> sends your work up to
            GitHub. <span className="font-semibold text-text">pull</span> brings it back
            down. Same tool on the inside. One is local, one is online.
          </p>
        </div>
      </DiagramContainer>
    </div>
  );
}