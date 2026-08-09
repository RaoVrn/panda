/**
 * Groq provider - via the Supabase `ai-chat` Edge Function.
 *
 * The Groq API key is server-side only (a Supabase Edge Function secret). The
 * browser sends the prompt + context to the Edge Function, which forwards to
 * Groq and streams the reply back. This file never reads an API key and never
 * uses the Groq SDK client-side.
 *
 * The orchestration (model fallback, retries, timeouts, health) in
 * `ai-service.ts` / `fallback-provider.ts` is unchanged; only the transport
 * differs.
 */

import { getSupabase } from "@/lib/supabase/client";
import { readSupabaseEnv } from "@/lib/supabase/config";
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
import type { AIProvider, AIRequest, AIStreamCallbacks } from "./types";

/** The Edge Function route, relative to the Supabase Functions gateway. */
const EDGE_FUNCTION_PATH = "/functions/v1/ai-chat";

/** SSE line separator used by the Edge Function stream. */
const SSE_SEPARATOR = "\n\n";

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  /** Models to try, in priority order (non-sensitive client-side config).
   *  The Edge Function validates and forwards whichever model is attempted. */
  readonly models: string[] = aiConfig.groqModels;

  constructor() {
    // No client-side setup needed: the Groq key is server-side only.
  }

  /** Configured when a Supabase project can reach the ai-chat function. */
  isConfigured(): boolean {
    return getSupabase() !== null;
  }

  /** Model availability is unknown client-side (resolved by the function). */
  isModelAvailable(): boolean | undefined {
    return undefined;
  }

  async stream(
    request: AIRequest,
    model: string,
    { onToken, signal }: AIStreamCallbacks,
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new ConfigError("No AI provider is configured.", {
        provider: this.name,
        model,
      });
    }

    const supabase = getSupabase()!;
    const supabaseUrl = readSupabaseEnv().url;
    if (!supabaseUrl) {
      throw new ConfigError("No AI provider is configured.", {
        provider: this.name,
        model,
      });
    }
    const { data: sessionData } = await supabase.auth.getSession();
    // Send the user's JWT when signed in (the function requires it); fall
    // back to the anon key so anonymous requests still reach the function's
    // auth gate and fail gracefully with a clear 401.
    const auth = sessionData.session?.access_token ?? readSupabaseEnv().anonKey ?? "";

    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}${EDGE_FUNCTION_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify({
          requestId: request.requestId,
          systemPrompt: request.systemPrompt,
          history: request.history,
          prompt: request.prompt,
          model,
        }),
        signal,
      });
    } catch {
      if (signal?.aborted) {
        throw new TimeoutError("The AI request was aborted.", {
          provider: this.name,
          model,
        });
      }
      throw new NetworkError("Network failure reaching Panda AI.", {
        provider: this.name,
        model,
      });
    }

    if (!response.ok) {
      let message = "";
      try {
        const payload = (await response.json()) as { error?: { message?: string } };
        message = payload.error?.message ?? "";
      } catch {
        // Non-JSON error body; use the status only.
      }
      throw classify({ status: response.status, message });
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new InvalidResponseError("Panda AI returned no response body.", {
        retryable: false,
        provider: this.name,
        model,
      });
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf(SSE_SEPARATOR);
        while (boundary >= 0) {
          const event = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + SSE_SEPARATOR.length);
          const dataLine = event
            .split("\n")
            .find((line) => line.startsWith("data:"));
          if (dataLine) {
            const data = dataLine.slice(5).trim();
            if (data === "[DONE]") {
              boundary = -1;
              continue;
            }
            try {
              const parsed = JSON.parse(data) as { token?: string };
              if (typeof parsed.token === "string" && parsed.token.length > 0) {
                full += parsed.token;
                onToken(full);
              }
            } catch {
              // Ignore malformed events; keep the rest of the stream.
            }
          }
          boundary = buffer.indexOf(SSE_SEPARATOR);
        }
      }
    } catch {
      if (signal?.aborted) {
        throw new TimeoutError("The AI request was aborted.", {
          provider: this.name,
          model,
        });
      }
      if (full.length > 0) {
        throw new UnknownAIError("Panda AI stopped mid-answer.", {
          retryable: false,
          provider: this.name,
          model,
        });
      }
      throw new NetworkError("Network failure reaching Panda AI.", {
        provider: this.name,
        model,
      });
    }

    if (full.trim().length === 0) {
      throw new InvalidResponseError("Panda AI returned an empty response.", {
        retryable: true,
        provider: this.name,
        model,
      });
    }

    return full;
  }
}

/** Map an Edge Function HTTP failure into a typed Panda AI error. */
function classify(failure: { status: number; message: string }): AiError {
  const status = failure.status;
  const message = failure.message;
  const text = `${status} ${message}`;

  if (/quota|limit:\s*0|You exceeded your current quota/i.test(text)) {
    return new QuotaUnavailableError(message || "The AI quota is exhausted.", {
      statusCode: status,
    });
  }
  if (status === 429 || /rate.?limit|too many requests/i.test(text)) {
    return new RateLimitError(message || "Rate limited by Panda AI.", {
      statusCode: status,
    });
  }
  if (status === 401 || status === 403) {
    return new ConfigError(message || "Panda AI requires a signed-in account.", {
      statusCode: status,
    });
  }
  if (status === 404 || /model.*not available|not found/i.test(text)) {
    return new ModelUnavailableError(message || "The AI model is not available.", {
      statusCode: status,
    });
  }
  if (status === 400) {
    return new InvalidResponseError(message || "Panda AI rejected the request.", {
      retryable: false,
      statusCode: status,
    });
  }
  if (status === 408 || /abort|timed out/i.test(text)) {
    return new TimeoutError(message || "Panda AI timed out.", {
      statusCode: status,
    });
  }
  if (status === 502 || status === 503 || status === 504) {
    return new UnknownAIError(message || "Panda AI is unavailable.", {
      statusCode: status,
    });
  }
  return new UnknownAIError(message || "Unexpected Panda AI error.", {
    statusCode: status,
  });
}
