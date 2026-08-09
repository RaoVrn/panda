/**
 * ai-chat Edge Function core.
 *
 * Pure, framework-agnostic helpers shared between the Deno Edge Function
 * (`index.ts`) and the Panda unit tests. No Deno/node-specific APIs here so
 * the same logic runs under Vitest and in the Supabase runtime.
 *
 * Everything sensitive (the Groq API key) lives only in `index.ts` via
 * `Deno.env.get("GROQ_API_KEY")` and is never accepted from the client.
 */

/**
 * CORS headers for browser clients. Mirrors the current Supabase Edge Function
 * pattern. Kept here (pure, no Deno) so the regression tests can pin the exact
 * headers and preflight status.
 */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Status for the preflight OPTIONS response. A 204 must NOT carry a body
 * (Deno throws "Response with null body status cannot have body"), so the
 * preflight uses 200 with a small body instead.
 */
export const CORS_PREFLIGHT_STATUS = 200;

export interface EdgeAiRequest {
  requestId?: string;
  systemPrompt: string;
  history: Array<{ role: string; content: string }>;
  prompt: string;
  model: string;
}

export type ValidateResult =
  | { ok: true; data: EdgeAiRequest }
  | { ok: false; status: number; message: string };

const MAX_SYSTEM = 20_000;
const MAX_PROMPT = 8_000;
const MAX_HISTORY = 12;
const MAX_HISTORY_ITEM = 8_000;
const MAX_REQUEST_ID = 120;

const ROLE_RE = /^(user|assistant)$/;

/** Reject malformed or oversized request bodies before any upstream call. */
export function validateRequestBody(body: unknown): ValidateResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, message: "Malformed request body." };
  }
  const record = body as Record<string, unknown>;

  const systemPrompt = record.systemPrompt;
  const prompt = record.prompt;
  const model = record.model;
  const history = record.history;

  if (typeof systemPrompt !== "string" || systemPrompt.length === 0) {
    return { ok: false, status: 400, message: "Invalid systemPrompt." };
  }
  if (typeof prompt !== "string" || prompt.length === 0) {
    return { ok: false, status: 400, message: "Invalid prompt." };
  }
  if (typeof model !== "string" || model.trim().length === 0) {
    return { ok: false, status: 400, message: "Invalid model." };
  }
  if (!Array.isArray(history)) {
    return { ok: false, status: 400, message: "Invalid history." };
  }

  if (systemPrompt.length > MAX_SYSTEM || prompt.length > MAX_PROMPT) {
    return { ok: false, status: 413, message: "Request is too large." };
  }
  if (history.length > MAX_HISTORY) {
    return { ok: false, status: 413, message: "History is too long." };
  }
  if (model.length > 200 || /[\u0000-\u001f]/.test(model)) {
    return { ok: false, status: 400, message: "Invalid model." };
  }

  const requestId =
    typeof record.requestId === "string"
      ? record.requestId.slice(0, MAX_REQUEST_ID)
      : undefined;

  const cleanHistory: EdgeAiRequest["history"] = [];
  for (const item of history) {
    if (typeof item !== "object" || item === null) continue;
    const role = (item as Record<string, unknown>).role;
    const content = (item as Record<string, unknown>).content;
    if (typeof role !== "string" || !ROLE_RE.test(role)) continue;
    if (typeof content !== "string" || content.length === 0) continue;
    if (content.length > MAX_HISTORY_ITEM) continue;
    cleanHistory.push({ role, content: content.slice(0, MAX_HISTORY_ITEM) });
  }

  return {
    ok: true,
    data: {
      requestId,
      systemPrompt,
      history: cleanHistory,
      prompt,
      model: model.trim(),
    },
  };
}

/** Build the Groq chat message array from a validated request. */
export function buildGroqMessages(data: EdgeAiRequest): Array<{
  role: "system" | "user" | "assistant";
  content: string;
}> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: data.systemPrompt },
  ];
  for (const item of data.history) {
    messages.push({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    });
  }
  messages.push({ role: "user", content: data.prompt });
  return messages;
}

/** Map a Groq SDK failure into a safe HTTP response shape (no secrets). */
export function classifyGroqFailure(status?: number, message?: string): {
  status: number;
  message: string;
} {
  const text = `${status ?? ""} ${message ?? ""}`;
  if (/quota|limit:\s*0|You exceeded your current quota/i.test(text)) {
    return { status: 429, message: "The AI provider's quota is exhausted." };
  }
  if (status === 429 || /rate.?limit|too many requests/i.test(text)) {
    return { status: 429, message: "The AI provider is rate limiting requests." };
  }
  if (status === 401 || status === 403 || /invalid api key|authentication/i.test(text)) {
    return { status: 502, message: "The AI provider rejected the request." };
  }
  if (status === 404 || /model.*not found/i.test(text)) {
    return { status: 404, message: "The requested AI model is not available." };
  }
  if (status === 400) {
    return { status: 400, message: "The AI provider rejected the request." };
  }
  if (status && status >= 500 && status <= 599) {
    return { status: 502, message: "The AI provider is unavailable." };
  }
  return { status: 500, message: "The AI request failed." };
}
