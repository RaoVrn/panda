import type { ReactNode } from "react";
import {
  CheckCircle2,
  Flame,
  MessageSquare,
  Settings,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ACHIEVEMENTS } from "../achievements";
import { useLevel, useProfileStats, useStreak, useUnlockedAchievements } from "../hooks";
import { rankForXp } from "../ranks";
import { cn } from "@/lib/utils";

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-base-subtle/40 px-3 py-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-base-subtle text-text-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text">{value}</p>
        <p className="truncate text-[11px] text-text-muted">{label}</p>
      </div>
    </div>
  );
}

/**
 * Lightweight learner profile card. Shows rank, level, XP, streak and the
 * key stats. Everything is local for now; when authentication lands this
 * becomes the signed-in user's summary.
 */
export function ProfileCard({ className }: { className?: string }) {
  const level = useLevel();
  const stats = useProfileStats();
  const streak = useStreak();
  const unlocked = useUnlockedAchievements();
  const achievementCount = unlocked.length;
  const rank = rankForXp(level.xp);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border-subtle bg-base-subtle/50 px-4 py-3">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-2xl"
          aria-hidden="true"
        >
          🐼
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-text">
            <span aria-hidden="true">{rank.emoji}</span>
            {rank.title}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Level {level.level} · {level.xp} XP · {streak.current} day
            {streak.current === 1 ? "" : "s"} streak
          </p>
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-hover">
            <Trophy className="size-3" aria-hidden="true" />
            {achievementCount}/{ACHIEVEMENTS.length}
          </span>
          <Link
            to="/settings"
            className="flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle hover:text-text"
            aria-label="Open settings"
            title="Settings"
          >
            <Settings className="size-3.5" aria-hidden="true" />
          </Link>
        </span>
      </div>

      <div className="grid gap-2 p-4 sm:grid-cols-2">
        <Stat
          icon={<Flame className="size-3.5" aria-hidden="true" />}
          label="Current streak"
          value={`${streak.current} day${streak.current === 1 ? "" : "s"}`}
        />
        <Stat
          icon={<CheckCircle2 className="size-3.5" aria-hidden="true" />}
          label="Lessons completed"
          value={`${stats.lessonsCompleted}`}
        />
        <Stat
          icon={<Target className="size-3.5" aria-hidden="true" />}
          label="Quiz accuracy"
          value={stats.quizAccuracy === null ? "Not yet" : `${stats.quizAccuracy}%`}
        />
        <Stat
          icon={<Zap className="size-3.5" aria-hidden="true" />}
          label="Total XP"
          value={`${level.xp}`}
        />
        <Stat
          icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
          label="AI questions asked"
          value={`${stats.aiQuestionsAsked}`}
        />
        <Stat
          icon={<Trophy className="size-3.5" aria-hidden="true" />}
          label="Badges earned"
          value={`${achievementCount}`}
        />
      </div>
    </div>
  );
}
