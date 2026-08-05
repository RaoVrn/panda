/**
 * Fallback orchestrator.
 *
 * Wraps every registered provider and implements the reliability loop:
 *
 *   1. Build a route list (provider × model) in priority order, skipping
 *      providers that aren't configured, models the catalog knows are dead,
 *      and routes the health monitor has temporarily disabled.
 *   2. Try each healthy route in order, each with its OWN per-call timeout
 *      (`VITE_AI_TIMEOUT`). If a route fails, mark it unhealthy and fall
 *      through to the next. The learner just sees "Trying another model…".
 *   3. 429 handling (the reason users saw timeouts):
 *        · switch to the next model/provider immediately. A different model
 *          is usually not rate-limited,
 *        · only when EVERY route 429'd do we wait the server's exact
 *          RetryInfo retryDelay ("Waiting for AI availability…") before the
 *          next attempt,
 *        · the wait is bounded by the remaining overall budget.
 *   4. Other transient failures (5xx, network, timeout) back off
 *      exponentially (1s, 2s, 4s, 8s) up to `maxRetries`.
 *   5. A hard overall budget (`VITE_AI_MAX_TOTAL_MS`) bounds the whole
 *      request, including intentional waits, so nothing hangs forever.
 *   6. A stream that fails AFTER delivering tokens stops immediately and
 *      throws `StreamInterruptedError` with the partial text so the UI can
 *      preserve what was already generated.
 */

import { aiConfig } from "./config";
import {
  AiError,
  AllProvidersFailedError,
  ConfigError,
  QuotaUnavailableError,
  RateLimitError,
  StreamInterruptedError,
  TimeoutError,
  asAiError,
  isRetryable,
} from "./errors";
import type { HealthMonitor } from "./health";
import { aiLogger, estimatePayloadBytes } from "./logger";
import { backoffMs, withRetry } from "./retry";
import type { AIProvider, AIRequest, AIStreamCallbacks } from "./types";

export interface FallbackProviderOptions {
  providers: AIProvider[];
  health: HealthMonitor;
}

interface Route {
  provider: AIProvider;
  model: string;
}

function routeKey(route: Route): string {
  return `${route.provider.name}:${route.model}`;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new TimeoutError("The request was aborted before it could finish.");
  }
}

export class FallbackProvider {
  private readonly providers: AIProvider[];
  private readonly health: HealthMonitor;
  private readonly maxRetries = aiConfig.maxRetries;
  private readonly timeoutMs = aiConfig.timeoutMs;
  private readonly maxTotalMs = aiConfig.maxTotalMs;
  private readonly blockedProviders = new Set<string>();

  constructor({ providers, health }: FallbackProviderOptions) {
    this.providers = providers;
    this.health = health;
  }

  isConfigured(): boolean {
    return this.providers.some((provider) => provider.isConfigured());
  }

  /** Healthy, configured, known-available routes in priority order. */
  private healthyRoutes(): Route[] {
    return this.providers
      .filter((provider) => provider.isConfigured())
      .flatMap((provider) =>
        provider.models.map((model) => ({ provider, model }) as Route),
      )
      .filter(
        (route) =>
          !this.blockedProviders.has(route.provider.name) &&
          this.health.isHealthy(route.provider.name) &&
          route.provider.isModelAvailable?.(route.model) !== false &&
          this.health.isHealthy(routeKey(route)),
      );
  }

