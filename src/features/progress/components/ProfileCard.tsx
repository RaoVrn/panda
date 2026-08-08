import { useMemo } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import { Avatar } from "@/features/user/components/Avatar";
import { allLessons } from "@/content/lessons";
import {
  useLevel,
  useProfileStats,
  useStreak,
} from "@/features/progress/hooks";
import { rankForXp } from "@/features/progress/ranks";
import { cn } from "@/lib/utils";

/**
 * Compact learner profile card. One quiet surface: avatar, name, rank, a
 * small level ring, XP, streak and a single motivational line. Detailed
 * statistics live on the dashboard's Activity row instead.
 */
export function ProfileCard({ className }: { className?: string }) {
  const { userId } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);
  const level = useLevel();
  const streak = useStreak();
  const stats = useProfileStats();
  const rank = rankForXp(level.xp);

  const name = profile?.name || "Learner";
  const total = allLessons().length;

  const message = useMemo(() => {
    if (stats.lessonsCompleted === 0) {
      return "Every journey starts with one commit.";
    }
    if (stats.lessonsCompleted >= total) {
      return "You finished every lesson. Incredible work.";
    }
    if (streak.current >= 3) {
      return `${streak.current} days in a row. Keep the streak alive.`;
    }
    return "One bamboo at a time.";
  }, [stats.lessonsCompleted, total, streak]);

  const ringSize = 46;
  const ringStroke = 4;
  const radius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-card p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar profile={profile} size={48} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{name}</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            <span aria-hidden="true">{rank.emoji}</span> {rank.title}
          </p>
        </div>
        <div className="relative ml-auto shrink-0" style={{ width: ringSize, height: ringSize }}>
          <svg
            width={ringSize}
            height={ringSize}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="var(--color-base-subtle)"
              strokeWidth={ringStroke}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - level.progress)}
              className="transition-[stroke-dashoffset] duration-700"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-text"
            aria-hidden="true"
          >
            Lv {level.level}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4 text-sm">
        <span className="font-semibold text-text">{level.xp} XP</span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <Flame className="size-4 text-warning" aria-hidden="true" />
          <span className="font-semibold text-text">{streak.current}</span>
          <span className="text-text-muted">
            day{streak.current === 1 ? "" : "s"} streak
          </span>
        </span>
      </div>

      <p className="mt-4 text-center text-xs italic leading-relaxed text-text-muted">
        {message}
      </p>
    </div>
  );
}
