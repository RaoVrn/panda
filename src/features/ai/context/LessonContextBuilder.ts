/**
 * LessonContextBuilder — builds the structured lesson context from the
 * AUTHORED lesson data. This is the single source of truth for what the AI
 * knows about a page. No DOM scraping, no guessing: everything comes from the
 * lesson's typed blocks, so any future course (Python, Docker, React, …)
 * works automatically.
 */

import type { ContentBlock, ContentLesson } from "@/content/schema";
import { courseOfLesson, moduleOfLesson } from "@/content/curriculum";
import { estimateMinutes } from "@/content/duration";

const CAP = 700;

const INTERACTIVE_TYPES = new Set([
  "terminalSteps",
  "editor",
  "directoryTree",
  "gitGraph",
  "stageArea",
  "branchGraph",
  "diffViewer",
  "storyboard",
  "gitVsGithub",
  "quiz",
  "practice",
]);

function blockText(block: ContentBlock): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
    case "learningGoal":
      return block.text;
    case "callout":
    case "tip":
    case "warning":
      return `${block.title ?? ""} ${block.text}`;
    case "code":
    case "editor":
      return block.code;
    case "terminalSteps":
      return block.steps.map((s) => `${s.command} ${s.output ?? ""}`).join("\n");
    default:
      return "";
  }
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Map a scroll percentage (0–100) to the section heading around it. */
function sectionAtProgress(
  lesson: ContentLesson,
  scrollPercent: number | undefined,
): string | undefined {
  const pct = scrollPercent ?? 0;
  if (lesson.blocks.length === 0) return undefined;
  const cursor = (pct / 100) * lesson.blocks.length;
  let lastHeading: string | undefined;
  for (let i = 0; i < lesson.blocks.length; i++) {
    const block = lesson.blocks[i]!;
    if (block.type === "heading" && block.level === 2) {
      if (i <= cursor) lastHeading = block.text;
    }
  }
  return lastHeading;
}

export interface LessonStructure {
  /** Pure lesson facts (no live state). */
  base: {
    lessonId: string;
    lessonSlug: string;
    lessonTitle: string;
    course?: string;
    module?: string;
    description?: string;
    difficulty?: string;
    estimatedMinutes?: number;
    objectives?: string[];
    headings: string[];
    subheadings: string[];
    concepts: string[];
    commands: string[];
    examples: string[];
    callouts: string[];
    takeaways: string[];
    quizSummary?: string;
    challenge?: string;
    interactiveComponents: string[];
  };
  /** Text under a given section heading (capped). */
  sectionText: (heading: string | undefined) => string;
  /** Which heading a scroll position is at. */
  sectionAtProgress: (scrollPercent: number | undefined) => string | undefined;
}

export function buildLessonStructure(lesson: ContentLesson): LessonStructure {
  const course = courseOfLesson(lesson.id);
  const module = moduleOfLesson(lesson.id);

  const objectives = lesson.learningGoals ?? [];
  const headings: string[] = [];
  const subheadings: string[] = [];
  const concepts: string[] = [];
  const commands: string[] = [];
  const examples: string[] = [];
  const callouts: string[] = [];
  const takeaways: string[] = [];
  const interactiveComponents: string[] = [];
  let quizQuestions: string[] = [];
  let challenge: string | undefined;

  const addConcepts = (texts: string[]) => {
    for (const text of texts) {
      const value = clean(text);
      if (value && !concepts.includes(value)) concepts.push(value);
    }
  };

  for (const block of lesson.blocks) {
    if (block.type === "heading") {
      if (block.level === 2) headings.push(block.text);
      else subheadings.push(block.text);
    } else if (block.type === "paragraph") {
      addConcepts([block.text]);
    } else if (block.type === "learningGoal") {
      addConcepts([block.text]);
    } else if (block.type === "callout" || block.type === "tip" || block.type === "warning") {
      callouts.push(clean(`${block.title ?? ""} ${block.text}`));
      addConcepts([block.text]);
    } else if (block.type === "code" || block.type === "editor") {
      examples.push(clean(block.code).slice(0, 240));
    } else if (block.type === "terminalSteps") {
      for (const step of block.steps) {
        if (!commands.includes(step.command)) commands.push(step.command);
      }
    } else if (block.type === "keyTakeaways") {
      takeaways.push(...block.items);
      addConcepts(block.items);
    } else if (block.type === "quiz") {
      quizQuestions = block.quiz.questions.map((question) => question.prompt);
    } else if (block.type === "practice") {
      challenge = clean(block.description);
    }
    if (INTERACTIVE_TYPES.has(block.type) && !interactiveComponents.includes(block.type)) {
      interactiveComponents.push(block.type);
    }
  }

  const quizSummary =
    quizQuestions.length > 0
      ? `${quizQuestions.length} questions: ${quizQuestions.slice(0, 3).join(" · ")}`
      : undefined;

  const headingsWithStart: Array<{ heading: string; index: number }> = [];
  for (let i = 0; i < lesson.blocks.length; i++) {
    const block = lesson.blocks[i]!;
    if (block.type === "heading" && block.level === 2) {
      headingsWithStart.push({ heading: block.text, index: i });
    }
  }

  const blocksByHeading = (heading: string | undefined): ContentBlock[] => {
    if (!heading) return [];
    const start = lesson.blocks.findIndex(
      (b) => b.type === "heading" && b.text === heading,
    );
    if (start < 0) return [];
    const end = lesson.blocks.findIndex(
      (b, i) => i > start && b.type === "heading" && b.level === 2,
    );
    return lesson.blocks.slice(start, end < 0 ? undefined : end);
  };

  return {
    base: {
      lessonId: lesson.id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      course: course?.title,
      module: module?.title,
      description: clean(lesson.description),
      difficulty: lesson.meta.difficulty,
      estimatedMinutes: estimateMinutes(lesson),
      objectives: objectives.slice(0, 5),
      headings: headings.slice(0, 14),
      subheadings: subheadings.slice(0, 8),
      concepts: concepts.slice(0, 10),
      commands: commands.slice(0, 8),
      examples: examples.slice(0, 3),
      callouts: callouts.slice(0, 4),
      takeaways: takeaways.slice(0, 6),
      quizSummary,
      challenge,
      interactiveComponents,
    },
    sectionText: (heading) => {
      const text = blocksByHeading(heading)
        .map(blockText)
        .filter(Boolean)
        .join("\n")
        .replace(/\s+/g, " ")
        .trim();
      return text.length > CAP ? text.slice(0, CAP) + "…" : text;
    },
    sectionAtProgress: (scrollPercent) => sectionAtProgress(lesson, scrollPercent),
  };
}

export { sectionAtProgress };
