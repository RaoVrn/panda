/**
 * Exponential backoff retry helper.
 *
 * Used by the fallback orchestrator to re-run an attempt when every provider
 * route failed with a transient error. Delays double each attempt (1s, 2s, 4s,
 * 8s …) with a little jitter so parallel clients don't stampede the API, and
 * pause early if the caller's signal aborts.
 */

export interface RetryOptions {
  /** Number of retries AFTER the first attempt (attempts = maxRetries + 1). */
  maxRetries: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (info: { attempt: number; error: unknown; delayMs: number }) => void;
  /**
   * Custom delay for a specific attempt/error (e.g. honour the provider's
   * Retry-After). Falls back to exponential backoff when omitted.
   */
  delayFor?: (attempt: number, error: unknown) => number;
  signal?: AbortSignal;
}

/** Pause that resolves immediately if the signal aborts mid-wait. */
export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** Exponential delay for a given retry index (0 → 1s, 1 → 2s, 2 → 4s …). */
export function backoffMs(
  retryIndex: number,
  baseDelayMs = 1000,
  maxDelayMs = 8000,
): number {
  const exponential = Math.min(baseDelayMs * 2 ** retryIndex, maxDelayMs);
  // ±15% jitter spreads thundering-herd retries without breaking the pattern.
  const jitter = 1 + (Math.random() * 0.3 - 0.15);
  return Math.round(exponential * jitter);
}

/**
 * Runs `fn` up to `maxRetries + 1` times. Only retries errors that pass
 * `shouldRetry`; any other error is rethrown immediately.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, signal } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (signal?.aborted) throw lastError ?? new DOMException("Aborted", "AbortError");
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (!options.shouldRetry?.(error)) throw error;
      if (attempt >= maxRetries) break;
      const delay =
        options.delayFor?.(attempt, error) ??
        backoffMs(attempt, baseDelayMs, maxDelayMs);
      options.onRetry?.({ attempt, error, delayMs: delay });
      await sleep(delay, signal);
    }
  }

  throw lastError;
}
