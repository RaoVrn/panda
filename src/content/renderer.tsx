import type { ReactNode } from "react";
import type {
  BlockOfType,
  ContentBlock,
  ContentBlockType,
} from "@/content/schema";
import {
  BranchGraphBlock,
  CalloutBlock,
  CodeBlock,
  DiffViewerBlock,
  DirectoryTreeBlock,
  DividerBlock,
  EditorBlock,
  GitGraphBlock,
  GitVsGithubBlock,
  HeadingBlock,
  ImageBlock,
  KeyTakeawaysBlock,
  LearningGoalBlock,
  ParagraphBlock,
  PracticeBlock,
  SpacerBlock,
  StageAreaBlock,
  StoryBoardBlock,
  TerminalStepsBlock,
  TipBlock,
  WarningBlock,
} from "@/features/lesson/components/blocks";

/**
 * Block renderer registry, the single extensibility point of the engine.
 *
 * Every block type must have an entry here. The mapped type constrains each
 * entry to its exact block and makes the map exhaustive against the schema
 * union, so adding a new block type without registering a renderer breaks
 * the build.
 */
const registry: {
  [K in ContentBlockType]: (block: BlockOfType<K>) => ReactNode;
} = {
  heading: (block) => <HeadingBlock block={block} />,
  paragraph: (block) => <ParagraphBlock block={block} />,
  divider: (block) => <DividerBlock block={block} />,
  callout: (block) => <CalloutBlock block={block} />,
  tip: (block) => <TipBlock block={block} />,
  warning: (block) => <WarningBlock block={block} />,
  code: (block) => <CodeBlock block={block} />,
  image: (block) => <ImageBlock block={block} />,
  terminalSteps: (block) => <TerminalStepsBlock block={block} />,
  editor: (block) => <EditorBlock block={block} />,
  directoryTree: (block) => <DirectoryTreeBlock block={block} />,
  gitGraph: (block) => <GitGraphBlock block={block} />,
  learningGoal: (block) => <LearningGoalBlock block={block} />,
  keyTakeaways: (block) => <KeyTakeawaysBlock block={block} />,
  practice: (block) => <PracticeBlock block={block} />,
  storyboard: (block) => <StoryBoardBlock block={block} />,
  gitVsGithub: (block) => <GitVsGithubBlock block={block} />,
  stageArea: (block) => <StageAreaBlock block={block} />,
  branchGraph: (block) => <BranchGraphBlock block={block} />,
  diffViewer: (block) => <DiffViewerBlock block={block} />,
  spacer: (block) => <SpacerBlock block={block} />,
};

/**
 * Dispatch a single block to its renderer. Narrowing a union by a dynamic key
 * isn't expressible in TypeScript, so one documented cast lives here.
 */
export function renderBlock(block: ContentBlock): ReactNode {
  const render = registry[block.type] as (block: ContentBlock) => ReactNode;
  return render(block);
}