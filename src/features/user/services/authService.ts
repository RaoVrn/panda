/**
 * authService  -  every Supabase auth call in one place.
 *
 * All methods throw `SupabaseUnconfiguredError` when the project isn't
 * configured, so the UI can catch it and show a setup notice. Nothing in the
 * components talks to Supabase directly.
 */

import {
  getSupabase,
  SupabaseUnconfiguredError,
} from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new SupabaseUnconfiguredError();
  return supabase;
}

export interface AuthResult {
  user: User | null;
}

/** Email + password sign up. `name` is stored in profile metadata. */
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResult> {
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: {
      data: { name: name ?? "" },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw error;
  return { user: data.user };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await client().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return { user: data.user };
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await client().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await client().auth.signOut();
  if (error) throw error;
}

/** Sends a password-reset email. */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await client().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/** Sets a new password (after the reset email link). */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await client().auth.updateUser({ password: newPassword });
  if (error) throw error;
}
