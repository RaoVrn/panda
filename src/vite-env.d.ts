/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
  readonly VITE_GROQ_FALLBACK_MODELS?: string;
  readonly VITE_AI_TIMEOUT?: string;
  readonly VITE_AI_MAX_RETRIES?: string;
  readonly VITE_AI_MAX_TOTAL_MS?: string;
  readonly VITE_AI_CACHE_TTL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
