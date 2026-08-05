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
      return block.level >= 2 ? "mt-16 scroll-mt-24" : "mt-12 scroll-mt-24";
    case "paragraph":
      return "first:mt-0 mt-5";
    case "divider":
      return "mt-12";
    case "spacer":
      return "";
    case "learningGoal":
      return "mt-10";
    case "callout":
    case "tip":
    case "warning":
      return "mt-8";
    case "code":
    case "editor":
    case "terminalSteps":
    case "directoryTree":
    case "gitGraph":
    case "stageArea":
    case "branchGraph":
    case "diffViewer":
      return "mt-9";
    case "quiz":
    case "practice":
    case "keyTakeaways":
      return "mt-10";
    case "image":
      return "mt-9";
    default:
      return "mt-8";
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