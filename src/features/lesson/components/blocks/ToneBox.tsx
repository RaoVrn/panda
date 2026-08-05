import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalloutTone } from "@/content/schema";

interface ToneStyle {
  border: string;
  bg: string;
  icon: LucideIcon;
  iconColor: string;
}

const tones: Record<CalloutTone, ToneStyle> = {
  info: {
    border: "border-accent/30",
    bg: "bg-accent-soft/40",
    icon: Info,
    iconColor: "text-accent-hover",
  },
  success: {
    border: "border-accent/30",
    bg: "bg-accent-soft/40",
    icon: CheckCircle2,
    iconColor: "text-accent-hover",
  },
  warning: {
    border: "border-warning/30",
    bg: "bg-warning-soft/40",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  tip: {
    border: "border-warning/30",
    bg: "bg-warning-soft/40",
    icon: Lightbulb,
    iconColor: "text-warning",
  },
};

export interface ToneBoxProps {
  tone: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared toned panel used by Callout, Tip and Warning blocks so the visual
 * language stays identical across the engine.
 */
export function ToneBox({ tone, title, children, className }: ToneBoxProps) {
  const style = tones[tone];
  const Icon = style.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border p-4",
        style.border,
        style.bg,
        className,
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-base/40">
        <Icon className={cn("size-4", style.iconColor)} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold text-text">{title}</p>}
        <div
          className={cn(
            "text-sm leading-relaxed text-text-secondary",
            title && "mt-0.5",
          )}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}