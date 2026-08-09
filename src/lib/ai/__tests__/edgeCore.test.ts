import { describe, expect, it } from "vitest";
import {
  buildGroqMessages,
  classifyGroqFailure,
  CORS_HEADERS,
  CORS_PREFLIGHT_STATUS,
  validateRequestBody,
} from "../../../../supabase/functions/ai-chat/core";

describe("ai-chat Edge Function core", () => {
  it("serves the OPTIONS preflight with 200 and full CORS headers", () => {
    // Regression: a 204 with a body throws in Deno ("Response with null body
    // status cannot have body"), so the preflight must be 200.
    expect(CORS_PREFLIGHT_STATUS).toBe(200);
    expect(CORS_PREFLIGHT_STATUS).not.toBe(204);
    expect(CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
    expect(CORS_HEADERS["Access-Control-Allow-Headers"]).toMatch(/authorization/);
    expect(CORS_HEADERS["Access-Control-Allow-Headers"]).toMatch(/x-client-info/);
    expect(CORS_HEADERS["Access-Control-Allow-Headers"]).toMatch(/apikey/);
    expect(CORS_HEADERS["Access-Control-Allow-Headers"]).toMatch(/content-type/);
    expect(CORS_HEADERS["Access-Control-Allow-Methods"]).toMatch(/POST/);
  });

  it("accepts a well-formed request", () => {
    const result = validateRequestBody({
      systemPrompt: "sys",
      history: [{ role: "user", content: "hi" }],
      prompt: "hello",
      model: "llama-3.3-70b-versatile",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.prompt).toBe("hello");
      expect(result.data.history).toHaveLength(1);
    }
  });

  it("rejects malformed request bodies", () => {
    expect(validateRequestBody(null).ok).toBe(false);
    expect(validateRequestBody("nope").ok).toBe(false);
    expect(validateRequestBody({}).ok).toBe(false);
    expect(validateRequestBody({ systemPrompt: "", prompt: "x", model: "m", history: [] }).ok).toBe(false);
    expect(validateRequestBody({ systemPrompt: "s", prompt: "x", model: "", history: [] }).ok).toBe(false);
    expect(validateRequestBody({ systemPrompt: "s", prompt: "x", model: "m", history: "no" }).ok).toBe(false);
  });

  it("rejects oversized requests", () => {
    const result = validateRequestBody({
      systemPrompt: "x".repeat(20_001),
      prompt: "p",
      model: "m",
      history: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(413);
  });

  it("drops invalid history entries", () => {
    const result = validateRequestBody({
      systemPrompt: "s",
      prompt: "p",
      model: "m",
      history: [
        { role: "user", content: "ok" },
        { role: "system", content: "drop-me" },
        { role: "user", content: "" },
        "junk",
        { role: "assistant", content: "fine" },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.history).toEqual([
        { role: "user", content: "ok" },
        { role: "assistant", content: "fine" },
      ]);
    }
  });

  it("builds Groq messages with system first and user last", () => {
    const messages = buildGroqMessages({
      requestId: "1",
      systemPrompt: "sys",
      history: [{ role: "user", content: "a" }],
      prompt: "b",
      model: "m",
    });
    expect(messages[0]).toEqual({ role: "system", content: "sys" });
    expect(messages.at(-1)).toEqual({ role: "user", content: "b" });
    expect(messages).toHaveLength(3);
  });

  it("classifies Groq failures into safe HTTP responses", () => {
    expect(classifyGroqFailure(429, "rate limit")).toEqual({
      status: 429,
      message: expect.stringMatching(/rate limiting/i),
    });
    expect(classifyGroqFailure(401, "invalid api key")).toEqual({ status: 502, message: expect.any(String) });
    expect(classifyGroqFailure(404, "model not found")).toEqual({ status: 404, message: expect.any(String) });
    expect(classifyGroqFailure(500, "boom")).toEqual({ status: 502, message: expect.any(String) });
    // Never echoes raw vendor messages that could contain secrets.
    const safe = classifyGroqFailure(401, "secret gsk_abc123 rejected");
    expect(safe.message).not.toMatch(/gsk_/);
    expect(safe.message).not.toMatch(/secret/);
  });
});
