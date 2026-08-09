/**
 * AI configuration, read once from `import.meta.env` at module load.
 *
 * Only non-sensitive tuning is read client-side. The Groq API key is
 * server-side only (a Supabase Edge Function secret named `GROQ_API_KEY`) and
 * never appears here.
 *
 * Environment variables:
 *   VITE_AI_PROVIDER             which providers to enable (default "groq")
 *   VITE_GROQ_MODEL              primary Groq model
 *   VITE_GROQ_FALLBACK_MODELS    comma-separated fallback models
 *   VITE_AI_TIMEOUT              per-call deadline in ms (default 45000)
 *   VITE_AI_MAX_RETRIES          retries after the first attempt (default 2)
 *   VITE_AI_MAX_TOTAL_MS         overall budget for one request (default
 *                                timeoutMs * (maxRetries + 1) * 2)
 *   VITE_AI_CACHE_TTL            answer cache TTL in ms (default 60000)
 */

const DEFAULT_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface AIConfig {
  provider: string;
  groqModels: string[];
  /** Deadline for a single provider network call. */
  timeoutMs: number;
  /** Retries after the first attempt. */
  maxRetries: number;
  /** Overall wall-clock budget for one user request (waits included). */
  maxTotalMs: number;
  /** How long a cached answer stays valid. */
  cacheTtlMs: number;
  healthThreshold: number;
  healthCooldownMs: number;
}

export function loadAIConfig(): AIConfig {
  const env = import.meta.env;

  const fallbackList = (env.VITE_GROQ_FALLBACK_MODELS ?? "")
    .split(",")
    .map((model) => model.trim());

  const models = [
    env.VITE_GROQ_MODEL?.trim(),
    ...fallbackList,
  ].filter(Boolean) as string[];

  const timeoutMs = num(env.VITE_AI_TIMEOUT, 45_000);
  const maxRetries = num(env.VITE_AI_MAX_RETRIES, 2);

  return {
    provider: (env.VITE_AI_PROVIDER ?? "groq").trim().toLowerCase() || "groq",
    groqModels: Array.from(new Set(models.length > 0 ? models : DEFAULT_MODELS)),
    timeoutMs,
    maxRetries,
    maxTotalMs: num(env.VITE_AI_MAX_TOTAL_MS, timeoutMs * (maxRetries + 1) * 2),
    cacheTtlMs: num(env.VITE_AI_CACHE_TTL, 60_000),
    healthThreshold: 5,
    healthCooldownMs: 5 * 60_000,
  };
}

export const aiConfig = loadAIConfig();
