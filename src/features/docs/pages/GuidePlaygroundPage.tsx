import { Eye, FileCode2, FolderGit2, PackageCheck, Telescope, Terminal } from "lucide-react";
import { GuideLayout } from "@/features/docs/components/GuideLayout";
import { GuidePageHeader } from "@/features/docs/components/GuidePageHeader";
import { GuideCard } from "@/features/docs/components/GuideCard";
import { GuideDiagram } from "@/features/docs/components/GuideDiagram";
import { GuideNavLinks } from "@/features/docs/components/GuideNavLinks";
import { PlaygroundPreview } from "@/features/docs/components/PlaygroundPreview";
import { CommandDemo } from "@/features/docs/components/CommandDemo";
import { DocCallout } from "@/features/docs/components/DocCallout";
import { DocCta } from "@/features/docs/components/DocCta";
import { firstPlaygroundSlug } from "@/features/docs/guideIndex";

/**
 * Guide page: the playground. A miniature preview, an interactive before/after
 * command example, one Git-states diagram, and why practice matters.
 */
export function GuidePlaygroundPage() {
  const playgroundSlug = firstPlaygroundSlug();

  return (
    <GuideLayout active="playground">
      <article className="mx-auto w-full max-w-3xl pb-10">
        <GuidePageHeader title="Practice Git Without the Fear" subtitle="Experiment with commands and see the repository change." />

        <div className="mt-10 flex flex-col gap-12">
          {/* Playground preview */}
          <section aria-labelledby="playground-preview">
            <h2 id="playground-preview" className="text-lg font-semibold tracking-tight text-text">
              This is what you'll see
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              The playground pairs a terminal with a live visualizer. Type a command and watch
              your files move between Git's states.
            </p>
            <div className="mt-5">
              <PlaygroundPreview />
            </div>
          </section>

          {/* Try a command */}
          <section aria-labelledby="try-command">
            <h2 id="try-command" className="text-lg font-semibold tracking-tight text-text">
              Try a command
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Pick a command and see the before and after.
            </p>
            <div className="mt-4">
              <CommandDemo />
            </div>
          </section>

          {/* Git states */}
          <section aria-labelledby="git-states">
            <h2 id="git-states" className="text-lg font-semibold tracking-tight text-text">
              The three places your work lives
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Commands move your work through three states. The playground makes every move
              visible.
            </p>
            <div className="mx-auto mt-6 max-w-md">
              <GuideDiagram
                ariaLabel="Git states: working tree, then staging area, then repository."
                steps={[
                  { icon: FileCode2, label: "Working Tree", sub: "Where you make changes." },
                  { icon: FolderGit2, label: "Staging Area", sub: "Where you prepare changes." },
                  { icon: PackageCheck, label: "Repository", sub: "Where committed history lives." },
                ]}
                accentIndex={2}
              />
            </div>
          </section>

          {/* Why practice */}
          <section aria-labelledby="why-practice">
            <h2 id="why-practice" className="text-lg font-semibold tracking-tight text-text">
              Why practice here?
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <GuideCard icon={Terminal} title="Experiment">Try commands safely.</GuideCard>
              <GuideCard icon={Eye} title="Observe">See how Git changes state.</GuideCard>
              <GuideCard icon={Telescope} title="Understand">Build intuition instead of memorizing syntax.</GuideCard>
            </div>
            <div className="mt-4">
              <DocCallout tone="tip" title="Fully simulated">
                It runs in your browser, never touching your computer or a real repository.
              </DocCallout>
            </div>
          </section>

          {/* CTA */}
          <section className="flex flex-col items-start gap-3 rounded-2xl border border-border-subtle bg-card p-6">
            <p className="text-sm font-medium text-text">Ready to type your first command?</p>
            <DocCta
              label="Open the Playground"
              to={`/lesson/${playgroundSlug}?mode=interactive`}
              auth="playground"
            />
          </section>
        </div>

        <GuideNavLinks active="playground" />
      </article>
    </GuideLayout>
  );
}
