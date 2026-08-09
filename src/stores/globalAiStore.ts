import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toZustandStorage, userScopedAdapter } from "@/features/progress/localStorage";
import { runTurn, isAiConfigured } from "@/lib/ai/chat";
import { StreamInterruptedError, AiError } from "@/lib/ai/errors";
import type { ChatMessage } from "@/lib/ai/types";
import { allLessons } from "@/content/lessons";
import { useProgressStore } from "@/features/progress/progressStore";
import { buildGlobalContext } from "@/features/ai/global/globalContext";
import { normalizeResponse } from "@/features/ai/ResponseParser";
import {
  listChatSessions,
  fetchChatMessages,
  upsertChatSession,
  replaceChatMessages,
  deleteChatSession,
  type ChatSessionMeta,
} from "@/features/ai/services/chatService";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Guards against rapid-fire submissions. */
let lastSendAt = 0;
const MIN_SEND_GAP_MS = 350;

/** Abort controller for the in-flight global request. */
let pendingAbort: AbortController | null = null;

/** Debounced push to Supabase (skipped entirely when unconfigured). */
let syncTimer: number | undefined;
/** True when local changes have not yet been pushed to Supabase. */
let syncDirty = false;
let retryTimer: number | undefined;

/** Meaningful dev logging for persistence problems (never in production). */
function logChatError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[panda-ai:${context}]`, error instanceof Error ? error.message : error);
  }
}

export interface AiChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  archived: boolean;
  messages: ChatMessage[];
  feedback: Record<string, "like" | "dislike">;
  bookmarks: string[];
  /** Context tags detected from the first message (git | panda | lesson). */
  tags: string[];
  /** Saved scroll offset of the conversation, restored on reopen. */
  scrollTop?: number;
}

type Rating = "like" | "dislike";

interface FailedGlobalTurn {
  message: string;
  context: ReturnType<typeof buildGlobalContext>;
  assistantId: string;
}

interface GlobalAiState {
  sessions: AiChatSession[];
  activeSessionId: string | null;
  userId: string | null;
  /** Unsent input, restored after a refresh (like ChatGPT). */
  draft: string;
  isStreaming: boolean;
  status: string | null;
  pendingKey: string | null;
  apiConfigured: boolean;
  failedTurn: FailedGlobalTurn | null;
  bindUser: (userId: string | null) => void;
  setDraft: (text: string) => void;
  /** Immediately push pending changes to Supabase (best effort). */
  flush: () => void;
  send: (text: string) => void;
  regenerate: (assistantId: string) => void;
  retry: () => void;
  continueTurn: () => void;
  stop: () => void;
  newChat: () => void;
  openSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  duplicateSession: (sessionId: string) => void;
  togglePin: (sessionId: string) => void;
  toggleArchive: (sessionId: string) => void;
  setFeedback: (messageId: string, rating: Rating | null) => void;
  toggleBookmark: (messageId: string) => void;
  setScrollTop: (sessionId: string, scrollTop: number) => void;
}

export const useGlobalAiStore = create<GlobalAiState>()(  persist(
    (set, get) => {
      /** Returns the active session or creates one lazily. */
      const ensureSession = (): AiChatSession => {
        const state = get();
        const existing = state.sessions.find((s) => s.id === state.activeSessionId);
        if (existing) return existing;
        const session: AiChatSession = {
          id: newId(),
          title: "Untitled chat",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          pinned: false,
          archived: false,
          messages: [],
          feedback: {},
          bookmarks: [],
          tags: [],
        };
        set((s) => ({
          sessions: [session, ...s.sessions],
          activeSessionId: session.id,
        }));
        return session;
      };

      /** Immutably patch a session, returning the new sessions array. */
      const patch = (
        sessionId: string,
        fn: (session: AiChatSession) => AiChatSession,
      ) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? fn(s) : s,
          ),
        }));

      const scheduleSync = (delay = 300) => {
        if (!get().userId) {
          syncDirty = true;
          return;
        }
        syncDirty = true;
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => {
          syncTimer = undefined;
          void syncAll(get().userId!)
            .then(() => {
              syncDirty = false;
            })
            .catch((error: unknown) => {
              logChatError("sync", error);
              // Retry automatically; when the connection returns, everything
              // flushes. Local persistence guarantees nothing is ever lost.
              window.clearTimeout(retryTimer);
              retryTimer = window.setTimeout(() => {
                retryTimer = undefined;
                scheduleSync(1500);
              }, 5000);
            });
        }, delay);
      };

      const syncAll = async (userId: string): Promise<void> => {
        const { sessions } = get();
        for (const session of sessions) {
          await upsertChatSession(userId, session);
          await replaceChatMessages(session.id, session.messages);
        }
      };

      /** Loads conversations from Supabase (newest first) and merges locally. */
      const loadFromSupabase = async (userId: string) => {
        try {
          const metas = await listChatSessions(userId);
          const loaded: AiChatSession[] = [];
          for (const meta of metas) {
            const messages = await fetchChatMessages(meta.id);
            loaded.push(toSession(meta, messages));
          }
          if (loaded.length === 0) return;
          set((state) => {
            // Keep local sessions (this device is most current); add any that
            // exist remotely but not locally. No messages are ever lost.
            const merged = [...state.sessions];
            for (const remote of loaded) {
              if (!merged.some((m) => m.id === remote.id)) merged.push(remote);
            }
            return {
              sessions: merged,
              activeSessionId:
                state.activeSessionId && merged.some((m) => m.id === state.activeSessionId)
                  ? state.activeSessionId
                  : loaded[0]?.id ?? state.activeSessionId,
            };
          });
          // Push any local-only conversations up so other devices see them.
          scheduleSync(0);
        } catch (error) {
          logChatError("load", error);
          // Unconfigured or offline: rely on local persistence.
        }
      };

      /** Builds the "context used" badges for transparency. */
      const badgesFor = (context: ReturnType<typeof buildGlobalContext>): string[] => {
        const badges: string[] = [];
        if (context.userName || context.userEmail) badges.push("Panda Profile");
        if (context.completedCount !== undefined || context.xp !== undefined) {
          badges.push("Current Progress");
        }
        if (context.achievementsSummary) badges.push("Achievements");
        if (context.lessonTitle || context.contextReady) badges.push("Lesson Context");
        if (context.memory) badges.push("Learning History");
        badges.push("Git Knowledge");
        return badges;
      };

      /** Shared turn runner for send / regenerate / retry. */
      const runTurnInto = (
        promptText: string,
        context: ReturnType<typeof buildGlobalContext>,
        history: ChatMessage[],
        sessionId: string,
        assistantId: string,
      ) => {
        const update = (fn: (msg: ChatMessage) => ChatMessage) => {
          patch(sessionId, (s) => ({
            ...s,
            updatedAt: Date.now(),
            messages: s.messages.map((m) => (m.id === assistantId ? fn(m) : m)),
          }));
        };

        pendingAbort?.abort();
        pendingAbort = new AbortController();
        const { signal } = pendingAbort;

        runTurn({
          message: promptText,
          context,
          history,
          mode: "global",
          signal,
          onToken: (fullText) => {
            if (signal.aborted) return;
            update((m) => ({ ...m, text: normalizeResponse(fullText) }));
          },
        })
          .then(({ text }) => {
            if (signal.aborted) return;
            pendingAbort = null;
            update((m) => ({
              ...m,
              text: normalizeResponse(text),
              streaming: false,
              error: false,
            }));
            set({ isStreaming: false, status: null, pendingKey: null, failedTurn: null });
            scheduleSync(0);
          })
          .catch((error: unknown) => {
            if (signal.aborted) return;
            pendingAbort = null;
            if (error instanceof StreamInterruptedError) {
              update((m) => ({ ...m, streaming: false, error: false }));
              set({ isStreaming: false, status: null, pendingKey: null, failedTurn: null });
              scheduleSync(0);
              return;
            }
            const userMessage =
              error instanceof AiError
                ? error.userMessage
                : "Something went wrong. Please try again.";
            update((m) => ({ ...m, text: userMessage, streaming: false, error: true }));
            set({
              isStreaming: false,
              status: null,
              pendingKey: null,
              failedTurn: { message: promptText, context, assistantId },
            });
            scheduleSync(0);
          });
      };

      return {
        sessions: [],
        activeSessionId: null,
        userId: null,
        draft: "",
        isStreaming: false,
        status: null,
        pendingKey: null,
        apiConfigured: isAiConfigured(),
        failedTurn: null,

        bindUser: (userId) => {
          if (userId === get().userId) return;
          set({ userId });
          if (userId) void loadFromSupabase(userId);
        },

        setDraft: (text) => set({ draft: text }),

        flush: () => {
          const userId = get().userId;
          if (!userId) return;
          window.clearTimeout(syncTimer);
          syncTimer = undefined;
          syncDirty = true;
          void syncAll(userId)
            .then(() => {
              syncDirty = false;
            })
            .catch((error: unknown) => {
              logChatError("flush", error);
              window.clearTimeout(retryTimer);
              retryTimer = window.setTimeout(() => {
                retryTimer = undefined;
                scheduleSync(1500);
              }, 5000);
            });
        },

        send: (text) => {
          if (get().isStreaming) return;
          const now = Date.now();
          if (now - lastSendAt < MIN_SEND_GAP_MS) return;
          lastSendAt = now;

          const trimmed = text.trim();
          if (!trimmed) return;
          if (get().pendingKey === trimmed) return;

          const context = buildGlobalContext();
          const badges = badgesFor(context);
          const session = ensureSession();
          const sessionId = session.id;
          const assistantId = newId();
          const firstMessage = session.messages.length === 0;

          useProgressStore.getState().recordAiQuestion();

          const userMessage: ChatMessage = {
            id: newId(),
            role: "user",
            text: trimmed,
            createdAt: Date.now(),
          };
          const placeholder: ChatMessage = {
            id: assistantId,
            role: "assistant",
            text: "",
            streaming: true,
            createdAt: Date.now(),
            badges,
          };

          set((state) => ({
            isStreaming: true,
            status: null,
            pendingKey: trimmed,
            failedTurn: null,
            sessions: state.sessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    title: firstMessage ? generateTitle(trimmed) : s.title,
                    tags: firstMessage ? detectTags(trimmed) : s.tags,
                    updatedAt: Date.now(),
                    messages: [...s.messages, userMessage, placeholder],
                  }
                : s,
            ),
          }));

          runTurnInto(
            trimmed,
            context,
            get().sessions.find((s) => s.id === sessionId)?.messages ?? [],
            sessionId,
            assistantId,
          );
          // Save the user message + placeholder to Supabase immediately.
          scheduleSync(0);
        },

        regenerate: (assistantId) => {
          const state = get();
          const session = state.sessions.find((s) => s.id === state.activeSessionId);
          if (!session || state.isStreaming) return;
          const index = session.messages.findIndex((m) => m.id === assistantId);
          if (index < 0) return;
          const prior = session.messages.slice(0, index);
          const lastUser = [...prior].reverse().find((m) => m.role === "user");
          if (!lastUser) return;
          const context = buildGlobalContext();
          const badges = badgesFor(context);
          patch(session.id, (s) => ({
            ...s,
            updatedAt: Date.now(),
            messages: [
              ...prior,
              {
                id: assistantId,
                role: "assistant",
                text: "",
                streaming: true,
                createdAt: Date.now(),
                badges,
              } satisfies ChatMessage,
            ],
          }));
          set({ isStreaming: true, status: null, pendingKey: `regen-${assistantId}`, failedTurn: null });
          runTurnInto(lastUser.text, context, prior, session.id, assistantId);
          scheduleSync();
        },

        retry: () => {
          const failed = get().failedTurn;
          const state = get();
          const session = state.sessions.find((s) => s.id === state.activeSessionId);
          if (!failed || !session || state.isStreaming) return;
          patch(session.id, (s) => ({
            ...s,
            updatedAt: Date.now(),
            messages: s.messages.map((m) =>
              m.id === failed.assistantId
                ? { ...m, text: "", streaming: true, error: false }
                : m,
            ),
          }));
          set({ isStreaming: true, status: null, pendingKey: `retry-${failed.message}`, failedTurn: null });
          runTurnInto(failed.message, failed.context, session.messages, session.id, failed.assistantId);
          scheduleSync();
        },

        continueTurn: () => {
          get().send("Continue where you left off.");
        },

        stop: () => {
          pendingAbort?.abort();
          pendingAbort = null;
          const session = get().sessions.find((s) => s.id === get().activeSessionId);
          if (session) {
            patch(session.id, (s) => ({
              ...s,
              updatedAt: Date.now(),
              messages: s.messages.map((m) =>
                m.streaming ? { ...m, streaming: false } : m,
              ),
            }));
          }
          set({ isStreaming: false, status: null, pendingKey: null });
        },

        newChat: () => {
          pendingAbort?.abort();
          pendingAbort = null;
          set({ activeSessionId: null, isStreaming: false, status: null, pendingKey: null, failedTurn: null });
        },

        openSession: (sessionId) => {
          if (get().isStreaming) return;
          pendingAbort?.abort();
          pendingAbort = null;
          set({ activeSessionId: sessionId, isStreaming: false, status: null, pendingKey: null, failedTurn: null });
        },

        deleteSession: (sessionId) => {
          pendingAbort?.abort();
          pendingAbort = null;
          const { userId } = get();
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== sessionId),
            activeSessionId:
              state.activeSessionId === sessionId ? null : state.activeSessionId,
          }));
          if (userId) void deleteChatSession(sessionId).catch(() => {});
        },

        renameSession: (sessionId, title) => {
          const trimmed = title.trim();
          if (!trimmed) return;
          patch(sessionId, (s) => ({ ...s, title: trimmed, updatedAt: Date.now() }));
          scheduleSync();
        },

        duplicateSession: (sessionId) => {
          const session = get().sessions.find((s) => s.id === sessionId);
          if (!session) return;
          const copy: AiChatSession = {
            ...session,
            id: newId(),
            title: `${session.title} (copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            pinned: false,
            archived: false,
            feedback: {},
            bookmarks: [],
            tags: session.tags,
            messages: session.messages.map((m) => ({
              ...m,
              id: newId(),
              streaming: false,
            })),
          };
          set((state) => ({
            sessions: [copy, ...state.sessions],
            activeSessionId: copy.id,
          }));
          scheduleSync();
        },

        togglePin: (sessionId) => {
          patch(sessionId, (s) => ({ ...s, pinned: !s.pinned, updatedAt: Date.now() }));
          scheduleSync();
        },

        toggleArchive: (sessionId) => {
          patch(sessionId, (s) => ({ ...s, archived: !s.archived, updatedAt: Date.now() }));
          scheduleSync();
        },

        setFeedback: (messageId, rating) => {
          const session = get().sessions.find((s) => s.id === get().activeSessionId);
          if (!session) return;
          patch(session.id, (s) => {
            const feedback = { ...s.feedback };
            if (rating === null) delete feedback[messageId];
            else feedback[messageId] = rating;
            return { ...s, feedback, updatedAt: Date.now() };
          });
          scheduleSync();
        },

        toggleBookmark: (messageId) => {
          const session = get().sessions.find((s) => s.id === get().activeSessionId);
          if (!session) return;
          patch(session.id, (s) => ({
            ...s,
            bookmarks: s.bookmarks.includes(messageId)
              ? s.bookmarks.filter((id) => id !== messageId)
              : [...s.bookmarks, messageId],
            updatedAt: Date.now(),
          }));
          scheduleSync();
        },

        setScrollTop: (sessionId, scrollTop) => {
          patch(sessionId, (s) => ({ ...s, scrollTop }));
        },
      };
    },
    {
      name: "panda-global-ai",
      version: 3,
      storage: createJSONStorage(() => toZustandStorage(userScopedAdapter)),
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        draft: state.draft,
      }),
      migrate: (persisted) => {
        const prev = (persisted ?? {}) as {
          sessions?: Array<Partial<AiChatSession>>;
          activeSessionId?: string | null;
          draft?: string;
        };
        const old = prev.sessions ?? [];
        return {
          sessions: old.map((s) => ({
            id: s.id ?? newId(),
            title: s.title ?? "Untitled chat",
            createdAt: s.createdAt ?? Date.now(),
            updatedAt: s.updatedAt ?? Date.now(),
            pinned: s.pinned ?? false,
            archived: s.archived ?? false,
            messages: s.messages ?? [],
            feedback: s.feedback ?? {},
            bookmarks: s.bookmarks ?? [],
            tags: s.tags ?? [],
            scrollTop: s.scrollTop ?? 0,
          })),
          activeSessionId: prev.activeSessionId ?? null,
          draft: prev.draft ?? "",
        };
      },
    },
  ),
);

