import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ACHIEVEMENTS } from "../achievements";
import { useAchievementState } from "../components/useAchievementState";
import { AchievementCard } from "../components/AchievementCard";
import { AchievementDetailModal } from "../components/AchievementDetailModal";
import { cn } from "@/lib/utils";

type Filter = "all" | "earned" | "locked";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "earned", label: "Earned" },
  { id: "locked", label: "Locked" },
];

function Section({ title, items, ...handlers }: {
  title: string;
  items: typeof ACHIEVEMENTS;
  unlocked: Record<string, number>;
  isEarned: (id: string) => boolean;
  earnedAt: (id: string) => number | undefined;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="text-base font-semibold tracking-tight text-text">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            earned={handlers.isEarned(achievement.id)}
            earnedAt={handlers.earnedAt(achievement.id)}
            onClick={() => handlers.onSelect(achievement.id)}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * The full achievements collection. Shows the learner's real unlock state, a
 * calm summary, and every achievement grouped by status (earned / locked) with
 * an optional All / Earned / Locked filter. Clean and understated.
 */
export function AchievementsPage() {
  const { unlocked, ctx, isEarned, earnedAt, earnedCount, total } =
    useAchievementState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep link from a notification: ?achievement=<id> opens that achievement.
  useEffect(() => {
    const id = searchParams.get("achievement");
    if (id && ACHIEVEMENTS.some((a) => a.id === id)) {
      setSelectedId(id);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const pct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;
  const earned = ACHIEVEMENTS.filter((a) => isEarned(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !isEarned(a.id));
  const selected = ACHIEVEMENTS.find((a) => a.id === selectedId);

  const orderedEarned = [...earned].sort(
    (a, b) => (earnedAt(b.id) ?? 0) - (earnedAt(a.id) ?? 0),
  );

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      <PageHeader
        title="Achievements"
        subtitle="Track the milestones you've earned throughout your Git journey."
        back={{ to: "/dashboard", label: "Dashboard" }}
      />

      {/* Summary */}
      <div className="rounded-xl border border-border-subtle bg-card px-5 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium text-text">
            {earnedCount} of {total} earned
          </p>
          <p className="text-sm text-text-muted">{pct}%</p>
        </div>
        <div
          role="progressbar"
          aria-label="Achievements progress"
          aria-valuenow={earnedCount}
          aria-valuemin={0}
          aria-valuemax={total}
          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-base-subtle"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Filter */}
      <div
        role="group"
        aria-label="Filter achievements"
        className="mt-6 inline-flex rounded-lg border border-border-subtle bg-base-subtle/50 p-0.5"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "bg-card text-text shadow-sm"
                : "text-text-muted hover:text-text",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-6 flex flex-col gap-8">
        {(filter === "all" || filter === "earned") && (
          <Section
            title="Earned"
            items={orderedEarned}
            unlocked={unlocked}
            isEarned={isEarned}
            earnedAt={earnedAt}
            onSelect={setSelectedId}
          />
        )}
        {(filter === "all" || filter === "locked") && (
          <Section
            title="Locked"
            items={locked}
            unlocked={unlocked}
            isEarned={isEarned}
            earnedAt={earnedAt}
            onSelect={setSelectedId}
          />
        )}
      </div>

      <AchievementDetailModal
        achievement={selected}
        ctx={ctx}
        unlocked={unlocked}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
