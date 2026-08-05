import { create } from "zustand";
import { runTurn, isAiConfigured } from "@/lib/ai/chat";
import { StreamInterruptedError, AiError } from "@/lib/ai/errors";
import type {
  AiProgressStatus,
  ChatMessage,
  LessonContext,
  StyleAction,
} from "@/lib/ai/types";
import { useAiContextStore } from "@/stores/aiContextStore";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Guards against rapid-fire submissions (Enter spam / double clicks). */
let lastSendAt = 0;
const MIN_SEND_GAP_MS = 350;

/** Abort controller for the in-flight request (clear()/cancel abort it). */
let pendingAbort: AbortController | null = null;

export interface SendOptions {
  /** Regenerate in this style (with a replaceId) instead of a fresh turn. */
  action?: StyleAction;
  /** Overwrite this existing assistant message in place. */
  replaceId?: string;
}

interface FailedTurn {
  message: string;
  action?: StyleAction;
  context: LessonContext;
  assistantId: string;
}

interface AiChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  /** Progress hint surfaced to the UI while a request runs. */
  status: AiProgressStatus | null;
  /** Fingerprint of the request currently in flight (duplicate suppression). */
  pendingKey: string | null;
  apiConfigured: boolean;
  failedTurn: FailedTurn | null;
  send: (text: string, opts?: SendOptions) => void;
  regenerate: (assistantId: string, action: StyleAction) => void;
  retry: () => void;
  clear: () => void;
}

export const useAiChatStore = create<AiChatState>()((set, get) => ({
  messages: [],
  isStreaming: false,
  status: null,
  pendingKey: null,
  apiConfigured: isAiConfigured(),
  failedTurn: null,

  send: (text, opts) => {
    if (get().isStreaming) return;
    const now = Date.now();
    if (now - lastSendAt < MIN_SEND_GAP_MS) return;
    lastSendAt = now;

    const context = useAiContextStore.getState().context;
    const state = get();
    const action = opts?.action;
    const replaceId = opts?.replaceId;
    const trimmed = text.trim();

    let promptText = trimmed;
    let history = state.messages;
    let assistantId = newId();

    if (replaceId) {
      // Regeneration: reuse the original question, drop this reply and any
      // turns after it from the conversation handed to the model.
      const index = state.messages.findIndex((m) => m.id === replaceId);
      if (index < 0) return;
      const prior = state.messages.slice(0, index);
      const lastUser = [...prior].reverse().find((m) => m.role === "user");
      if (!lastUser) return;
      promptText = lastUser.text;
      history = prior;
      assistantId = replaceId;
    } else if (!trimmed) {
      return;
    }

    // Same prompt + style already in flight → ignore (no duplicate API calls).
    const pendingKey = `${promptText}|${action ?? ""}`;
    if (state.pendingKey === pendingKey) return;

    const placeholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      streaming: true,
    };

    const messages = replaceId
      ? state.messages.map((m) => (m.id === replaceId ? placeholder : m))
      : [
          ...state.messages,
          { id: newId(), role: "user", text: promptText } satisfies ChatMessage,
          placeholder,
        ];

    set({ messages, isStreaming: true, status: null, pendingKey, failedTurn: null });

    // Own this request's cancellation so clear()/cancel() can kill the network
    // call (which now aborts the SDK stream, not just the local wait).
    pendingAbort?.abort();
    pendingAbort = new AbortController();
    const { signal } = pendingAbort;

    runTurn({
      message: promptText,
      action,
      context,
      history,
      signal,
      onToken: (fullText) => {
        if (signal.aborted) return;
        const messages = get().messages.map((m) =>
          m.id === assistantId ? { ...m, text: fullText } : m,
        );
        set({ messages });
      },
      onStatus: (status) => {
        if (signal.aborted) return;
        set({ status });
      },
    })
      .then(({ text }) => {
        if (signal.aborted) return;
        pendingAbort = null;
        const messages = get().messages.map((m) =>
          m.id === assistantId
            ? { ...m, text, streaming: false, error: false }
            : m,
        );
        set({ messages, isStreaming: false, status: null, pendingKey: null });
      })
      .catch((error: unknown) => {
        if (signal.aborted) return;
        pendingAbort = null;
        // A stream that was cut short after producing text: keep the partial
        // answer instead of showing an error. Never lose what was generated.
        if (error instanceof StreamInterruptedError) {
          const messages = get().messages.map((m) =>
            m.id === assistantId ? { ...m, streaming: false, error: false } : m,
          );
          set({ messages, isStreaming: false, status: null, pendingKey: null });
          return;
        }

        const userMessage =
          error instanceof AiError
            ? error.userMessage
            : "Something went wrong. Please try again.";
        const messages = get().messages.map((m) =>
          m.id === assistantId
            ? { ...m, text: userMessage, streaming: false, error: true }
            : m,
        );
        set({
          messages,
          isStreaming: false,
          status: null,
          pendingKey: null,
          failedTurn: { message: promptText, action, context, assistantId },
        });
      });
  },

  regenerate: (assistantId, action) => {
    get().send("", { action, replaceId: assistantId });
  },

  retry: () => {
    const failed = get().failedTurn;
    if (!failed) return;
    get().send(failed.message, {
      action: failed.action,
      replaceId: failed.assistantId,
    });
  },

  clear: () => {
    // Abort any in-flight request so it stops consuming quota/bandwidth.
    pendingAbort?.abort();
    pendingAbort = null;
    set({
      messages: [],
      isStreaming: false,
      status: null,
      pendingKey: null,
      failedTurn: null,
    });
  },
}));