// Push any pending conversation changes when the tab closes, so nothing is
// ever lost on a refresh or crash (local persistence covers the sync gap).
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    useGlobalAiStore.getState().flush();
  });
  // Safety net: if a push failed while offline, retry when the tab regains
  // focus so a laptop coming back online syncs everything automatically.
  window.addEventListener("focus", () => {
    if (useGlobalAiStore.getState().userId && syncDirty) {
      useGlobalAiStore.getState().flush();
    }
  });
}

function toSession(
  meta: ChatSessionMeta,
  messages: ChatMessage[],
): AiChatSession {
  const firstUser = messages.find((m) => m.role === "user")?.text;
  return {
    id: meta.id,
    title: meta.title,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    pinned: meta.pinned,
    archived: meta.archived,
    messages,
    feedback: meta.feedback,
    bookmarks: meta.bookmarks,
    tags: meta.tags.length > 0 ? meta.tags : firstUser ? detectTags(firstUser) : [],
  };
}

/** Context tags for a session, derived from the first user message. */
export function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  const gitTerms = [
    "git", "commit", "branch", "merge", "rebase", "stash", "remote", "push",
    "pull", "clone", "github", "repo", "repository", "terminal", "diff", "log",
    "checkout", "fetch", "tag", "ignore", "reset", "revert", "cherry", "squash",
    "conflict", "ssh", "head", "config",
  ];
  const pandaTerms = [
    "profile", "settings", "achievement", "badge", "dashboard", "xp", "streak",
    "avatar", "name", "bookmark", "roadmap", "panda", "progress", "level",
    "password", "account", "quiz", "lesson", "course", "search", "reset",
  ];
  const tags: string[] = [];
  if (gitTerms.some((term) => lower.includes(term))) tags.push("git");
  if (pandaTerms.some((term) => lower.includes(term))) tags.push("panda");
  // A named lesson reference earns a "lesson" badge.
  if (allLessons().some((l) => lower.includes(l.title.toLowerCase()))) tags.push("lesson");
  if (tags.length === 0) tags.push("general");
  return tags;
}

const STOP_WORDS = new Set(
  "a an and are can did do does for from how i in is it my of on or please tell that the their them there these they this to us want we what when where which who why with you your would should should i'd i've im".split(
    " ",
  ),
);

/** A short, readable auto-title from the first user message. */
export function generateTitle(firstUserText: string): string {
  const words = firstUserText
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const keep: string[] = [];
  for (const word of words) {
    if (keep.length >= 5) break;
    if (word.length >= 3 && !STOP_WORDS.has(word)) keep.push(word);
  }
  if (keep.length === 0) keep.push(...words.slice(0, 4));
  return keep.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export type { Rating };
