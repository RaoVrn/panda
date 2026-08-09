import { MessageSquareText } from "lucide-react";
import { GuideLayout } from "@/features/docs/components/GuideLayout";
import { GuidePageHeader } from "@/features/docs/components/GuidePageHeader";
import { GuideNavLinks } from "@/features/docs/components/GuideNavLinks";
import { PromptCard } from "@/features/docs/components/PromptCard";
import { AiChatExample } from "@/features/docs/components/AiChatExample";
import { AiFlow } from "@/features/docs/components/AiFlow";
import { AiContextChips } from "@/features/docs/components/AiContextChips";
import { DocCallout } from "@/features/docs/components/DocCallout";
import { DocCta } from "@/features/docs/components/DocCta";

const QUESTIONS = [
  "What exactly does git add do?",
  "Why do I need a staging area?",
  "Explain branches simply.",
  "What's the difference between fetch and pull?",
  "Where am I in the course?",
];

/**
 * Guide page: Panda AI. What to ask, a real-looking conversation, a small
 * context diagram, and when Panda avoids sending you somewhere.
 */
export function GuideAiPage() {
  return (
    <GuideLayout active="ai">
      <article className="mx-auto w-full max-w-3xl pb-10">
        <GuidePageHeader title="Your Git Learning Companion" subtitle="Ask questions whenever Git doesn't make sense." />

        <div className="mt-10 flex flex-col gap-12">
          {/* What can I ask */}
          <section aria-labelledby="ai-questions">
            <h2 id="ai-questions" className="text-lg font-semibold tracking-tight text-text">
              What can I ask Panda?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Anything about Git, a lesson, or your own progress. Tap a question to ask Panda
              directly.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {QUESTIONS.map((question) => (
                <PromptCard key={question} prompt={question} />
              ))}
            </div>
          </section>

          {/* Real response */}
          <section aria-labelledby="ai-response">
            <h2 id="ai-response" className="text-lg font-semibold tracking-tight text-text">
              A real Panda response
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Ask a question, get a clear answer, and sometimes a button that opens the lesson.
            </p>
            <div className="mt-4">
              <AiChatExample />
            </div>
          </section>

          {/* Context diagram */}
          <section aria-labelledby="ai-course">
            <h2 id="ai-course" className="text-lg font-semibold tracking-tight text-text">
              When Panda connects you to the course
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              If a lesson covers your question, Panda can point you straight to it.
            </p>
            <div className="mt-4 rounded-2xl border border-border-subtle bg-base-subtle/30 p-5">
              <AiFlow />
            </div>
          </section>

          {/* Smart context */}
          <section aria-labelledby="ai-context">
            <h2 id="ai-context" className="text-lg font-semibold tracking-tight text-text">
              Answers that know you
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Panda can draw on your learning context to make answers more relevant.
            </p>
            <div className="mt-4">
              <AiContextChips />
            </div>
          </section>

          {/* When not to use a link */}
          <section aria-labelledby="ai-no-links">
            <div className="mt-2">
              <DocCallout tone="note" title="Panda doesn't need to send you somewhere every time">
                If the question can be answered directly, Panda answers it. When a lesson,
                Playground or documentation page genuinely helps, Panda provides a relevant
                action. Not every answer needs a button.
              </DocCallout>
            </div>
          </section>

          {/* CTA */}
          <section className="flex flex-col items-start gap-3 rounded-2xl border border-border-subtle bg-card p-6">
            <p className="flex items-center gap-2 text-sm font-medium text-text">
              <MessageSquareText className="size-4 text-accent-hover" aria-hidden="true" />
              Got a question right now?
            </p>
            <DocCta label="Ask Panda AI" to="/panda-ai" auth="ai" />
          </section>
        </div>

        <GuideNavLinks active="ai" />
      </article>
    </GuideLayout>
  );
}
