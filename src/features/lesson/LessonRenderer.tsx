import { useEffect } from "react";
import type { ContentLesson } from "@/content/schema";
import { moduleOfLesson } from "@/content/curriculum";
import { renderBlock } from "@/content/renderer";
import { LessonTitle } from "@/features/lesson/components/LessonTitle";
import { LessonSummary } from "@/features/lesson/components/LessonSummary";
import { LessonPlayer } from "@/features/lesson/components/LessonPlayer";
import { LessonBreadcrumb } from "@/features/lesson/components/LessonBreadcrumb";
import { BlockTracker } from "@/features/lesson/components/BlockTracker";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { useReportAi } from "@/stores/aiContextStore";
import { useReadingStore } from "@/stores/readingStore";
import { useProgressStore } from "@/features/progress/progressStore";
import {
  maybeCompleteLesson,
  readPercent,
} from "@/features/progress/progressService";
import { cn } from "@/lib/utils";

export interface LessonRendererProps {
  lesson: ContentLesson;
  previousLesson?: ContentLesson;
  nextLesson?: ContentLesson;
  className?: string;
}

/**
 * Vertical rhythm for a premium, ChatGPT-like reading pace. Sections (level-2
 * headings) get generous breathing room while paragraphs stay close to the
 * prose they belong to. Visualizations sit slightly apart so the page guides
 * the eye downward instead of feeling like a dense document.
 */
function blockPad(block: ContentLesson["blocks"][number]): string {
  switch (block.type) {
    case "heading":
      return block.level >= 2 ? "mt-12 scroll-mt-24" : "mt-10 scroll-mt-24";
    case "paragraph":
      return "first:mt-0 mt-4";
    case "divider":
      return "mt-10";
    case "spacer":
      return "";
    case "learningGoal":
      return "mt-8";
    case "callout":
    case "tip":
    case "warning":
      return "mt-6";
    case "code":
    case "editor":
    case "terminalSteps":
    case "directoryTree":
    case "gitGraph":
    case "stageArea":
    case "branchGraph":
    case "diffViewer":
      return "mt-7";
    case "quiz":
    case "practice":
    case "keyTakeaways":
      return "mt-8";
    case "image":
      return "mt-7";
    default:
      return "mt-6";
  }
}

/**
 * Renders a complete lesson: header, the data-driven block engine and the
 * prev/next navigation. The engine never knows what a specific lesson
 * contains. The schema union plus the renderer registry decide everything.
 */
export function LessonRenderer({
  lesson,
  previousLesson,
  nextLesson,
  className,
}: LessonRendererProps) {
  const mode = useLessonModeStore((state) => state.mode);

  const module = moduleOfLesson(lesson.id);
  useReportAi(
    {
      lessonTitle: lesson.title,
      module: module?.title,
      mode,
      learningGoals: lesson.learningGoals,
    },
    [lesson.title, module?.title, mode, lesson.learningGoals],
  );

  // Progression: complete the lesson the moment read + interactive + quiz all
  // pass. maybeCompleteLesson only acts on the transition, so re-rendering
  // here is cheap and safe.
  const reading = useReadingStore((state) => state.readings[lesson.id]);
  const interactiveTouched = useProgressStore(
    (state) => state.interactiveTouched[lesson.id] === true,
  );
  const quiz = useProgressStore((state) => state.quizStats[lesson.id]);
  const readPct = readPercent(lesson, reading?.visited);

  useEffect(() => {
    maybeCompleteLesson(lesson);
  }, [lesson, readPct, interactiveTouched, quiz]);

  return (
    <LessonPlayer lessonId={lesson.id} totalBlocks={lesson.blocks.length}>
      <article id={lesson.id} aria-label={lesson.title} className={className}>
        <div className="mb-8">
          <LessonBreadcrumb lesson={lesson} />
        </div>
        <LessonTitle lesson={lesson} />
        {lesson.blocks.map((block, index) => (
          <BlockTracker
            key={block.id}
            block={block}
            className={cn(
              "first:mt-0",
              blockPad(block),
              block.type === "paragraph" && index === 0 && "mt-0",
            )}
          >
            {renderBlock(block)}
          </BlockTracker>
        ))}
        <LessonSummary
          lesson={lesson}
          previous={previousLesson}
          next={nextLesson}
        />
      </article>
    </LessonPlayer>
  );
}