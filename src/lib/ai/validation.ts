/**
 * Startup configuration validation.
 *
 * Runs once when the AI service is created. It never crashes the app. Every
 * problem is surfaced as a structured warning and the system keeps running
 * with whatever can work (fail gracefully):
 *
 *   · no Supabase project     → warn; the AI transport is unavailable
 *   · unknown provider        → warn; it's ignored
 *
 * The Groq API key is server-side only (an Edge Function secret) and is never
 * validated here.
 */

import { aiConfig } from "./config";
import { getSupabase } from "@/lib/supabase/client";
import { aiLogger } from "./logger";

const IMPLEMENTED_PROVIDERS = new Set(["groq"]);

export function validateAiConfig(): void {
  const enabled = aiConfig.provider
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);

  const unknown = enabled.filter((provider) => !IMPLEMENTED_PROVIDERS.has(provider));
  if (unknown.length > 0) {
    aiLogger.warn({
      event: "ai.config.unknown-provider",
      detail: `Provider(s) "${unknown.join(", ")}" are not implemented yet and were ignored.`,
    });
  }

  // The AI transport requires a configured Supabase project (the ai-chat Edge
  // Function is deployed there). The Groq key lives server-side.
  if (!getSupabase()) {
    aiLogger.warn({
      event: "ai.config.unconfigured",
      detail: "Supabase is not configured. Panda AI will show a setup hint until it is.",
    });
    return;
  }

  aiLogger.info({
    event: "ai.config.validated",
    detail: `providers=${enabled.join(",") || "none"} models=${aiConfig.groqModels.join(",")} transport=supabase-functions`,
  });
}
