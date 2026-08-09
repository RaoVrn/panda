import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Settings2 } from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import { Avatar } from "@/features/user/components/Avatar";
import { useLevel, useProfileStats, useStreak } from "@/features/progress/hooks";
import { useProgressStore } from "@/features/progress/progressStore";
import { modules } from "@/content/curriculum";
import { allLessons, moduleLessons } from "@/content/lessons";
import { percentComplete } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/features/progress/achievements";
import { useAchievementState } from "@/features/progress/components/useAchievementState";
import { AchievementCard } from "@/features/progress/components/AchievementCard";
import { AchievementDetailModal } from "@/features/progress/components/AchievementDetailModal";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Learner profile: who you are, a concise learning summary, course overview
 * and recent achievements. Editing lives on the account page; analytics stay
 * minimal and meaningful (no overwhelming metric wall).
 */
export function ProfilePage() {
  const { userId, configured } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);
  const level = useLevel();
  const stats = useProfileStats();
  const streak = useStreak();
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const { unlocked, ctx, isEarned, earnedAt, earnedCount, total } = useAchievementState();
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const earned = ACHIEVEMENTS.filter((a) => isEarned(a.id))
    .sort((a, b) => (earnedAt(b.id) ?? 0) - (earnedAt(a.id) ?? 0));
  const selected = ACHIEVEMENTS.find((a) => a.id === selectedAchievement);

  if (!configured || !userId) {
    return (
      <div className="mx-auto w-full max-w-2xl py-12 text-center text-text-secondary">
        <p>Sign in to see your profile.</p>
        <Link
          to="/login"
          className="mt-2 inline-block font-medium text-accent-hover hover:text-accent"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const totalLessons = allLessons().length;
  const coursePct = percentComplete(completedLessonIds.length, totalLessons);

  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <PageHeader
        title="Profile"
        subtitle="Your learning identity."
        back={{ to: "/dashboard", label: "Dashboard" }}
      />

      {/* Header */}
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar profile={profile} size={88} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            {profile?.name || "Learner"}
          </h1>
          {profile?.username && (
            <p className="mt-0.5 text-sm text-text-muted">@{profile.username}</p>
          )}
          {profile?.joinedAt && (
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-text-muted">
              <Calendar className="size-3" aria-hidden="true" />
              Joined{" "}
              {new Date(profile.joinedAt).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <Link to="/account">
          <Button variant="secondary" leftIcon={<Settings2 className="size-4" aria-hidden="true" />}>
            Edit profile
          </Button>
        </Link>
      </div>

      {/* Learning summary */}
      <section aria-label="Learning summary" className="mt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryStat label="Level" value={`${level.level}`} />
          <SummaryStat label="XP" value={`${level.xp}`} />
          <SummaryStat label="Streak" value={`${streak.current} day${streak.current === 1 ? "" : "s"}`} />
          <SummaryStat label="Lessons" value={`${stats.lessonsCompleted}`} />
          <SummaryStat label="Achievements" value={`${earnedCount}/${total}`} />
        </div>
      </section>

      {/* Learning overview */}
      <section aria-labelledby="profile-overview-title" className="mt-10">
        <h2 id="profile-overview-title" className="text-lg font-semibold tracking-tight text-text">
          Learning overview
        </h2>

        <div className="mt-4 rounded-2xl border border-border-subtle bg-card p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium text-text">Course progress</p>
            <p className="text-sm text-text-muted">
              <span className="font-semibold text-text">{completedLessonIds.length}</span> of{" "}
              {totalLessons} lessons
              <span aria-hidden="true"> · </span>
              <span className="font-medium text-accent-hover">{coursePct}%</span>
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuenow={coursePct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-subtle"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${coursePct}%` }}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {modules.map((module) => {
              const list = moduleLessons(module.id);
              const done = list.filter((l) => completedLessonIds.includes(l.id)).length;
              const pct = percentComplete(done, list.length);
              return (
                <div key={module.id} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-text-secondary">
                    {module.title}
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-base-subtle">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-text-muted">
                    {done}/{list.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent achievements */}
      <section aria-labelledby="profile-achievements-title" className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="profile-achievements-title" className="text-lg font-semibold tracking-tight text-text">
            Achievements
          </h2>
          <Link
            to="/achievements"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-hover transition-colors hover:text-accent"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {earned.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border-subtle bg-card p-6 text-center text-sm text-text-secondary">
            No achievements yet. Finish your first lesson to start collecting
            milestones.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {earned.slice(0, 4).map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned
                earnedAt={earnedAt(achievement.id)}
                onClick={() => setSelectedAchievement(achievement.id)}
              />
            ))}
          </div>
        )}
      </section>

      <AchievementDetailModal
        achievement={selected}
        ctx={ctx}
        unlocked={unlocked}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-card px-4 py-3.5 text-center">
      <p className="text-xl font-semibold text-text">{value}</p>
      <p className="mt-0.5 text-[11px] text-text-muted">{label}</p>
    </div>
  );
}
