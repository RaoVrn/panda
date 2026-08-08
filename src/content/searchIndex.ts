/**
 * Search index built from the authored lesson data.
 *
 * Every lesson is flattened into searchable hits (sections, commands, quiz
 * questions, takeaways, concepts, playground missions) so global search can
 * find far more than just lesson titles. Each hit carries a source block id so
 * the UI can deep-link to the exact spot. Adding a lesson automatically
 * extends the index.
 */

import type { ContentLesson, ContentBlock, ContentLessonPlayground } from "./schema";
import { allLessons } from "./lessons";
import { moduleOfLesson, modules } from "./curriculum";

export type SearchKind =
  | "lesson"
  | "section"
  | "command"
  | "takeaway"
  | "concept"
  | "module"
  | "mission";

export interface SearchHit {
  lessonSlug: string;
  lessonTitle: string;
  kind: SearchKind;
  text: string;
  /** Block id within the lesson, when the hit maps to a specific block. */
  blockId?: string;
  /** Relevance weight: higher ranks first for the same query. */
  weight: number;
}

const KIND_LABEL: Record<SearchKind, string> = {
  lesson: "Lesson",
  section: "Section",
  command: "Command",
  takeaway: "Takeaway",
  concept: "Concept",
  module: "Module",
  mission: "Mission",
};

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Playground mission content: objectives, hints and commands to run. */
function playgroundHits(lesson: ContentLesson): SearchHit[] {
  const hits: SearchHit[] = [];
  const playground: ContentLessonPlayground | undefined = lesson.playground;
  if (!playground) return hits;
  const push = (kind: SearchKind, text: string, weight: number) => {
    const value = clean(text);
    if (!value) return;
    hits.push({
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      kind,
      text: value,
      weight,
    });
  };
  for (const objective of playground.objectives) {
    push("mission", objective.label, 6);
  }
  for (const hint of playground.hints) push("mission", hint, 2);
  for (const command of [...(playground.solution ?? []), ...(playground.suggestions ?? [])]) {
    push("command", command, 4);
  }
  if (playground.shell?.helperText) push("mission", playground.shell.helperText, 2);
  if (playground.shell?.welcomeText) push("mission", playground.shell.welcomeText, 2);
  if (playground.visualizer?.banner) push("mission", playground.visualizer.banner, 2);
  return hits;
}

function blockHits(lesson: ContentLesson): SearchHit[] {
  const hits: SearchHit[] = [];
  const push = (kind: SearchKind, text: string, blockId?: string) => {
    const value = clean(text);
    if (!value) return;
    hits.push({
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      kind,
      text: value,
      blockId,
      weight: kind === "command" ? 5 : kind === "section" ? 4 : kind === "takeaway" ? 3 : 2,
    });
  };

  for (const block of lesson.blocks) {
    switch (block.type) {
      case "heading":
        push("section", block.text, block.id);
        break;
      case "paragraph":
      case "learningGoal":
        push("concept", block.text, block.id);
        break;
      case "callout":
      case "tip":
      case "warning":
        push("concept", `${block.title ?? ""} ${block.text}`, block.id);
        break;
      case "code":
      case "editor":
        push("concept", block.code, block.id);
        break;
      case "terminalSteps":
        for (const step of block.steps) {
          push("command", `${step.command} ${step.output ?? ""} ${step.note ?? ""}`.trim(), block.id);
        }
        break;
      case "keyTakeaways":
        for (const item of block.items) push("takeaway", item, block.id);
        break;
      case "practice":
        push("concept", block.description, block.id);
        if (block.hint) push("concept", block.hint, block.id);
        if (block.exampleAnswer) push("concept", block.exampleAnswer, block.id);
        break;
      case "storyboard":
        for (const node of block.nodes) push("concept", node.text, block.id);
        break;
      case "branchGraph":
        for (const step of block.steps) {
          push(
            "concept",
            `${step.branch} ${step.action} ${step.message ?? ""} ${step.tag ?? ""}`.trim(),
            block.id,
          );
        }
        break;
      case "diffViewer":
        push("concept", block.filename ?? "", block.id);
        for (const row of block.rows) {
          push("concept", `${row.left ?? ""} ${row.right ?? ""}`.trim(), block.id);
        }
        break;
      case "stageArea":
        if (block.commitMessage) push("command", block.commitMessage, block.id);
        for (const file of block.readFiles ?? []) {
          push("command", `${file.name} ${file.status}`, block.id);
        }
        break;
      case "directoryTree":
        for (const node of flattenTree(node0(block))) {
          push("concept", `${node.name} ${node.note ?? ""}`.trim(), block.id);
        }
        break;
      case "gitGraph":
        for (const commit of block.commits) {
          push("concept", `${commit.message ?? ""} ${commit.branch ?? ""} ${(commit.filesChanged ?? []).join(" ")}`.trim(), block.id);
        }
        break;
      case "image":
        push("concept", `${block.alt ?? ""} ${block.caption ?? ""}`.trim(), block.id);
        break;
      case "gitVsGithub":
        push("concept", block.title ?? "", block.id);
        break;
      default:
        break;
    }
  }
  return hits;
}

// Directory-tree nodes are typed as a recursive structure; these helpers
// flatten them for indexing without importing the schema node type.
type TreeNode = { name: string; note?: string; children?: TreeNode[] };
function node0(block: Extract<ContentBlock, { type: "directoryTree" }>): TreeNode[] {
  return block.nodes as unknown as TreeNode[];
}
function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    out.push(node);
    if (node.children) out.push(...flattenTree(node.children));
  }
  return out;
}

export function buildSearchIndex(): SearchHit[] {
  const hits: SearchHit[] = [];

  for (const lesson of allLessons()) {
    const module = moduleOfLesson(lesson.id);
    hits.push({
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      kind: "lesson",
      text: clean(
        `${lesson.title} ${lesson.description} ${module?.title ?? ""} ${(lesson.meta.tags ?? []).join(" ")} ${(lesson.learningGoals ?? []).join(" ")} ${(lesson.meta.summary ?? []).join(" ")} ${lesson.meta.whyItMatters ?? ""} ${lesson.meta.motivation ?? ""}`,
      ),
      weight: 10,
    });
    hits.push(...blockHits(lesson));
    hits.push(...playgroundHits(lesson));
  }

  for (const module of modules) {
    hits.push({
      lessonSlug: "",
      lessonTitle: module.title,
      kind: "module",
      text: clean(`${module.title} ${module.description}`),
      weight: 8,
    });
  }

  return hits;
}

/**
 * Ranked, case-insensitive search over the whole index.
 * Matches in titles outrank matches in body text; heavier hit kinds (commands,
 * lessons) rank above loose concepts. Results with equal weight stay in the
 * authored course order via the index's stable ordering.
 */
export function searchCurriculum(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildSearchIndex();
  const scored: Array<{ hit: SearchHit; score: number }> = [];
  for (const hit of index) {
    const text = hit.text.toLowerCase();
    if (!text.includes(q)) continue;
    let score = hit.weight;
    if (hit.lessonTitle.toLowerCase().startsWith(q)) score += 12;
    else if (hit.lessonTitle.toLowerCase().includes(q)) score += 8;
    if (text.startsWith(q)) score += 3;
    scored.push({ hit, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.hit);
}

export function searchKindLabel(kind: SearchKind): string {
  return KIND_LABEL[kind];
}
