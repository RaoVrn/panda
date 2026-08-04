/**
 * Panda content schema.
 *
 * Every lesson is a plain array of typed blocks. The blueprint below must be
 * the single source of truth for what can appear in a lesson. To add a new
 * block type later (timeline, diff viewer, merge animation …):
 *
 *   1. Add a member to the `ContentBlock` union here,
 *   2. add a case/component to `content/renderer.tsx`,
 *   3. author the block in any lesson file.
 *
 * The renderer registry is typed so omitting step 2 breaks the build.
 */

export interface ContentHeadingBlock {
  type: "heading";
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

export interface ContentParagraphBlock {
  type: "paragraph";
  id: string;
  text: string;
}

export interface ContentDividerBlock {
  type: "divider";
  id: string;
}

export type CalloutTone = "info" | "success" | "warning" | "tip";

export interface ContentCalloutBlock {
  type: "callout";
  id: string;
  tone: CalloutTone;
  title?: string;
  text: string;
}

export interface ContentTipBlock {
  type: "tip";
  id: string;
  title?: string;
  text: string;
}

export interface ContentWarningBlock {
  type: "warning";
  id: string;
  title?: string;
  text: string;
}

export interface ContentCodeBlock {
  type: "code";
  id: string;
  language?: string;
  filename?: string;
  code: string;
}

export interface ContentImageBlock {
  type: "image";
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export type TerminalLineKind = "output" | "command" | "error" | "success" | "warning" | "muted";

/** One command + its output inside an interactive terminal run. */
export interface TerminalStep {
  command: string;
  output?: string;
  outputKind?: TerminalLineKind;
  note?: string;
}

export interface ContentTerminalStepsBlock {
  type: "terminalSteps";
  id: string;
  title?: string;
  prompt?: string;
  steps: TerminalStep[];
}

export interface ContentEditorBlock {
  type: "editor";
  id: string;
  language?: string;
  filename?: string;
  code: string;
}

export interface ContentDirectoryTreeBlock {
  type: "directoryTree";
  id: string;
  base?: string;
  title?: string;
  nodes: FolderTreeNode[];
}

export interface ContentGitGraphCommit {
  id: string;
  x: number;
  y: number;
  lane: number;
  label?: string;
  message?: string;
  branch?: string;
  timestamp?: string;
  filesChanged?: string[];
  accent?: boolean;
}

export interface ContentGitGraphLine {
  id: string;
  points: Array<{ x: number; y: number }>;
  accent?: boolean;
}

export interface ContentGitGraphBlock {
  type: "gitGraph";
  id: string;
  title?: string;
  commits: ContentGitGraphCommit[];
  lines: ContentGitGraphLine[];
  width?: number;
  height?: number;
}

export interface ContentQuizBlock {
  type: "quiz";
  id: string;
  quiz: Quiz;
}

export interface ContentSpacerBlock {
  type: "spacer";
  id: string;
  height?: number;
}

export interface ContentLearningGoalBlock {
  type: "learningGoal";
  id: string;
  text: string;
}

/** One beat in a step-by-step storyboard animation. */
export interface ContentStoryboardNode {
  id: string;
  text: string;
  /** Optional key into the storyboard's icon set (e.g. "save", "sword"). */
  icon?: string;
}

export interface ContentStoryboardBlock {
  type: "storyboard";
  id: string;
  title?: string;
  nodes: ContentStoryboardNode[];
}

export interface ContentGitVsGithubBlock {
  type: "gitVsGithub";
  id: string;
  title?: string;
}

export interface ContentKeyTakeawaysBlock {
  type: "keyTakeaways";
  id: string;
  items: string[];
}

export interface ContentPracticeBlock {
  type: "practice";
  id: string;
  title?: string;
  description: string;
  hint?: string;
  exampleAnswer?: string;
}

export type ContentBlock =
  | ContentHeadingBlock
  | ContentParagraphBlock
  | ContentDividerBlock
  | ContentCalloutBlock
  | ContentTipBlock
  | ContentWarningBlock
  | ContentCodeBlock
  | ContentImageBlock
  | ContentTerminalStepsBlock
  | ContentEditorBlock
  | ContentDirectoryTreeBlock
  | ContentGitGraphBlock
  | ContentQuizBlock
  | ContentLearningGoalBlock
  | ContentKeyTakeawaysBlock
  | ContentPracticeBlock
  | ContentStoryboardBlock
  | ContentGitVsGithubBlock
  | ContentSpacerBlock;

export type ContentBlockType = ContentBlock["type"];

/** A member of the union narrowed to a concrete block type. */
export type BlockOfType<T extends ContentBlockType> = Extract<
  ContentBlock,
  { type: T }
>;

/** A node in a directory tree. */
export interface FolderTreeNode {
  name: string;
  type: "file" | "directory";
  children?: FolderTreeNode[];
  tracked?: boolean;
  ignored?: boolean;
  /** Lesson-driven attention: paint this node with the accent highlight. */
  highlight?: boolean;
  note?: string;
}

/** One question inside a quiz. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** A quiz as authored in a lesson. */
export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface ContentLessonMeta {
  module: string;
  order: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  durationMinutes?: number;
  prerequisites?: string[];
  tags?: string[];
  /** Short "you learned" bullets shown in the lesson-complete summary. */
  summary?: string[];
  /** "Why this matters" line shown in the lesson-complete summary. */
  whyItMatters?: string;
  /** A tiny motivational line shown near the end of the lesson. */
  motivation?: string;
}

export interface ContentLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  meta: ContentLessonMeta;
  blocks: ContentBlock[];
}

/** A module in the course roadmap. `lessons` lists lesson ids in order. */
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  icon?: string;
  lessons: string[];
}