export type LessonSlug = string
export type ModuleId = string
export type LessonId = string

export type LearningBlock =
  | { type: 'problem'; text: string }
  | { type: 'why'; text: string }
  | { type: 'analogy'; text: string }
  | { type: 'explanation'; text: string }
  | { type: 'visual'; kind: VisualKind; data: Record<string, unknown> }
  | { type: 'diagram'; kind: DiagramKind; data: Record<string, unknown> }
  | { type: 'folderTree'; data: FolderTreeData }
  | { type: 'flowchart'; data: FlowChartData }
  | { type: 'command'; label: string; command: string }
  | { type: 'internalWorking'; text: string }
  | { type: 'interactive'; kind: InteractiveKind; data: Record<string, unknown> }

export type VisualKind = 'git-graph' | 'commit-steps' | 'before-after' | 'repo-layers'
export type DiagramKind = 'commit' | 'branch' | 'merge' | 'staging' | 'remote'
export type InteractiveKind = 'sandbox' | 'guided-command' | 'spot-difference' | 'drag-drop'

export interface FolderTreeNode {
  name: string
  type: 'file' | 'directory'
  children?: FolderTreeNode[]
  tracked?: boolean
  ignored?: boolean
  note?: string
}

export interface FolderTreeData {
  title?: string
  base?: string
  nodes: FolderTreeNode[]
}

export interface FlowChartStep {
  id: string
  label: string
  type?: 'start' | 'decision' | 'action' | 'end'
  note?: string
}

export interface FlowChartData {
  title?: string
  steps: FlowChartStep[]
  connections?: Array<[string, string]>
}

export type BlockContent = string | Record<string, unknown>

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

export interface LessonMeta {
  id: LessonId
  slug: LessonSlug
  title: string
  description: string
  module: ModuleId
  order: number
  durationMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: LessonId[]
  tags?: string[]
}

export interface Lesson {
  meta: LessonMeta
  blocks: LearningBlock[]
  quiz?: Quiz
}

export interface Module {
  id: ModuleId
  title: string
  description: string
  order: number
  icon?: string
  lessons: LessonId[]
}

export interface Course {
  name: string
  modules: Module[]
  lessons: Record<LessonId, Lesson>
}
