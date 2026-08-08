/**
 * Chat orchestration: the single function the store calls to run one turn.
 * Everything routes through `AIService`. No component talks to a provider
 * SDK directly. History is truncated to the last 8 messages to stay within
 * the free-tier input-token budget.
 */

import { aiService, newRequestId } from "./ai-service";
import { buildSystemPrompt, buildUserPrompt } from "./promptBuilder";
import { buildGlobalSystemPrompt, buildGlobalUserPrompt } from "./globalPrompt";
import { getCached, setCached } from "./Cache";
import { aiLogger } from "./logger";
import { estimateRequestTokens, formatTokenSummary } from "./TokenEstimator";
import type {
  AIMessage,
  AiProgressStatus,
  ChatMessage,
  LessonContext,
  StyleAction,
} from "./types";

/** True when a provider + key is available to make requests. */
export function isAiConfigured(): boolean {
  return aiService.isConfigured();
}

/* ------------------------------------------------------------------ */
/* History mapping (capped at 8 messages)                              */
/* ------------------------------------------------------------------ */

const MAX_HISTORY_TURNS = 8;

/** Visible chat → provider-neutral messages. Error notices skipped; capped. */
export function toChatHistory(messages: ChatMessage[]): AIMessage[] {
  return messages
    .filter(
      (message) =>
        !message.error && message.text.trim().length > 0,
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((message) => ({
      role: message.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: message.text,
    }));
}

/* ------------------------------------------------------------------ */
/* One turn                                                            */
/* ------------------------------------------------------------------ */

export interface RunTurnOptions {
  message: string;
  action?: StyleAction;
  context: LessonContext;
  history: ChatMessage[];
  /** "lesson" = contextual tutor; "global" = app-wide assistant. */
  mode?: "lesson" | "global";
  onToken: (fullText: string) => void;
  onStatus?: (status: AiProgressStatus) => void;
  signal?: AbortSignal;
}

export interface RunTurnResult {
  text: string;
  fromCache: boolean;
}

export async function runTurn({
  message,
  action,
  context,
  history,
  mode = "lesson",
  onToken,
  onStatus,
  signal,
}: RunTurnOptions): Promise<RunTurnResult> {
  const userText = message.trim();

  // Short-circuit identical questions within the same context.
  const cached = getCached(userText, action, context);
  if (cached !== undefined) {
    onToken(cached);
    return { text: cached, fromCache: true };
  }

  const aiHistory = toChatHistory(history);
  const prompt =
    mode === "global"
      ? buildGlobalUserPrompt(userText, context)
      : buildUserPrompt(userText, context, action);

  // Log estimated input tokens so we can spot quota exhaustion early.
  const systemPrompt =
    mode === "global" ? buildGlobalSystemPrompt() : buildSystemPrompt();
  const stats = estimateRequestTokens({
    system: systemPrompt,
    history: JSON.stringify(aiHistory),
    prompt,
  });
  aiLogger.info({
    event: "ai.turn.tokens",
    estimatedTokens: stats.estimatedTokens,
    characters: stats.chars,
    detail: formatTokenSummary(stats),
  });

  const text = await aiService.stream(
    {
      requestId: newRequestId(),
      systemPrompt,
      history: aiHistory,
      prompt,
    },
    { onToken, onStatus, signal },
  );

  // Cache a *complete* reply, never a partial or aborted one.
  if (text.trim().length > 0 && !signal?.aborted) {
    setCached(userText, action, context, text);
  }

  return { text, fromCache: false };
}
