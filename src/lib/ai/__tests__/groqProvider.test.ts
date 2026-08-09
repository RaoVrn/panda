import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GroqProvider } from "@/lib/ai/GroqProvider";
import { ConfigError, RateLimitError, UnknownAIError } from "@/lib/ai/errors";
import type { AIRequest, AIStreamCallbacks } from "@/lib/ai/types";

const fakeSupabase = {
  auth: {
    getSession: vi.fn(),
  },
};

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: () => (globalThis as unknown as { __supabase: unknown }).__supabase,
}));

vi.mock("@/lib/supabase/config", () => ({
  readSupabaseEnv: () => ({
    url: "https://demo.supabase.co",
    anonKey: "public-anon-key",
  }),
}));

function request(): AIRequest {
  return {
    requestId: "req-1",
    systemPrompt: "system",
    history: [],
    prompt: "hello",
  };
}

function sseBody(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) controller.enqueue(encoder.encode(event));
      controller.close();
    },
  });
}

let provider: GroqProvider;

beforeEach(() => {
  provider = new GroqProvider();
  (globalThis as unknown as { __supabase: unknown }).__supabase = fakeSupabase;
  fakeSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GroqProvider (Edge Function client)", () => {
  it("exposes the configured models so the fallback has routes to try", () => {
    // Regression: an empty `models` array makes FallbackProvider.healthyRoutes()
    // empty and throws "All AI providers failed" without calling the function.
    expect(provider.models.length).toBeGreaterThan(0);
    expect(provider.isConfigured()).toBe(true);
  });

  it("calls the Supabase ai-chat function with the prompt and model", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: sseBody(['data: {"token":"hi"}\n\n', "data: [DONE]\n\n"]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const tokens: string[] = [];
    const callbacks: AIStreamCallbacks = { onToken: (t) => tokens.push(t) };
    const text = await provider.stream(request(), "llama-3.3-70b-versatile", callbacks);

    expect(text).toBe("hi");
    expect(tokens.at(-1)).toBe("hi");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://demo.supabase.co/functions/v1/ai-chat");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("llama-3.3-70b-versatile");
    expect(body.prompt).toBe("hello");
    expect(body).not.toHaveProperty("apiKey");
    expect(JSON.stringify(body)).not.toMatch(/gsk_|api[_-]?key/i);
  });

  it("streams and accumulates tokens from SSE events", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: sseBody([
        'data: {"token":"Hel"}\n\n',
        'data: {"token":"lo"}\n\n',
        "data: [DONE]\n\n",
      ]),
    }));
    const seen: string[] = [];
    const text = await provider.stream(request(), "m", { onToken: (t) => seen.push(t) });
    expect(text).toBe("Hello");
    expect(seen).toEqual(["Hel", "Hello"]);
  });

  it("maps a 429 to a RateLimitError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "rate limited" } }),
    }));
    await expect(provider.stream(request(), "m", { onToken: () => {} })).rejects.toBeInstanceOf(RateLimitError);
  });

  it("maps a 401 to a ConfigError (auth required)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Authentication required." } }),
    }));
    await expect(provider.stream(request(), "m", { onToken: () => {} })).rejects.toBeInstanceOf(ConfigError);
  });

  it("maps a 502 to an UnknownAIError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: { message: "AI provider unavailable." } }),
    }));
    await expect(provider.stream(request(), "m", { onToken: () => {} })).rejects.toBeInstanceOf(UnknownAIError);
  });

  it("throws a ConfigError when the AI transport is not configured", async () => {
    (globalThis as unknown as { __supabase: unknown }).__supabase = null;
    await expect(provider.stream(request(), "m", { onToken: () => {} })).rejects.toBeInstanceOf(ConfigError);
  });

  it("never sends a Groq API key in the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: sseBody(['data: {"token":"ok"}\n\n', "data: [DONE]\n\n"]),
    });
    vi.stubGlobal("fetch", fetchMock);
    await provider.stream(request(), "m", { onToken: () => {} });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(JSON.stringify(headers)).not.toMatch(/gsk_/);
    expect(JSON.stringify(init.body)).not.toMatch(/gsk_/);
  });
});
