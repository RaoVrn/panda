/**
 * Structured AI logging.
 *
 * Emitted to the console only. Never rendered in the UI. Every request carries
 * a `requestId` so the full lifecycle (Started → attempts → Finished/Failed)
 * can be traced across logs. Fields follow a stable shape: provider, model,
 * endpoint, payload size, latency, retry count, status code and failure reason.
 */

import type { AIRequest } from "./types";

export type AiLogLevel = "info" | "warn" | "error";

export interface AiLogFields {
  event: string;
  requestId?: string;
  provider?: string;
  model?: string;
  endpoint?: string;
  payloadBytes?: number;
  estimatedTokens?: number;
  characters?: number;
  latencyMs?: number;
  attempt?: number;
  retries?: number;
  statusCode?: number;
  failureReason?: string;
  detail?: string;
}

function write(level: AiLogLevel, fields: AiLogFields): void {
  const method =
    level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  const {
    event,
    requestId,
    provider,
    model,
    endpoint,
    payloadBytes,
    estimatedTokens,
    characters,
    latencyMs,
    attempt,
    retries,
    statusCode,
    failureReason,
    detail,
  } = fields;

  const parts = [`[ai] ${event}`];
  if (requestId) parts.push(`req=${requestId.slice(0, 8)}`);
  if (provider) parts.push(`provider=${provider}`);
  if (model) parts.push(`model=${model}`);
  if (attempt !== undefined) parts.push(`attempt=${attempt}`);
  if (retries !== undefined) parts.push(`retries=${retries}`);
  if (statusCode !== undefined) parts.push(`status=${statusCode}`);
  if (endpoint) parts.push(`endpoint=${endpoint}`);
  if (payloadBytes !== undefined) parts.push(`payload=${payloadBytes}B`);
  if (estimatedTokens !== undefined) parts.push(`tokens≈${estimatedTokens}`);
  if (characters !== undefined) parts.push(`chars=${characters}`);
  if (latencyMs !== undefined) parts.push(`latency=${latencyMs}ms`);
  if (failureReason) parts.push(`reason=${failureReason}`);
  if (detail) parts.push(`detail=${detail}`);

  method(parts.join(" "));
}

/** Rough serialized size of a request, for the logs (never the content). */
export function estimatePayloadBytes(request: AIRequest): number {
  return JSON.stringify({
    systemInstruction: request.systemPrompt,
    contents: request.history,
    prompt: request.prompt,
  }).length;
}

export const aiLogger = {
  info: (fields: AiLogFields) => write("info", fields),
  warn: (fields: AiLogFields) => write("warn", fields),
  error: (fields: AiLogFields) => write("error", fields),
};
