/**
 * Supabase configuration.
 *
 * Reads the project URL + anon key from Vite env vars. When they're missing
 * the app runs in "unconfigured" mode: the learner can still browse and study
 * anonymously, and auth screens show a friendly setup notice instead of
 * crashing.
 */

export interface SupabaseEnv {
  url: string | undefined;
  anonKey: string | undefined;
}

export function readSupabaseEnv(): SupabaseEnv {
  return {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  };
}

/** True when both the URL and the anon key are configured. */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readSupabaseEnv();
  return Boolean(url && anonKey);
}
