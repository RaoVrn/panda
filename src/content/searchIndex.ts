/**
 * Search index built from the authored lesson data.
 *
 * Every lesson is flattened into searchable hits (sections, commands, quiz
 * questions, takeaways, concepts) so global search can find far more than just
 * lesson titles. Adding a lesson automatically extends the index.
 */

import type { ContentLesson } from "./schema";
import { allLessons } from "./lessons";
import { moduleOfLesson, modules } from "./curriculum";

export type SearchKind =
  | "lesson"
  | "section"
  | "command"
  | "quiz"
  | "takeaway"
  | "concept"
  | "module";

export interface SearchHit {
  lessonSlug: string;
  lessonTitle: string;
  kind: SearchKind;
  text: string;
}

const KIND_LABEL: Record<SearchKind, string> = {
  lesson: "Lesson",
  section: "Section",
  command: "Command",
  quiz: "Quiz question",
  takeaway: "Takeaway",
  concept: "Concept",
  module: "Module",
};

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function blockHits(lesson: ContentLesson): SearchHit[] {
  const hits: SearchHit[] = [];
  const push = (kind: SearchKind, text: string) => {
    const value = clean(text);
    if (!value) return;
    hits.push({ lessonSlug: lesson.slug, lessonTitle: lesson.title, kind, text: value });
  };

  for (const block of lesson.blocks) {
    switch (block.type) {
      case "heading":
        push("section", block.text);
        break;
      case "paragraph":
      case "learningGoal":
        push("concept", block.text);
        break;
      case "callout":
      case "tip":
      case "warning":
        push("concept", `${block.title ?? ""} ${block.text}`);
        break;
      case "code":
        push("concept", block.code);
        break;
      case "editor":
        push("concept", block.code);
        break;
      case "terminalSteps":
        for (const step of block.steps) {
          push("command", `${step.command} ${step.output ?? ""} ${step.note ?? ""}`.trim());
        }
        break;
      case "quiz":
        for (const question of block.quiz.questions) {
          push("quiz", `${question.prompt} ${question.options.join(" ")}`);
        }
        break;
      case "keyTakeaways":
        for (const item of block.items) push("takeaway", item);
        break;
      case "practice":
        push("concept", block.description);
        break;
      case "storyboard":
        for (const node of block.nodes) push("concept", node.text);
        break;
      case "branchGraph":
        for (const step of block.steps) {
          push(
            "concept",
            `${step.branch} ${step.action} ${step.message ?? ""} ${step.tag ?? ""}`.trim(),
          );
        }
        break;
      case "diffViewer":
        for (const row of block.rows) {
          push("concept", `${row.left ?? ""} ${row.right ?? ""}`.trim());
        }
        break;
      case "stageArea":
        for (const file of block.readFiles ?? []) {
          push("command", `${file.name} ${file.status}`);
        }
        break;
      default:
        break;
    }
  }
  return hits;
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
        `${lesson.title} ${lesson.description} ${module?.title ?? ""} ${(lesson.meta.tags ?? []).join(" ")} ${(lesson.learningGoals ?? []).join(" ")}`,
      ),
    });
    hits.push(...blockHits(lesson));
  }

  for (const module of modules) {
    hits.push({
      lessonSlug: "",
      lessonTitle: module.title,
      kind: "module",
      text: clean(`${module.title} ${module.description}`),
    });
  }

  return hits;
}

/** Case-insensitive substring search over the whole index. */
export function searchCurriculum(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return buildSearchIndex().filter((hit) => hit.text.toLowerCase().includes(q));
}

export function searchKindLabel(kind: SearchKind): string {
  return KIND_LABEL[kind];
}
