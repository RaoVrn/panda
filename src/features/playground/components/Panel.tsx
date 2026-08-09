import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PlaygroundPanelProps {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  animate?: boolean;
}

/**
 * The shared shell for every playground card  -  soft, minimal, GPT-style.
 * Elevation and background contrast do the separating; borders are whisper-thin
 * and used only where they improve readability.
 */
export function PlaygroundPanel({
  icon,
  title,
  right,
  children,
  className,
  bodyClassName,
  animate = false,
}: PlaygroundPanelProps) {
  const shell = (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.03] bg-card/95 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_10px_rgba(0,0,0,0.10)]",
        className,
      )}
    >
      <header className="flex h-11 items-center gap-2.5 border-b border-white/[0.03] bg-white/[0.01] px-4">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-accent/8 text-accent-hover">
          {icon}
        </span>
        <h3 className="truncate text-[13px] font-medium text-text">{title}</h3>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </header>
      <div className={cn(bodyClassName ?? "p-4")}>{children}</div>
    </section>
  );

  if (!animate) return shell;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {shell}
    </motion.div>
  );
}
