/**
 * notificationService — persistent notifications in Supabase.
 *
 * RLS scopes every row to the signed-in user. `reference` + the unique
 * (user_id, reference) constraint dedupe notifications, so an achievement or
 * lesson completion is never notified twice, even across devices. All methods
 * throw `SupabaseUnconfiguredError` when Supabase isn't configured; the store
 * falls back to local persistence in that case.
 */

import { getSupabase, SupabaseUnconfiguredError } from "@/lib/supabase/client";
import type { PandaNotification } from "./types";

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new SupabaseUnconfiguredError();
  return supabase;
}

type Row = {
  id: string;
  type: PandaNotification["type"];
  title: string;
  message: string;
  reference: string;
  read: boolean;
  metadata: PandaNotification["metadata"];
  created_at: string;
};

function mapRow(row: Row): PandaNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    reference: row.reference,
    read: row.read,
    metadata: row.metadata,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** All notifications for a user, newest first. */
export async function listNotifications(userId: string): Promise<PandaNotification[]> {
  const { data, error } = await client()
    .from("notifications")
    .select("id, type, title, message, reference, read, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[] | null)?.map(mapRow) ?? [];
}

/**
 * Insert a notification. Returns true when inserted, false when the
 * (user_id, reference) pair already exists (dedupe).
 */
export async function insertNotification(
  userId: string,
  notification: PandaNotification,
): Promise<boolean> {
  const { data, error } = await client()
    .from("notifications")
    .upsert(
      {
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        reference: notification.reference,
        read: notification.read,
        metadata: notification.metadata ?? {},
        created_at: new Date(notification.createdAt).toISOString(),
      },
      { onConflict: "user_id,reference", ignoreDuplicates: true },
    )
    .select("id")
    .single<{ id: string }>();
  if (error) throw error;
  return Boolean(data);
}

export async function markNotificationRead(userId: string, id: string): Promise<void> {
  const { error } = await client()
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await client()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}
