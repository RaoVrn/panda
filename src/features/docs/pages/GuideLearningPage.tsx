import { Lightbulb, MessageSquareText } from "lucide-react";
import { GuideLayout } from "@/features/docs/components/GuideLayout";
import { GuidePageHeader } from "@/features/docs/components/GuidePageHeader";
import { GuideNavLinks } from "@/features/docs/components/GuideNavLinks";
import { LessonPreviewCard } from "@/features/docs/components/LessonPreviewCard";
import { ModeComparison } from "@/features/docs/components/ModeComparison";
import { CourseStrip } from "@/features/docs/components/CourseStrip";
import { ProgressCard } from "@/features/docs/components/ProgressCard";
import { DocCta } from "@/features/docs/components/DocCta";

/**
 * Guide page: the learning experience. How a lesson looks, Read vs
 * Interactive, the course structure, and how progress works. No diagrams here,
 * only real-looking product UI.
 */
export function GuideLearningPage() {
  return (
    <GuideLayout active="learning">
      <article className="mx-auto w-full max-w-3xl pb-10">
        <GuidePageHeader title="Learn Git Your Way" subtitle="Understand the idea, see it happen, then practice it." />

        <div className="mt-10 flex flex-col gap-12">
          {/* How a lesson works */}
          <section aria-labelledby="lesson-preview">
            <h2 id="lesson-preview" className="text-lg font-semibold tracking-tight text-text">
              How a lesson works
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              One concept per lesson. You read it, see it, then try it.
            </p>
            <div className="mx-auto mt-5 max-w-md">
              <LessonPreviewCard />
            </div>
          </section>

          {/* Read vs Interactive */}
          <section aria-labelledby="lesson-modes">
            <h2 id="lesson-modes" className="text-lg font-semibold tracking-tight text-text">
              Read vs Interactive
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Every lesson opens in Read mode. Lessons with a playground can switch to
              Interactive so you can drive the same scenario yourself.
            </p>
            <div className="mt-4">
              <ModeComparison />
            </div>
          </section>

          {/* Course structure */}
          <section aria-labelledby="course-structure">
            <h2 id="course-structure" className="text-lg font-semibold tracking-tight text-text">
              The course
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Tap any module to open it.
            </p>
            <div className="mt-4">
              <CourseStrip />
            </div>
          </section>

          {/* Progress */}
          <section aria-labelledby="progress">
            <h2 id="progress" className="text-lg font-semibold tracking-tight text-text">
              Watching your progress
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Progress builds from each lesson up to the whole course.
            </p>
            <div className="mt-4">
              <ProgressCard />
            </div>
          </section>

          {/* Learning tip */}
          <section aria-labelledby="learning-tip" className="rounded-2xl border border-border-subtle bg-card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-text">
              <Lightbulb className="size-4 text-warning" aria-hidden="true" />
              A tip before you start
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Don't try to memorize Git commands first. Understand what state Git is changing,
              and the commands will start making sense on their own.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <DocCta label="Open the course" to="/dashboard" auth="progress" />
              <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                <MessageSquareText className="size-3.5 text-accent-hover" aria-hidden="true" />
                Stuck? Ask Panda AI, it's one tap away.
              </span>
            </div>
          </section>
        </div>

        <GuideNavLinks active="learning" />
      </article>
    </GuideLayout>
  );
}
