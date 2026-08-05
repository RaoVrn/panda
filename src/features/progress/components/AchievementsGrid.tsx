import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import { ACHIEVEMENTS } from "../achievements";
import type { AchievementDefinition } from "../achievements";
import { useProgressStore } from "../progressStore";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

function formatUnlockDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * All achievements as a grid. Every card opens a details modal so nothing
 * feels like a static placeholder. Unlocked cards glow; locked ones stay
 * dimmed with a lock and a hint.
 */
export function AchievementsGrid({ className }: { className?: string }) {
  const achievements = useProgressStore((state) => state.achievements);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = ACHIEVEMENTS.find((a) => a.id === selectedId);
  const selectedUnlockedAt = selected ? achievements[selected.id] : undefined;

  return (
    <>
      <div className={cn("grid gap-2.5 sm:grid-cols-2", className)}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = Boolean(achievements[achievement.id]);
          return (
            <motion.button
              key={achievement.id}
              type="button"
              onClick={() => setSelectedId(achievement.id)}
              aria-haspopup="dialog"
              className={cn(
                "relative flex items-start gap-2.5 overflow-hidden rounded-xl border px-3.5 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                unlocked
                  ? "border-accent/30 bg-accent-soft/40"
                  : "border-border-subtle bg-base-subtle/40 opacity-70",
                "transition-transform duration-150 hover:-translate-y-0.5",
              )}
            >
              {unlocked && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-6 size-16 rounded-full bg-accent/20 blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl border text-xl",
                  unlocked
                    ? "border-accent/40 bg-card"
                    : "border-border-subtle bg-card grayscale",
                )}
                aria-hidden="true"
              >
                {achievement.emoji}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-semibold",
                    unlocked ? "text-text" : "text-text-secondary",
                  )}
                >
                  {achievement.title}
                  {!unlocked && (
                    <Lock className="size-3 text-text-muted" aria-hidden="true" />
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-text-muted">
                  {achievement.description}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <BadgeModal
        achievement={selected}
        unlockedAt={selectedUnlockedAt}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

function BadgeModal({
  achievement,
  unlockedAt,
  onClose,
}: {
  achievement: AchievementDefinition | undefined;
  unlockedAt?: number;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(achievement)}
      onClose={onClose}
      labelledBy="badge-modal-title"
    >
      {achievement && (
        <div className="text-center">
          <span className="text-5xl" aria-hidden="true">
            {achievement.emoji}
          </span>
          <h2
            id="badge-modal-title"
            className="mt-4 text-xl font-semibold tracking-tight text-text"
          >
            {achievement.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {achievement.description}
          </p>

          {unlockedAt !== undefined ? (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-hover">
              <Check className="size-3.5" aria-hidden="true" />
              Unlocked on {formatUnlockDate(unlockedAt)}
            </p>
          ) : (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-base-subtle px-3 py-1.5 text-xs text-text-muted">
              <Lock className="size-3.5" aria-hidden="true" />
              Still locked. Keep learning to earn this badge.
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-base-subtle px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
          >
            <X className="size-4" aria-hidden="true" />
            Close
          </button>
        </div>
      )}
    </Modal>
  );
}
