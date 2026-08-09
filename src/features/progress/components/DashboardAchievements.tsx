import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAchievementState } from "./useAchievementState";
import { AchievementCard } from "./AchievementCard";
import { AchievementDetailModal } from "./AchievementDetailModal";
import { ACHIEVEMENTS } from "../achievements";

const PREVIEW_LIMIT = 4;

/**
 * The dashboard achievements showcase. Shows only the learner's most recently
 * earned achievements (up to four), with a clear path to the full collection.
 * No locked badges, no placeholders, no game-like clutter.
 */
export function DashboardAchievements() {
  const { unlocked, ctx, isEarned, earnedAt, earned, earnedCount, total } =
    useAchievementState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const recent = [...earned]
    .sort((a, b) => (earnedAt(b.id) ?? 0) - (earnedAt(a.id) ?? 0))
    .slice(0, PREVIEW_LIMIT);
  const selected = ACHIEVEMENTS.find((a) => a.id === selectedId);

  return (
    <section id="achievements" aria-labelledby="achievements-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="achievements-title"
            className="text-lg font-semibold tracking-tight text-text"
          >
            Achievements
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Your Git milestones, earned as you progress.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-muted">
            {earnedCount} of {total} earned
          </span>
          <Link
            to="/achievements"
            className="inline-flex items-center gap-1 font-medium text-accent-hover transition-colors hover:text-accent"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border-subtle bg-card p-6 text-center">
          <p className="text-sm text-text-secondary">
            No achievements yet. Finish your first lesson to start collecting
            milestones.
          </p>
          <Link
            to="/achievements"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent-hover hover:text-accent"
          >
            See all achievements
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {recent.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              earned={isEarned(achievement.id)}
              earnedAt={earnedAt(achievement.id)}
              compact
              onClick={() => setSelectedId(achievement.id)}
            />
          ))}
        </div>
      )}

      <AchievementDetailModal
        achievement={selected}
        ctx={ctx}
        unlocked={unlocked}
        onClose={() => setSelectedId(null)}
      />
    </section>
  );
}