  async stream(request: AIRequest, callbacks: AIStreamCallbacks): Promise<string> {
    const { onToken, onStatus, onAttempt, signal: overall } = callbacks;

    onStatus?.("thinking");
    throwIfAborted(overall);

    if (this.healthyRoutes().length === 0) {
      if (!this.isConfigured()) {
        throw new ConfigError("No AI provider is configured.");
      }
      if (this.blockedProviders.size > 0) {
        throw new QuotaUnavailableError();
      }
      throw new AllProvidersFailedError();
    }

    const startedAt = performance.now();

    const result = await withRetry(
      async (attempt) => {
        const attemptRoutes = this.healthyRoutes();
        let lastError: AiError = new AllProvidersFailedError();
        // The largest RetryInfo retryDelay seen this attempt.
        let maxRetryAfterSeconds = 0;

        for (let index = 0; index < attemptRoutes.length; index += 1) {
          const route = attemptRoutes[index]!;
          if (this.blockedProviders.has(route.provider.name)) continue;
          const hasMoreRoutes = index < attemptRoutes.length - 1;

          throwIfAborted(overall);
          onStatus?.(
            attempt >= this.maxRetries ? "almost-there" : "thinking",
          );
          onAttempt?.(attempt);

          // Only the very first route in the first attempt is the primary
          // model. Everything else is fallback.
          const isFallback = attempt > 0 || index > 0;
          aiLogger.info({
            event: isFallback ? "ai.fallback.using" : "ai.model.using",
            requestId: request.requestId,
            provider: route.provider.name,
            model: route.model,
            attempt,
            retries: attempt,
            payloadBytes: estimatePayloadBytes(request),
          });

          // Per-call deadline: a single provider call can never exceed
          // `timeoutMs`, even if its SDK ignores the abort signal.
          const perCallController = new AbortController();
          let perCallTimer = 0;
          const perCallTimeout = new Promise<never>((_, reject) => {
            perCallTimer = window.setTimeout(() => {
              perCallController.abort();
              reject(
                new TimeoutError(`Provider call exceeded ${this.timeoutMs}ms.`),
              );
            }, this.timeoutMs);
          });

          let delivered = false;
          let lastText = "";
          const routeStarted = performance.now();

          try {
            const text = await Promise.race([
              route.provider.stream(request, route.model, {
                onToken: (full) => {
                  delivered = true;
                  lastText = full;
                  onToken(full);
                },
                signal: perCallController.signal,
              }),
              perCallTimeout,
            ]);

            this.health.markSuccess(routeKey(route));
            aiLogger.info({
              event: "ai.success",
              provider: route.provider.name,
              model: route.model,
              latencyMs: Math.round(performance.now() - routeStarted),
              attempt,
            });
            return text;
          } catch (error) {
            const aiError = asAiError(error);
            aiError.provider = route.provider.name;
            aiError.model = route.model;
            lastError = aiError;

            if (aiError instanceof QuotaUnavailableError) {
              // A quota with limit=0 is project/provider-wide, not model-wide.
              // A zero quota is provider-wide, not model-wide. Do not try the
              // remaining models of this provider or wait for RetryInfo.
              this.blockedProviders.add(route.provider.name);
              this.health.disable(route.provider.name, aiConfig.healthCooldownMs, "quota-unavailable");
              aiLogger.warn({
                event: "ai.provider.blocked",
                requestId: request.requestId,
                provider: route.provider.name,
                model: route.model,
                statusCode: aiError.statusCode,
                failureReason: aiError.kind,
                detail: "Provider quota is zero; skipping remaining routes for this provider.",
              });
              continue;
            }

            if (aiError.retryable) {
              this.health.markFailure(routeKey(route), aiError.kind);
              aiLogger.warn({
                event: "ai.route.failed",
                provider: route.provider.name,
                model: route.model,
                attempt,
                statusCode: aiError.statusCode,
                failureReason: aiError.kind,
                detail: "Provider route failed; see structured status and failureReason fields.",
              });
            }

            if (
              aiError instanceof RateLimitError &&
              aiError.retryAfterSeconds !== undefined
            ) {
              maxRetryAfterSeconds = Math.max(
                maxRetryAfterSeconds,
                aiError.retryAfterSeconds,
              );
            }

            // Never retry a stream that already produced output: overwriting
            // the partial text would lose the learner's content.
            if (delivered) {
              onToken(lastText);
              throw new StreamInterruptedError(aiError, lastText, {
                provider: route.provider.name,
                model: route.model,
              });
            }

            // Try the next route on this attempt (429 → switch models).
            if (hasMoreRoutes) onStatus?.("switching");
          } finally {
            window.clearTimeout(perCallTimer);
          }
        }

        // Every route failed on this attempt. Enforce the overall budget.
        const elapsedMs = performance.now() - startedAt;
        const remainingMs = this.maxTotalMs - elapsedMs;
        if (remainingMs <= 0) {
          throw lastError instanceof RateLimitError
            ? lastError
            : new TimeoutError("The overall AI request budget was exceeded.");
        }

        // 429 with a server-specified delay: wait exactly that long (bounded
        // by the budget left) before retrying, never spam immediate retries.
        if (maxRetryAfterSeconds > 0) {
          throw new RateLimitError("Every AI model is rate limited.", {
            retryAfterSeconds: Math.min(maxRetryAfterSeconds, remainingMs / 1000),
          });
        }

        throw lastError;
      },
      {
        maxRetries: this.maxRetries,
        signal: overall,
        shouldRetry: (error) => !overall?.aborted && isRetryable(error),
        delayFor: (attempt, error) => {
          // Honour the server's RetryInfo retryDelay exactly (with a 1s
          // floor) for 429s; otherwise exponential backoff.
          if (error instanceof RateLimitError && error.retryAfterSeconds) {
            return Math.max(1000, error.retryAfterSeconds * 1000);
          }
          return backoffMs(attempt, 1000, 8000);
        },
        onRetry: ({ attempt, error, delayMs }) => {
          const aiError = asAiError(error);
          onStatus?.(
            aiError instanceof RateLimitError ? "waiting" : "almost-there",
          );
          aiLogger.warn({
            event: "ai.retry",
            attempt,
            retries: attempt + 1,
            statusCode: aiError.statusCode,
            failureReason: aiError.kind,
            detail: `${error instanceof Error ? error.message : String(error)} (waiting ${delayMs}ms)`,
          });
        },
      },
    );

    return result;
  }
}
