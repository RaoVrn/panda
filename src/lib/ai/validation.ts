/**
 * Startup configuration validation.
 *
 * Runs once when the AI service is created. It never crashes the app. Every
 * problem is surfaced as a structured warning and the system keeps running
 * with whatever can work (fail gracefully):
 *
 *   · no Groq API key          → warn; the UI shows a setup hint
 *   · unknown provider         → warn; it's ignored
 *   · configured model that
 *     the account can't use    → warn; the fallback chain still covers it
 */

import { aiConfig } from "./config";
import {
  groqModelAvailable,
  prefetchGroqModels,
} from "./GroqProvider";
import { aiLogger } from "./logger";

const IMPLEMENTED_PROVIDERS = new Set(["groq"]);

export function validateAiConfig(): void {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim() ?? "";

  if (!apiKey) {
    aiLogger.warn({
      event: "ai.config.invalid",
      detail: "VITE_GROQ_API_KEY is not set. Panda AI will show a setup hint until it is.",
    });
    return;
  }

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

  void prefetchGroqModels().then(() => {
    for (const model of aiConfig.groqModels) {
      if (groqModelAvailable(model) === false) {
        aiLogger.warn({
          event: "ai.config.model-unavailable",
          model,
          detail: "Configured model is not available on this account. The fallback chain will be used.",
        });
      }
    }
    aiLogger.info({
      event: "ai.config.validated",
      detail: `providers=${enabled.join(",") || "none"} models=${aiConfig.groqModels.join(",")}`,
    });
  });
}
