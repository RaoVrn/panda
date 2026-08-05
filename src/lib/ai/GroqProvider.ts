/**
 * Groq provider.
 *
 * The single active AI provider for Panda AI. Uses the official `groq-sdk`
 * (OpenAI-compatible chat completions) with streaming. Failures are classified
 * into typed `AiError`s so no raw vendor error ever reaches the UI.
 *
 * Model availability is checked against Groq's live model list (prefetched at
 * startup by `validation.ts`); unknown models are skipped before any call.
 */

import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { aiConfig } from "./config";
import {
  AiError,
  ConfigError,
  InvalidResponseError,
  ModelUnavailableError,
  NetworkError,
  QuotaUnavailableError,
  RateLimitError,
  TimeoutError,
  UnknownAIError,
} from "./errors";
import { aiLogger, estimatePayloadBytes } from "./logger";
import type { AIProvider, AIRequest, AIStreamCallbacks } from "./types";

function apiKey(): string {
  return import.meta.env.VITE_GROQ_API_KEY?.trim() ?? "";
}

/* ------------------------------------------------------------------ */
/* Model availability (prefetched, shared)                             */
/* ------------------------------------------------------------------ */

let availableModels: Set<string> | null = null;

/** Fetches and caches Groq's model list. Called at startup; non-blocking. */
export async function prefetchGroqModels(): Promise<void> {
  const key = apiKey();
  if (!key) {
    availableModels = null;
    return;
  }
  try {
    const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
    const page = await client.models.list();
    const ids = page.data.map((model) => model.id);
    availableModels = new Set(ids);
    aiLogger.info({
      event: "ai.groq.models",
      detail: `${ids.length} models available`,
    });
  } catch (error) {
    availableModels = null;
    aiLogger.warn({
      event: "ai.groq.models-failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Advisory: false when a model is known to not exist; undefined when unknown. */
export function groqModelAvailable(model: string): boolean | undefined {
  if (availableModels === null) return undefined;
  return availableModels.has(model);
}

/* ------------------------------------------------------------------ */
/* Error classification                                                */
/* ------------------------------------------------------------------ */

interface GroqFailure {
  status?: number;
  message?: string;
  error?: { message?: string; type?: string };
}

/** Best-effort parse of Groq's "Please retry after N seconds" hint. */
function parseRetryAfterSeconds(failure: GroqFailure): number | undefined {
  const text = `${failure.error?.message ?? ""} ${failure.message ?? ""}`;
  const match = /(?:retry after|try again in|wait)\s+(\d+(?:\.\d+)?)\s*s/i.exec(
    text,
  );
  return match ? Number(match[1]) : undefined;
}

function classify(failure: GroqFailure): AiError {
  const status = failure.status;
  const message = failure.error?.message ?? failure.message ?? "";
  const text = `${status ?? ""} ${message}`;
  const base = { statusCode: status, cause: failure } as const;

  if (/quota|limit:\s*0|You exceeded your current quota/i.test(text)) {
    return new QuotaUnavailableError(message || "Groq quota is exhausted.", base);
  }
  if (status === 429 || /rate.?limit|too many requests/i.test(text)) {
    return new RateLimitError(message || "Rate limited by Groq.", {
      ...base,
      retryAfterSeconds: parseRetryAfterSeconds(failure),
    });
  }
  if (status === 401 || status === 403 || /invalid api key|authentication/i.test(text)) {
    return new ConfigError("The Groq API key was rejected.", base);
  }
  if (status === 404 || /model.*not found/i.test(text)) {
    return new ModelUnavailableError(message || "Groq model not found.", base);
  }
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return new UnknownAIError("The Groq service is having trouble.", base);
  }
  if (/network|fetch failed|ECONNRESET|ECONNREFUSED|load failed|socket|timed out/i.test(text)) {
    return new NetworkError(message || "Network failure reaching Groq.", base);
  }
  return new UnknownAIError(message || "Unexpected Groq error.", base);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new TimeoutError("The Groq request was aborted.");
  }
}

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  readonly models: string[] = aiConfig.groqModels;

  private clientInstance: Groq | null = null;

  isConfigured(): boolean {
    return apiKey().length > 0;
  }

  isModelAvailable(model: string): boolean | undefined {
    return groqModelAvailable(model);
  }

  private client(): Groq {
    if (!this.clientInstance) {
      this.clientInstance = new Groq({
        apiKey: apiKey(),
        dangerouslyAllowBrowser: true,
      });
    }
    return this.clientInstance;
  }

  async stream(
    request: AIRequest,
    model: string,
    { onToken, signal }: AIStreamCallbacks,
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new ConfigError("No Groq API key is configured.", {
        provider: this.name,
        model,
      });
    }
    if (groqModelAvailable(model) === false) {
      throw new ModelUnavailableError(`Model "${model}" is not available.`, {
        provider: this.name,
        model,
        statusCode: 404,
      });
    }

    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const started = performance.now();

    aiLogger.info({
      event: "ai.groq.request",
      requestId: request.requestId,
      provider: this.name,
      model,
      endpoint,
      payloadBytes: estimatePayloadBytes(request),
      detail: "headers: authorization=[redacted] content-type=application/json",
    });

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: request.systemPrompt },
      ...request.history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user", content: request.prompt },
    ];

    let full = "";

    try {
      const stream = await this.client().chat.completions.create(
        { model, messages, stream: true },
        { signal },
      );

      for await (const chunk of stream) {
        throwIfAborted(signal);
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onToken(full);
        }
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new TimeoutError("The Groq request was aborted.", {
          provider: this.name,
          model,
        });
      }
      const classified =
        error instanceof AiError ? error : classify(error as GroqFailure);
      aiLogger.error({
        event: "ai.groq.failed",
        requestId: request.requestId,
        provider: this.name,
        model,
        statusCode: classified.statusCode,
        failureReason: classified.kind,
        latencyMs: Math.round(performance.now() - started),
        detail: "Groq request failed; see structured status and failureReason fields.",
      });
      throw classified;
    }

    throwIfAborted(signal);

    aiLogger.info({
      event: "ai.groq.done",
      requestId: request.requestId,
      provider: this.name,
      model,
      latencyMs: Math.round(performance.now() - started),
      payloadBytes: full.length,
    });

    if (full.trim().length === 0) {
      throw new InvalidResponseError("Groq returned an empty response.", {
        retryable: true,
        provider: this.name,
        model,
      });
    }

    return full;
  }
}
