import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  RotateCcw,
  Save,
  Skull,
  Smile,
  Sparkles,
  Swords,
  type LucideIcon,
} from "lucide-react";
import type { ContentStoryboardNode } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { cn } from "@/lib/utils";
import { DiagramContainer } from "@/features/lesson/components/DiagramContainer";
import { VizChrome } from "@/features/lesson/components/interactive/VizChrome";
import { useReadPlayback } from "@/features/lesson/components/interactive/useReadPlayback";
import type { StepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";

const ICONS: Record<string, LucideIcon> = {
  game: Gamepad2,
  save: Save,
  sword: Swords,
  skull: Skull,
  load: RotateCcw,
  happy: Smile,
  sparkle: Sparkles,
};

function iconFor(node: ContentStoryboardNode): LucideIcon {
  return (node.icon ? ICONS[node.icon] : undefined) ?? Sparkles;
}

export interface StoryBoardProps {
  nodes: ContentStoryboardNode[];
  title?: string;
  player: StepPlayer;
  mode: LessonMode;
}

/**
 * A story that plays one beat at a time — used to teach through a tiny
 * real-life scene (e.g. "game → save → boss → load") before the learner is
 * asked to connect it to Git. In Read mode it plays itself on scroll; in
 * Interactive mode Previous/Next step through the beats.
 */
export function StoryBoard({ nodes, title, player, mode }: StoryBoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 1800 });

  const activeIndex = Math.min(player.step, nodes.length - 1);

  return (
    <div ref={ref}>
      <DiagramContainer
        title={title}
        icon={Sparkles}
        footer={<VizChrome mode={mode} player={player} label="Beat" started={started} />}
      >
        <ol className="relative flex flex-col">
          <motion.span
            aria-hidden="true"
            className="absolute left-[17px] top-[5px] w-px bg-border-strong"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(0, activeIndex) * 64}px` }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          />
          {nodes.map((node, index) => {
            const Icon = iconFor(node);
            const isActive = index === activeIndex;
            const revealed = index <= activeIndex;
            if (!revealed) return null;
            return (
              <motion.li
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative flex items-center gap-3 pl-[46px] pb-7 last:pb-0"
              >
                <span className="absolute left-[13px] top-0 flex size-2.5">
                  <span
                    className={cn(
                      "size-2.5 rounded-full transition-colors",
                      isActive ? "bg-accent" : "bg-border-strong",
                    )}
                  />
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-accent/30"
                      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                    isActive
                      ? "border-accent/40 bg-accent-soft text-accent-hover"
                      : "border-border-subtle bg-base-subtle text-text-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    "text-sm leading-relaxed transition-colors",
                    isActive ? "font-medium text-text" : "text-text-secondary",
                  )}
                >
                  {node.text}
                </span>
              </motion.li>
            );
          })}
        </ol>
      </DiagramContainer>
    </div>
  );
}