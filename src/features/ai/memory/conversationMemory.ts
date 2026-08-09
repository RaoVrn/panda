/**
 * ConversationMemory  -  remembers what the learner has asked, struggled with,
 * and what has already been explained, so future answers adapt and never
 * repeat themselves.
 *
 * Lightweight and data-driven: topics are counted from the words in the
 * learner's questions, struggles are tagged from how they phrase things, and
 * answered topics are recorded after each turn. Persisted locally.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LessonContext } from "@/lib/ai/types";
import { toZustandStorage, userScopedAdapter } from "@/features/progress/localStorage";

const STOP_WORDS = new Set(
  "about after again also answer based can could explain give have help how just like lesson me need please question that the this what when where why with would".split(
    " ",
  ),
);

const STRUGGLE_HINTS = /(wrong|error|confused|don'?t understand|fix|mistake|break|failed|didn'?t work)/;

/** Extract meaningful topic words from a question. */
function topicsFrom(text: string): string[] {
  return Array.from(
    new Set(
      (text.toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g) ?? []).filter(
        (word) => !STOP_WORDS.has(word),
      ),
    ),
  ).slice(0, 6);
}

interface MemoryState {
  topics: Record<string, number>;
  struggles: string[];
  explained: string[];
  recordMessage: (text: string, context?: LessonContext) => void;
  recordExplanation: (text: string) => void;
  reset: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      topics: {},
      struggles: [],
      explained: [],
      recordMessage: (text, context) => {
        const lower = text.toLowerCase();
        const hits = topicsFrom(lower);
        const location = [context?.lessonTitle, context?.currentSection]
          .filter(Boolean)
          .join(" / ");
        const struggling = STRUGGLE_HINTS.test(lower) && hits.length > 0;
        if (hits.length === 0 && !struggling) return;
        set((state) => {
          const topics = { ...state.topics };
          for (const k of hits) topics[k] = (topics[k] ?? 0) + 1;
          const struggles = struggling
            ? Array.from(new Set([...state.struggles, location || hits[0]!])).slice(-6)
            : state.struggles;
          return { topics, struggles };
        });
      },
      recordExplanation: (text) => {
        const hits = topicsFrom(text);
        if (hits.length === 0) return;
        set((state) => ({
          explained: Array.from(new Set([...state.explained, ...hits])).slice(-8),
        }));
      },
      reset: () => set({ topics: {}, struggles: [], explained: [] }),
    }),
    { name: "panda-ai-memory", storage: createJSONStorage(() => toZustandStorage(userScopedAdapter)) },
  ),
);

/** Compact summary injected into the prompt so the AI adapts to the learner. */
export function memorySummary(): string {
  const { topics, struggles, explained } = useMemoryStore.getState();
  const parts: string[] = [];
  const top = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => `${topic} (${count}x)`);
  if (top.length > 0) parts.push(`asked about: ${top.join(", ")}`);
  if (struggles.length > 0) parts.push(`struggled with: ${struggles.join(", ")}`);
  if (explained.length > 0) parts.push(`explained: ${explained.join(", ")}`);
  return parts.join("; ");
}
