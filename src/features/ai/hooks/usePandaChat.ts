import { useCallback } from "react";
import { useAiChatStore } from "@/stores/aiChatStore";

/**
 * usePandaChat — a thin, ergonomic wrapper around the chat store so the UI
 * never touches the store directly. Keeps the chat contract in one place.
 */
export function usePandaChat() {
  const messages = useAiChatStore((state) => state.messages);
  const isStreaming = useAiChatStore((state) => state.isStreaming);
  const status = useAiChatStore((state) => state.status);
  const apiConfigured = useAiChatStore((state) => state.apiConfigured);
  const failedTurn = useAiChatStore((state) => state.failedTurn);
  const pinnedIds = useAiChatStore((state) => state.pinnedIds);

  const send = useAiChatStore((state) => state.send);
  const regenerate = useAiChatStore((state) => state.regenerate);
  const retry = useAiChatStore((state) => state.retry);
  const stop = useAiChatStore((state) => state.stop);
  const togglePinned = useAiChatStore((state) => state.togglePinned);
  const clear = useAiChatStore((state) => state.clear);

  /** Trim + send a message. Returns false when there's nothing to send. */
  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;
      send(trimmed);
      return true;
    },
    [send],
  );

  return {
    messages,
    isStreaming,
    status,
    apiConfigured,
    failedTurn,
    pinnedIds,
    submit,
    send,
    regenerate,
    retry,
    stop,
    togglePinned,
    clear,
  };
}
