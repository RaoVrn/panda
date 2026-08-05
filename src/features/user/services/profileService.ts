/**
 * profileService — reads and writes the user's identity + learning profile.
 *
 * Maps between the snake_case database rows and the camelCase domain types.
 * RLS keeps every row scoped to `auth.uid()`.
 */

import { getSupabase, SupabaseUnconfiguredError } from "@/lib/supabase/client";
import type {
  LearningProfile,
  LearningProfileRow,
  UserPreferences,
  UserProfile,
} from "@/features/user/types";

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new SupabaseUnconfiguredError();
  return supabase;
}

type ProfileRow = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  joined_at: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username ?? undefined,
    email: row.email ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    joinedAt: row.joined_at,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await client()
    .from("profiles")
    .select("id, name, username, email, avatar_url, joined_at")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function updateProfile(
  userId: string,
  patch: { name?: string; username?: string; avatarUrl?: string },
): Promise<UserProfile> {
  const { data, error } = await client()
    .from("profiles")
    .update({
      name: patch.name,
      username: patch.username,
      avatar_url: patch.avatarUrl,
    })
    .eq("id", userId)
    .select("id, name, username, email, avatar_url, joined_at")
    .maybeSingle<ProfileRow>();
  if (error) throw error;
  if (!data) throw new Error("Profile not found after update");
  return mapProfile(data);
}

function mapLearningProfile(row: LearningProfileRow): LearningProfile {
  return {
    userId: row.user_id,
    level: row.level,
    xp: row.xp,
    totalXp: row.total_xp,
    completedLessons: row.completed_lessons,
    completedModules: row.completed_modules,
    streak: row.streak,
    lastLesson: row.last_lesson ?? undefined,
    lastOpenedLesson: row.last_opened_lesson ?? undefined,
    quizStats: row.quiz_stats,
    badges: row.badges,
    preferences: row.preferences,
  };
}

export async function fetchLearningProfile(
  userId: string,
): Promise<LearningProfile | null> {
  const { data, error } = await client()
    .from("learning_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<LearningProfileRow>();
  if (error) throw error;
  return data ? mapLearningProfile(data) : null;
}

export async function upsertLearningProfile(
  row: LearningProfileRow,
): Promise<void> {
  const { error } = await client()
    .from("learning_profiles")
    .upsert({ ...row, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function updatePreferences(
  userId: string,
  preferences: UserPreferences,
): Promise<void> {
  const { data, error } = await client()
    .from("learning_profiles")
    .select("preferences")
    .eq("user_id", userId)
    .maybeSingle<{ preferences: UserPreferences }>();
  if (error) throw error;

  const merged: UserPreferences = {
    ...(data?.preferences ?? {}),
    ...preferences,
  };

  const { error: updateError } = await client()
    .from("learning_profiles")
    .update({ preferences: merged })
    .eq("user_id", userId);
  if (updateError) throw updateError;
}
