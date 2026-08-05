import { Link } from "react-router-dom";
import { Calendar, Settings2 } from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import { Avatar } from "@/features/user/components/Avatar";
import { useLevel, useProfileStats, useStreak, useUnlockedAchievements } from "@/features/progress/hooks";
import { ACHIEVEMENTS } from "@/features/progress/achievements";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-base-subtle/40 px-4 py-3 text-center">
      <p className="text-xl font-semibold text-text">{value}</p>
      <p className="mt-0.5 text-[11px] text-text-muted">{label}</p>
    </div>
  );
}

export function ProfilePage() {
  const { userId, configured } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);

  const level = useLevel();
  const stats = useProfileStats();
  const streak = useStreak();
  const badges = useUnlockedAchievements();

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

  const hasProgress = stats.lessonsCompleted > 0 || level.xp > 0;

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <PageHeader
        title="Profile"
        subtitle="Your learning identity."
        back={{ to: "/course", label: "Dashboard" }}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar profile={profile} size={88} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            {profile?.name || "Learner"}
          </h1>
          {profile?.username && (
            <p className="text-sm text-text-muted">@{profile.username}</p>
          )}
          {profile?.email && (
            <p className="mt-0.5 text-sm text-text-muted">{profile.email}</p>
          )}
          {profile?.joinedAt && (
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-text-muted">
              <Calendar className="size-3" aria-hidden="true" />
              Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, {
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

      <Card id="stats" className="mt-8 scroll-mt-24 p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
          Learning stats
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Level" value={`${level.level}`} />
          <Stat label="Total XP" value={`${level.xp}`} />
          <Stat label="Lessons" value={`${stats.lessonsCompleted}`} />
          <Stat label="Streak" value={`${streak.current}`} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Badges" value={`${badges.length}/${ACHIEVEMENTS.length}`} />
          <Stat
            label="Quiz accuracy"
            value={stats.quizAccuracy === null ? "—" : `${stats.quizAccuracy}%`}
          />
          <Stat label="AI questions" value={`${stats.aiQuestionsAsked}`} />
          <Stat label="Practices" value={`${stats.practiceCount}`} />
        </div>

        {!hasProgress && (
          <p className="mt-5 rounded-xl border border-border-subtle bg-base-subtle/40 px-4 py-3 text-sm leading-relaxed text-text-secondary">
            No stats yet. Complete your first lesson to start earning XP and
            unlock your first badge.
          </p>
        )}
      </Card>
    </div>
  );
}
