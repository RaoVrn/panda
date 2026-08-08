import { Lock } from "lucide-react";
import type { AchievementDefinition } from "../achievements";
import { cn } from "@/lib/utils";

function formatEarnedDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * A compact, premium achievement card. Earned cards get a subtle teal accent;
 * locked cards stay muted with a small lock indicator. No glows, no giant
 * badges — clean and minimal.
 */
export function AchievementCard({
  achievement,
  earned,
  earnedAt,
  compact = false,
  onClick,
}: {
  achievement: AchievementDefinition;
  earned: boolean;
  earnedAt?: number;
  compact?: boolean;
  onClick: () => void;
}) {
  const Icon = achievement.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border border-border-subtle bg-card p-4 text-left",
        "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        earned ? "hover:border-border" : "opacity-75 hover:opacity-90",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          compact ? "size-9" : "size-10",
          earned
            ? "bg-accent-soft text-accent-hover"
            : "bg-base-subtle text-text-muted",
        )}
      >
        <Icon className={compact ? "size-4.5" : "size-5"} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            earned ? "text-text" : "text-text-secondary",
          )}
        >
          {achievement.title}
          {!earned && (
            <Lock className="size-3 text-text-muted" aria-hidden="true" />
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-text-muted">
          {earned ? achievement.description : achievement.requirement}
        </span>
        {earned && earnedAt ? (
          <span className="mt-1 block text-[11px] text-text-muted/80">
            Earned {formatEarnedDate(earnedAt)}
          </span>
        ) : (
          <span className="mt-1 block text-[11px] text-text-muted/70">Locked</span>
        )}
      </span>
    </button>
  );
}
