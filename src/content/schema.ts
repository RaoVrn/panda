import type { FolderTreeNode, Quiz } from "@/types/lesson";

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

export type TerminalLineKind = "output" | "command" | "error" | "success" | "muted";

export interface ContentTerminalLine {
  text: string;
  kind?: TerminalLineKind;
}

export interface ContentTerminalBlock {
  type: "terminal";
  id: string;
  title?: string;
  prompt?: string;
  lines: ContentTerminalLine[];
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

export type ContentBlock =
  | ContentHeadingBlock
  | ContentParagraphBlock
  | ContentDividerBlock
  | ContentCalloutBlock
  | ContentTipBlock
  | ContentWarningBlock
  | ContentCodeBlock
  | ContentImageBlock
  | ContentTerminalBlock
  | ContentEditorBlock
  | ContentDirectoryTreeBlock
  | ContentGitGraphBlock
  | ContentQuizBlock
  | ContentSpacerBlock;

export type ContentBlockType = ContentBlock["type"];

/** A member of the union narrowed to a concrete block type. */
export type BlockOfType<T extends ContentBlockType> = Extract<
  ContentBlock,
  { type: T }
>;

export type { FolderTreeNode, Quiz };

export interface ContentLessonMeta {
  module: string;
  order: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  durationMinutes?: number;
  tags?: string[];
}

export interface ContentLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  meta: ContentLessonMeta;
  blocks: ContentBlock[];
}