import { TrendingUp, Sparkles, Lightbulb } from "lucide-react";
import { GuideCard } from "./GuideCard";

/**
 * A visual progress card showing how progress builds lesson by lesson, plus
 * the three small companion metrics (XP, streak, achievements). Illustrative,
 * matching how the real Dashboard presents progress.
 */
export function ProgressCard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border-subtle bg-card p-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-semibold text-text">Git Fundamentals</p>
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-text">5</span> / 9 lessons
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Git Fundamentals progress"
          aria-valuenow={55}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-2 overflow-hidden rounded-full bg-base-subtle"
        >
          <div className="h-full w-[55%] rounded-full bg-accent" />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
          Each lesson you finish moves this forward. Finish a module and the next one unlocks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <GuideCard icon={TrendingUp} title="XP">Tracks your learning activity.</GuideCard>
        <GuideCard icon={Sparkles} title="Streak">Shows your consecutive learning days.</GuideCard>
        <GuideCard icon={Lightbulb} title="Achievements">Marks meaningful learning milestones.</GuideCard>
      </div>
    </div>
  );
}
