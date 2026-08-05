/**
 * Panda AI typed errors.
 *
 * Every failure the AI layer produces is a typed `AiError` with:
 *  - `kind`, a machine-readable category (for logs + health tracking)
 *  - `retryable`, whether retrying/falling back can plausibly succeed
 *  - `userMessage`, a friendly, human string the UI may show verbatim
 *
 * Raw provider exceptions are never shown to users; they are classified into
 * these types at the provider boundary and surfaced only through `userMessage`.
 */

export type AiErrorKind =
  | "rate-limit"
  | "quota-unavailable"
  | "network"
  | "timeout"
  | "model-unavailable"
  | "invalid-response"
  | "config"
  | "unknown";

export interface AiErrorOptions {
  kind: AiErrorKind;
  retryable: boolean;
  userMessage: string;
  cause?: unknown;
  provider?: string;
  model?: string;
  /** Underlying HTTP status, when the provider exposed one. */
  statusCode?: number;
  /** Seconds the provider asked us to wait (e.g. 429 Retry-After). */
  retryAfterSeconds?: number;
}

export class AiError extends Error {
  readonly kind: AiErrorKind;
  readonly retryable: boolean;
  readonly userMessage: string;
  override readonly cause?: unknown;
  provider?: string;
  model?: string;
  statusCode?: number;
  retryAfterSeconds?: number;

  constructor(message: string, options: AiErrorOptions) {
    super(message);
    this.name = "AiError";
    this.kind = options.kind;
    this.retryable = options.retryable;
    this.userMessage = options.userMessage;
    if (options.cause !== undefined) this.cause = options.cause;
    if (options.provider !== undefined) this.provider = options.provider;
    if (options.model !== undefined) this.model = options.model;
    if (options.statusCode !== undefined) this.statusCode = options.statusCode;
    if (options.retryAfterSeconds !== undefined) {
      this.retryAfterSeconds = options.retryAfterSeconds;
    }
  }
}

/** 429 / quota: transient. Back off and try again. */
export class RateLimitError extends AiError {
  constructor(message = "Rate limited by the AI provider.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "rate-limit",
      retryable: true,
      userMessage:
        "Panda AI is currently experiencing high traffic. Please try again in a moment.",
      ...options,
    });
    this.name = "RateLimitError";
  }
}

/** The project has no usable quota (for example `limit: 0`). */
export class QuotaUnavailableError extends AiError {
  constructor(message = "The configured AI provider has no available quota.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "quota-unavailable",
      retryable: false,
      userMessage:
        "Panda AI cannot use the configured AI provider right now. Check that the provider has available quota or billing, then try again.",
      ...options,
    });
    this.name = "QuotaUnavailableError";
  }
}

/** DNS / fetch / ECONNRESET / socket failures: transient. */
export class NetworkError extends AiError {
  constructor(message = "Network failure reaching the AI provider.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "network",
      retryable: true,
      userMessage:
        "Couldn't reach the AI service. Check your connection, then try again.",
      ...options,
    });
    this.name = "NetworkError";
  }
}

/** Request exceeded the deadline: transient. */
export class TimeoutError extends AiError {
  constructor(message = "The AI request timed out.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "timeout",
      retryable: true,
      userMessage: "Panda AI took a little too long. Please try again.",
      ...options,
    });
    this.name = "TimeoutError";
  }
}

/** Model missing / disabled / 404. Another model or provider may work. */
export class ModelUnavailableError extends AiError {
  constructor(message = "The requested AI model is unavailable.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "model-unavailable",
      retryable: true,
      userMessage:
        "That AI model isn't available right now. Trying another one.",
      ...options,
    });
    this.name = "ModelUnavailableError";
  }
}

/**
 * The model returned unusable content (empty reply, safety block).
 * Empty replies are retryable; content blocks are not.
 */
export class InvalidResponseError extends AiError {
  constructor(message: string, options: Partial<AiErrorOptions> & { retryable: boolean }) {
    super(message, {
      kind: "invalid-response",
      userMessage:
        "Panda AI came back empty that time. Let's give it another go.",
      ...options,
    });
    this.name = "InvalidResponseError";
  }
}

/** Missing/wrong API key or bad configuration. Never retry. */
export class ConfigError extends AiError {
  constructor(message = "Panda AI is not configured.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "config",
      retryable: false,
      userMessage:
        "Panda AI isn't set up yet. Add your API key to a .env file and restart the dev server.",
      ...options,
    });
    this.name = "ConfigError";
  }
}

/** Anything else that looks transient. Retry to be safe. */
export class UnknownAIError extends AiError {
  constructor(message = "Unexpected AI error.", options?: Partial<AiErrorOptions>) {
    super(message, {
      kind: "unknown",
      retryable: true,
      userMessage: "Something went wrong while talking to Panda AI. Please try again.",
      ...options,
    });
    this.name = "UnknownAIError";
  }
}

/**
 * Raised when a stream fails AFTER tokens were delivered. Carries the partial
 * text so callers can preserve what was already generated instead of losing it.
 */
export class StreamInterruptedError extends NetworkError {
  readonly partialText: string;

  constructor(cause: unknown, partialText: string, options?: Partial<AiErrorOptions>) {
    super("The stream was interrupted after delivering a partial response.", {
      ...options,
      cause,
      retryable: false,
    });
    this.name = "StreamInterruptedError";
    this.partialText = partialText;
  }
}

/** Every route (provider × model) failed or was unavailable. */
export class AllProvidersFailedError extends UnknownAIError {
  constructor(options?: Partial<AiErrorOptions>) {
    super("All AI providers failed.", {
      ...options,
      retryable: false,
      userMessage:
        "Panda AI is temporarily unavailable. Please try again.",
    });
    this.name = "AllProvidersFailedError";
  }
}

/** Normalizes any thrown value into an AiError. */
export function asAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  return new UnknownAIError(error instanceof Error ? error.message : String(error), {
    cause: error,
  });
}

/** Whether an error is worth retrying or falling back on. */
export function isRetryable(error: unknown): boolean {
  return error instanceof AiError && error.retryable;
}
