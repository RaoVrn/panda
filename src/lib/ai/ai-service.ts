/**
 * AIService, the single entry point for Panda AI.
 *
 * No React component (or the chat store) talks to a vendor SDK directly; every
 * request goes through here. AIService wires together:
 *
 *   · the provider registry (Groq now; OpenAI / Claude / OpenRouter plug in
 *     by implementing `AIProvider` and adding one line to `createProviders`),
 *   · the health monitor (auto-disables flaky routes, auto-recovers),
 *   · the fallback orchestrator (model + provider fallback, exponential
 *     backoff, partial-stream preservation),
 *   · a hard deadline so no request ever hangs,
 *   · structured logging.
 */

import { aiConfig, type AIConfig } from "./config";
import {
  ConfigError,
  TimeoutError,
  asAiError,
} from "./errors";
import { FallbackProvider } from "./fallback-provider";
import { GroqProvider } from "./GroqProvider";
import { HealthMonitor } from "./health";
import { aiLogger, estimatePayloadBytes } from "./logger";
import { validateAiConfig } from "./validation";
import type { AIProvider, AIRequest, AIStreamCallbacks } from "./types";

/** Unique request id; falls back when crypto.randomUUID is unavailable. */
export function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Registers providers based on env. Add new providers here. */
export function createProviders(config: AIConfig): AIProvider[] {
  const providers: AIProvider[] = [];
  const enabled = config.provider.split(",").map((p) => p.trim());

  if (enabled.includes("groq")) {
    providers.push(new GroqProvider());
  }
  // Future providers (each needs a class implementing `AIProvider`):
  // if (enabled.includes("openai")) providers.push(new OpenAIProvider());
  // if (enabled.includes("claude")) providers.push(new ClaudeProvider());
  // if (enabled.includes("openrouter")) providers.push(new OpenRouterProvider());

  return providers;
}

export class AIService {
  readonly health: HealthMonitor;
  private readonly config: AIConfig;
  private readonly providers: AIProvider[];
  private readonly fallback: FallbackProvider;
  /** Identical prompts currently in flight share one API call. */
  private readonly inflight = new Map<string, Promise<string>>();

  private constructor(config: AIConfig) {
    this.config = config;
    this.health = new HealthMonitor({
      threshold: config.healthThreshold,
      cooldownMs: config.healthCooldownMs,
    });
    this.providers = createProviders(config);
    this.fallback = new FallbackProvider({
      providers: this.providers,
      health: this.health,
    });
  }

  static create(): AIService {
    return new AIService(aiConfig);
  }

  /** True when at least one provider can make a request. */
  isConfigured(): boolean {
    return this.providers.some((provider) => provider.isConfigured());
  }

  /** Provider/model overview for debug panels. Never sensitive data. */
  status(): Array<{
    name: string;
    models: string[];
    configured: boolean;
  }> {
    return this.providers.map((provider) => ({
      name: provider.name,
      models: provider.models,
      configured: provider.isConfigured(),
    }));
  }

  /**
   * Streams one completion with full reliability: provider/model fallback,
   * exponential retries, health-aware route selection and a hard deadline.
   * Identical prompts in flight share the same request (no duplicate API
   * calls). Every request gets a UUID and logs its lifecycle.
   */
  async stream(request: AIRequest, callbacks: AIStreamCallbacks): Promise<string> {
    if (!this.isConfigured()) {
      throw new ConfigError("No AI provider is configured.");
    }

    const key = request.prompt;
    const existing = this.inflight.get(key);
    if (existing) {
      aiLogger.warn({
        event: "ai.duplicate.suppressed",
        requestId: request.requestId,
        detail: `Same prompt already in flight (${request.requestId.slice(0, 8)}); reusing it.`,
      });
      return existing;
    }

    const promise = this.dispatch(request, callbacks);
    this.inflight.set(key, promise);
    try {
      return await promise;
    } finally {
      this.inflight.delete(key);
    }
  }

  private async dispatch(
    request: AIRequest,
    callbacks: AIStreamCallbacks,
  ): Promise<string> {
    const controller = new AbortController();
    const started = performance.now();
    let timer = 0;
    let lastAttempt = 0;

    aiLogger.info({
      event: "ai.request.started",
      requestId: request.requestId,
      payloadBytes: estimatePayloadBytes(request),
      estimatedTokens: Math.ceil(estimatePayloadBytes(request) / 4),
      characters: estimatePayloadBytes(request),
      detail: `providers=${this.providers.map((p) => p.name).join(",")} models=${this.providers.flatMap((p) => p.models).join(",")}`,
    });

    // Overall budget for the whole request (per-call timeouts live in the
    // fallback provider, which also waits for 429 RetryInfo delays). This
    // race is the final safety net so nothing ever hangs, even if a provider
    // SDK ignores its abort signal.
    const deadline = new Promise<never>((_, reject) => {
      timer = window.setTimeout(() => {
        controller.abort();
        reject(
          new TimeoutError(
            `Request exceeded the overall budget of ${this.config.maxTotalMs}ms.`,
          ),
        );
      }, this.config.maxTotalMs);
    });

    try {
      const text = await Promise.race([
        this.fallback.stream(request, {
          ...callbacks,
          signal: controller.signal,
          onAttempt: (attempt) => {
            lastAttempt = Math.max(lastAttempt, attempt);
            callbacks.onAttempt?.(attempt);
          },
        }),
        deadline,
      ]);
      aiLogger.info({
        event: "ai.request.finished",
        requestId: request.requestId,
        latencyMs: Math.round(performance.now() - started),
        retries: lastAttempt,
      });
      return text;
    } catch (error) {
      const aiError = asAiError(error);
      aiLogger.error({
        event: "ai.request.failed",
        requestId: request.requestId,
        statusCode: aiError.statusCode,
        failureReason: aiError.kind,
        latencyMs: Math.round(performance.now() - started),
        retries: lastAttempt,
        detail: aiError.message,
      });
      throw aiError;
    } finally {
      window.clearTimeout(timer);
    }
  }
}

/** Process-wide singleton used by the chat store. */
export const aiService = AIService.create();

// Validate configuration once at startup (key present, providers known,
// configured models available). Warnings only, never blocks the app.
void validateAiConfig();
