import { Check, Lock, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  achievementProgress,
  type AchievementContext,
  type AchievementDefinition,
} from "../achievements";
import { cn } from "@/lib/utils";

function formatEarnedDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Clean, compact detail view for a single achievement. Centered on the
 * viewport (the underlying Modal portals to <body>), shows the icon, name,
 * description, status and either the earned date or the learner's current
 * progress toward unlocking it.
 */
export function AchievementDetailModal({
  achievement,
  ctx,
  unlocked,
  onClose,
}: {
  achievement: AchievementDefinition | undefined;
  ctx: AchievementContext;
  unlocked: Record<string, number>;
  onClose: () => void;
}) {
  const earned = achievement ? Boolean(unlocked[achievement.id]) : false;
  const earnedAt = achievement ? unlocked[achievement.id] : undefined;
  const progress = achievement ? achievementProgress(achievement, ctx) : { current: 0, max: 0 };
  const pct = progress.max > 0 ? Math.round((progress.current / progress.max) * 100) : 0;

  return (
    <Modal
      open={Boolean(achievement)}
      onClose={onClose}
      labelledBy="achievement-detail-title"
      className="max-w-sm"
    >
      {achievement && (
        <div className="relative text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-0 top-0 flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-base-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <span
            className={cn(
              "mx-auto flex size-14 items-center justify-center rounded-2xl",
              earned ? "bg-accent-soft text-accent-hover" : "bg-base-subtle text-text-muted",
            )}
            aria-hidden="true"
          >
            <achievement.icon className="size-7" />
          </span>

          <h2
            id="achievement-detail-title"
            className="mt-4 text-lg font-semibold tracking-tight text-text"
          >
            {achievement.title}
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-text-secondary">
            {earned ? achievement.description : achievement.requirement}
          </p>

          <div className="mt-5 border-t border-border-subtle pt-4">
            <p
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                earned ? "text-accent-hover" : "text-text-muted",
              )}
            >
              {earned ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Achievement unlocked
                </>
              ) : (
                <>
                  <Lock className="size-3.5" aria-hidden="true" />
                  Locked
                </>
              )}
            </p>

            {earned ? (
              <p className="mt-1.5 text-xs text-text-muted">
                Earned {earnedAt ? formatEarnedDate(earnedAt) : "—"}
              </p>
            ) : (
              <>
                <div className="mx-auto mt-3 max-w-[16rem]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-text-secondary">
                      {progress.current} of {progress.max}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={progress.current}
                    aria-valuemin={0}
                    aria-valuemax={progress.max}
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-base-subtle"
                  >
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  Keep learning to unlock this achievement.
                </p>
              </>
            )}
          </div>

          <Button variant="secondary" onClick={onClose} className="mt-6 w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
