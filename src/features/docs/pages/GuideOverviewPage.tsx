import { ArrowRight, Eye, GitBranch, MessageSquareText, Play, TrendingUp } from "lucide-react";
import { GuideLayout } from "@/features/docs/components/GuideLayout";
import { GuidePageHeader } from "@/features/docs/components/GuidePageHeader";
import { GuideCard } from "@/features/docs/components/GuideCard";
import { GuideRoadmap } from "@/features/docs/components/GuideRoadmap";
import { GuideNavLinks } from "@/features/docs/components/GuideNavLinks";
import { JourneyTimeline } from "@/features/docs/components/JourneyTimeline";
import { DocCta } from "@/features/docs/components/DocCta";
import { Link } from "react-router-dom";

/**
 * Guide home (/docs). A short product introduction: what makes Panda
 * different, the five-step learning experience, your Git journey, and a
 * three-step quick start. Nothing is explained in depth here; each topic has
 * its own page.
 */
export function GuideOverviewPage() {
  return (
    <GuideLayout active="overview">
      <article className="mx-auto w-full max-w-3xl pb-10">
        <GuidePageHeader title="How Panda Works" subtitle="Learn Git by understanding what actually happens." />

        <div className="mt-10 flex flex-col gap-12">
          {/* Hero */}
          <section aria-labelledby="intro">
            <p className="max-w-2xl text-[15px] leading-relaxed text-text-secondary">
              Panda is a hands-on Git learning platform. You learn by seeing what a command
              does, trying it yourself, and getting help when something doesn't click. No
              memorizing command lists.
            </p>
            <div className="mt-5">
              <DocCta label="Start Learning" to="/dashboard" auth="progress" />
            </div>
          </section>

          {/* What makes Panda different */}
          <section aria-labelledby="different">
            <h2 id="different" className="text-lg font-semibold tracking-tight text-text">
              What makes Panda different
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <GuideCard icon={Eye} title="See it">Understand Git visually, not just from text.</GuideCard>
              <GuideCard icon={Play} title="Do it">Practice commands yourself in a safe playground.</GuideCard>
              <GuideCard icon={MessageSquareText} title="Ask it">Get help from Panda AI the moment you're stuck.</GuideCard>
              <GuideCard icon={TrendingUp} title="Track it">See your progress as you learn.</GuideCard>
            </div>
          </section>

          {/* Learning experience */}
          <section aria-labelledby="experience">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="experience" className="text-lg font-semibold tracking-tight text-text">
                The Panda learning experience
              </h2>
              <p className="text-[13px] text-text-muted">One idea at a time</p>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Every topic follows the same gentle rhythm. There's no wrong way to move
              through it.
            </p>
            <div className="mx-auto mt-6 max-w-md">
              <JourneyTimeline />
            </div>
          </section>

          {/* Git journey */}
          <section aria-labelledby="journey">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="journey" className="text-lg font-semibold tracking-tight text-text">
                Your Git journey
              </h2>
              <p className="flex items-center gap-1 text-[13px] text-text-muted">
                <GitBranch className="size-3.5" aria-hidden="true" />
                Follow Panda's structured course
              </p>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Tap any module to open it. The course builds from first steps to advanced Git.
            </p>
            <div className="mx-auto mt-6 max-w-md">
              <GuideRoadmap />
            </div>
          </section>

          {/* Quick start */}
          <section aria-labelledby="quick-start" className="rounded-2xl border border-border-subtle bg-card p-6">
            <h2 id="quick-start" className="text-base font-semibold tracking-tight text-text">
              Start here
            </h2>
            <ol className="mt-4 flex list-none flex-col gap-3 sm:flex-row">
              {[
                "Start Git Fundamentals",
                "Complete your first lesson",
                "Try the Playground",
              ].map((step, i) => (
                <li key={step} className="flex flex-1 items-start gap-2.5 rounded-xl border border-border-subtle bg-base-subtle/40 px-3.5 py-3">
                  <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-[11px] font-semibold text-accent-hover">
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] leading-snug text-text-secondary">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <DocCta label="Start Learning" to="/dashboard" auth="progress" />
              <Link to="/docs/learning" className="text-sm font-medium text-accent-hover transition-colors hover:text-accent">
                See how lessons work
                <ArrowRight className="ml-1 inline size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>

        <GuideNavLinks active="overview" />
      </article>
    </GuideLayout>
  );
}
