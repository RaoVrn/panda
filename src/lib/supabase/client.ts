/**
 * Supabase client.
 *
 * A single lazily-created client used across auth and data services. When the
 * project isn't configured (no URL/anon key) `supabase` is `null` and services
 * throw a typed `SupabaseUnconfiguredError`  -  the UI handles that gracefully.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, readSupabaseEnv } from "./config";

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!isSupabaseConfigured()) {
    client = null;
    return null;
  }
  const { url, anonKey } = readSupabaseEnv();
  client = createClient(url!, anonKey!, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

/** Typed error thrown by services when Supabase isn't configured. */
export class SupabaseUnconfiguredError extends Error {
  constructor() {
    super("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    this.name = "SupabaseUnconfiguredError";
  }
}
