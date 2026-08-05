import { useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  GitBranch,
  Lock,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { JSX } from "react";
import { isModuleUnlocked, moduleOfLesson, modules } from "@/content/curriculum";
import { allLessons, moduleLessons } from "@/content/lessons";
import { estimateMinutes } from "@/content/duration";
import { cn, percentComplete, formatDuration } from "@/lib/utils";
import { useProgressStore } from "@/features/progress/progressStore";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import {
  useLevel,
  useStreak,
  useTodayXp,
} from "@/features/progress/hooks";
import { currentLesson } from "@/features/progress/lessonProgress";
import { lessonXp } from "@/features/progress/xp";
import { rankForXp, nextRank } from "@/features/progress/ranks";
import { AchievementsGrid } from "@/features/progress/components/AchievementsGrid";
import { ProfileCard } from "@/features/progress/components/ProfileCard";
import { LearningWorkspace } from "@/features/learning/layout/LearningWorkspace";
import { LearningCanvas } from "@/features/learning/layout/LearningCanvas";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const moduleIcons: Record<string, JSX.Element> = {
  sparkles: <Sparkles className="size-4 text-accent-hover" aria-hidden="true" />,
  layers: <BookOpen className="size-4 text-accent-hover" aria-hidden="true" />,
  "git-branch": <GitBranch className="size-4 text-accent-hover" aria-hidden="true" />,
  globe: <Trophy className="size-4 text-accent-hover" aria-hidden="true" />,
  rocket: <Target className="size-4 text-accent-hover" aria-hidden="true" />,
};

export function CoursePage() {
  const { completedLessonIds, startedLessonIds } = useProgressStore();
  const level = useLevel();
  const streak = useStreak();
  const todayXp = useTodayXp();

  const { userId } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);

  const lessons = allLessons();
  const pct = percentComplete(completedLessonIds.length, lessons.length);
  const next = useMemo(
    () => currentLesson({ completedLessonIds, startedLessonIds }),
    [completedLessonIds, startedLessonIds],
  );

  const rank = rankForXp(level.xp);
  const upcoming = nextRank(level.xp);
  const streakDays = streak.current;

  // Contextual hero: time-of-day greeting + a progress-aware message.
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = (profile?.name || "").trim().split(/\s+/)[0];
  const heroTitle = firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;

  const heroMessage = useMemo(() => {
    if (pct === 0) {
      return "Ready to start your Git journey? Your first lesson is waiting.";
    }
    if (completedLessonIds.length === lessons.length) {
      return "You finished every lesson. Amazing work — take a moment to enjoy it.";
    }
    const module = next ? moduleOfLesson(next.id) : undefined;
    if (module) {
      const remaining = moduleLessons(module.id).filter(
        (l) => !completedLessonIds.includes(l.id),
      ).length;
      if (remaining > 0) {
        return `Only ${remaining} lesson${remaining === 1 ? "" : "s"} left in ${
          module.title
        }. ${rank.title} is getting closer.`;
      }
    }
    return "Continue where you left off.";
  }, [pct, completedLessonIds, lessons.length, next, rank.title]);

  // Estimated minutes remaining: the unfinished lessons ahead.
  const estimatedRemainingMin = useMemo(
    () =>
      lessons
        .filter((l) => !completedLessonIds.includes(l.id))
        .reduce((sum, l) => sum + estimateMinutes(l), 0),
    [lessons, completedLessonIds],
  );

  const milestones = useMemo(() => {
    const rows: { icon: JSX.Element; label: string; value: string }[] = [
      {
        icon: <BookOpen className="size-3.5" aria-hidden="true" />,
        label: "Current lesson",
        value: next ? next.title : "Course complete",
      },
      {
        icon: <Trophy className="size-3.5" aria-hidden="true" />,
        label: upcoming ? `Next rank: ${upcoming.title}` : "Rank",
        value: `${rank.emoji} ${rank.title}`,
      },
      {
        icon: <Clock className="size-3.5" aria-hidden="true" />,
        label: "Estimated time to finish",
        value: formatDuration(estimatedRemainingMin),
      },
      {
        icon: <Flame className="size-3.5" aria-hidden="true" />,
        label: "Daily streak",
        value: `${streakDays} day${streakDays === 1 ? "" : "s"}`,
      },
    ];
    return rows;
  }, [next, rank, upcoming, estimatedRemainingMin, streakDays]);

  return (
    <LearningWorkspace>
      <LearningCanvas>
        <div className="flex flex-col gap-6">
          {/* Hero */}
          <Card className="overflow-hidden p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="flex items-center gap-2 text-sm font-medium text-accent-hover">
                  <span aria-hidden="true">{rank.emoji}</span>
                  {rank.title}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {heroTitle}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {heroMessage}
                </p>

                <div className="mt-5">
                  {/* One clear CTA */}
                  {next ? (
                    <Link to={`/lesson/${next.slug}`} className="inline-block">
                      <Button
                        rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
                      >
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/lesson/${lessons[0]?.slug ?? "/course"}`} className="inline-block">
                      <Button>Review a lesson</Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Level + XP + daily goal */}
              <div className="w-full max-w-xs shrink-0 rounded-2xl border border-border-subtle bg-base-subtle/40 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-text">
                    Level {level.level}
                  </span>
                  <span className="text-sm font-medium text-accent-hover">
                    {level.xp} XP
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Progress to next level"
                  aria-valuenow={Math.round(level.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-3 h-2 overflow-hidden rounded-full bg-base-subtle"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-500"
                    style={{ width: `${level.progress * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  {level.remaining} XP to level {level.level + 1}
                </p>

                <div className="mt-3 border-t border-border-subtle pt-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <Target className="size-3.5 text-accent-hover" aria-hidden="true" />
                    Today's goal
                  </p>
                  {next ? (
                    <Link
                      to={`/lesson/${next.slug}`}
                      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary transition-colors group-hover:text-text">
                        Finish “{next.title}” to earn{" "}
                        {lessonXp(next)} XP and keep your streak alive.
                      </p>
                    </Link>
                  ) : (
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      You did it. Take a well-earned break.
                    </p>
                  )}
                  <p className="mt-2 text-xs font-medium text-accent-hover">
                    {todayXp} XP earned today
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="mt-6 grid gap-3 border-t border-border-subtle pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {milestones.map((m) => (
                <div key={m.label} className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-base-subtle text-text-muted">
                    {m.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{m.value}</p>
                    <p className="truncate text-[11px] text-text-muted">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="flex flex-col gap-6">
              {/* Course journey */}
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
                    Your journey
                  </h2>
                  <span className="text-sm font-medium text-accent-hover">{pct}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-3 h-2 overflow-hidden rounded-full bg-base-subtle"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-xs text-text-muted">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {completedLessonIds.length} of {lessons.length} lessons completed
                </p>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {modules.map((m) => {
                    const moduleLessons_ = moduleLessons(m.id);
                    const firstLesson = moduleLessons_[0];
                    const done = moduleLessons_.filter((l) =>
                      completedLessonIds.includes(l.id),
                    ).length;
                    const total = moduleLessons_.length;
                    const remaining = total - done;
                    const modulePct = percentComplete(done, total);
                    const estMin = moduleLessons_
                      .filter((l) => !completedLessonIds.includes(l.id))
                      .reduce((sum, l) => sum + estimateMinutes(l), 0);
                    const locked =
                      moduleLessons_.length > 0 &&
                      !isModuleUnlocked(m.id, completedLessonIds);
                    const clickable = firstLesson && !locked;

                    const inner = (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-base-subtle">
                            {locked ? (
                              <Lock className="size-3.5 text-text-muted" aria-hidden="true" />
                            ) : (
                              (moduleIcons[m.icon ?? ""] ?? (
                                <BookOpen
                                  className="size-3.5 text-accent-hover"
                                  aria-hidden="true"
                                />
                              ))
                            )}
                          </span>
                          <p className="truncate text-sm font-medium text-text">
                            {m.title}
                          </p>
                          <span className="ml-auto text-[10px] tabular-nums text-text-muted">
                            {total > 0 ? `${done}/${total}` : "—"}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-base-subtle">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${modulePct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-text-muted">
                          {total === 0
                            ? "More lessons coming soon"
                            : locked
                              ? "Finish the previous section to unlock"
                              : done === total
                                ? `${formatDuration(estMin || 1)} saved · section complete`
                                : `${remaining} lesson${remaining === 1 ? "" : "s"} · ${formatDuration(estMin)}`}
                        </p>
                      </>
                    );

                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex flex-col gap-2 rounded-xl border border-border-subtle bg-base-subtle px-3.5 py-3",
                          clickable &&
                            "transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-base-subtle",
                        )}
                      >
                        {clickable ? (
                          <Link
                            to={`/lesson/${firstLesson!.slug}`}
                            className="flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            aria-label={`Open ${m.title}: ${firstLesson!.title}`}
                          >
                            {inner}
                          </Link>
                        ) : (
                          inner
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Badges */}
              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-text-secondary">
                  <Sparkles className="size-4 text-accent-hover" aria-hidden="true" />
                  Your Panda Badges
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                  Complete lessons, ace quizzes and ask Panda AI to earn your first badge.
                </p>
                <AchievementsGrid className="mt-3" />
              </Card>
            </div>

            {/* Profile */}
            <div className="flex flex-col gap-6">
              <ProfileCard />
            </div>
          </div>
        </div>
      </LearningCanvas>
    </LearningWorkspace>
  );
}
