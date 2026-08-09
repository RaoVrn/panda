import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  BookOpen,
  GitBranch,
  Globe,
  History,
  Layers,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { courseModules } from "../guideIndex";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  layers: Layers,
  history: History,
  "git-branch": GitBranch,
  globe: Globe,
  rocket: Rocket,
};

/**
 * The course roadmap, built from the real curriculum. Each module is a
 * clickable step that opens the actual module page. Connecting arrows make the
 * one-journey structure visible at a glance.
 */
export function GuideRoadmap({ className }: { className?: string }) {
  const modules = courseModules();
  const reduce = useReducedMotion();

  const summary = `Course journey: ${modules.map((m) => m.title).join(" → ")}`;

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="sr-only">{summary}</p>
      <ol className="flex flex-col gap-0">
        {modules.map((module, i) => {
          const Icon = MODULE_ICONS[module.icon ?? ""] ?? BookOpen;
          const content = (
            <Link
              to={`/module/${module.id}`}
              aria-label={`Open ${module.title}`}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-card px-4 py-3",
                "transition-colors hover:border-accent/40 hover:bg-card-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-hover">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-text">{module.title}</span>
                  <span className="shrink-0 rounded-md bg-base-subtle px-1.5 py-px text-[10px] font-medium text-text-muted">
                    {module.lessonCount} lessons
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-text-muted">
                  {module.description}
                </span>
              </span>
              <ArrowDown
                className="size-3.5 shrink-0 -rotate-90 text-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent-hover"
                aria-hidden="true"
              />
            </Link>
          );
          const withArrow = (
            <li key={module.id} className="flex flex-col">
              {reduce ? (
                <div>{content}</div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {content}
                </motion.div>
              )}
              {i < modules.length - 1 && (
                <div aria-hidden="true" className="flex h-7 items-center justify-center">
                  <span className="relative flex items-center justify-center">
                    <span className="absolute h-5 w-px bg-gradient-to-b from-accent/50 to-accent/10" />
                    <ArrowDown className="relative z-10 size-3.5 -translate-y-1 rounded-full bg-base text-accent-hover" strokeWidth={2.5} />
                  </span>
                </div>
              )}
            </li>
          );
          return withArrow;
        })}
      </ol>
    </div>
  );
}
