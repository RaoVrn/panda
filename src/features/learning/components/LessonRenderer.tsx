import type { LearningBlock, Lesson } from "@/types/lesson";
import { LessonTitle } from "@/features/learning/components/LessonTitle";
import { LessonGoal } from "@/features/learning/components/LessonGoal";
import { LessonSection } from "@/features/learning/components/LessonSection";
import { ExplanationBlock } from "@/features/learning/components/ExplanationBlock";
import { AnalogyBlock } from "@/features/learning/components/AnalogyBlock";
import { DirectoryTree } from "@/features/learning/components/DirectoryTree";
import { FlowchartContainer } from "@/features/learning/components/FlowchartContainer";
import { CommandBlock } from "@/features/learning/components/CommandBlock";
import { Editor } from "@/features/learning/components/Editor";
import { Terminal } from "@/features/learning/components/Terminal";
import { QuizBlock } from "@/features/learning/components/QuizBlock";
import { KeyTakeaways } from "@/features/learning/components/KeyTakeaways";
import { CommonMistakes } from "@/features/learning/components/CommonMistakes";
import { PracticeBlock } from "@/features/learning/components/PracticeBlock";
import { LessonNav } from "@/features/learning/components/LessonNav";
import { Grip, Sparkles } from "lucide-react";

/**
 * LessonRenderer — the plug-in point of the content system.
 * Each structured block in a lesson maps to a reusable section component.
 * Adding a new visual type = add a case here, nothing else.
 */
export function LessonRenderer({
  lesson,
  previousLesson,
  nextLesson,
}: {
  lesson: Lesson;
  previousLesson?: Lesson;
  nextLesson?: Lesson;
}) {
  const blocks = lesson.blocks;
  let seq = 0;
  const nextSeq = () => ++seq;

  function renderBlock(block: LearningBlock, key: number) {
    switch (block.type) {
      case "problem":
      case "why":
      case "explanation":
      case "internalWorking":
        return <ExplanationBlock key={key} text={block.text} index={nextSeq()} />;
      case "analogy":
        return <AnalogyBlock key={key} text={block.text} index={nextSeq()} />;
      case "command":
        return (
          <LessonSection key={key} label="Command">
            <CommandBlock label={block.label} command={block.command} />
          </LessonSection>
        );
      case "folderTree":
        return (
          <LessonSection key={key} label="Directory">
            <DirectoryTree
              nodes={block.data.nodes}
              base={block.data.base}
              title={block.data.title}
            />
          </LessonSection>
        );
      case "flowchart":
        return (
          <LessonSection key={key} label="Flowchart">
            <FlowchartContainer data={block.data} />
          </LessonSection>
        );
      case "visual":
      case "diagram":
        return (
          <LessonSection key={key} label={block.type === "diagram" ? "Diagram" : "Visual"}>
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-subtle p-8 text-center">
              <Sparkles className="size-5 text-text-muted" aria-hidden="true" />
              <p className="text-sm text-text-muted">
                {block.type} visual coming soon.
              </p>
            </div>
          </LessonSection>
        );
      case "interactive":
        if (block.kind === "guided-command" || block.kind === "sandbox") {
          return (
            <LessonSection key={key} label="Interactive">
              <Terminal title="panda sandbox" lines={[]} />
            </LessonSection>
          );
        }
        return (
          <LessonSection key={key} label="Interactive">
            <Editor filename="exercise.js" language="javascript" defaultValue="" />
          </LessonSection>
        );
      default:
        return null;
    }
  }

  return (
    <article className="flex flex-col">
      <LessonTitle lesson={lesson} />
      <LessonGoal>{lesson.meta.description}</LessonGoal>

      {blocks.length === 0 ? (
        <LessonSection
          index={nextSeq()}
          label="Content"
          icon={<Grip className="size-4 text-text-muted" aria-hidden="true" />}
        >
          <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center">
            <p className="text-sm font-medium text-text">This lesson is ready for content.</p>
            <p className="mt-2 text-sm text-text-muted">
              Structured blocks — explanations, visuals, terminal, editor,
              directory trees and quizzes — will render here.
            </p>
          </div>
        </LessonSection>
      ) : (
        blocks.map((block, index) => renderBlock(block, index))
      )}

      <KeyTakeaways index={nextSeq()} />
      <CommonMistakes index={nextSeq()} />
      <QuizBlock quiz={lesson.quiz} />
      <PracticeBlock index={nextSeq()} />
      <LessonNav previous={previousLesson} next={nextLesson} />
    </article>
  );
}