/**
 * chatService — persistent Panda AI conversations.
 *
 * Maps between the in-memory chat store and the Supabase tables
 * (chat_sessions, chat_messages, message_feedback). RLS keeps every row
 * scoped to the signed-in user. When Supabase isn't configured, the store
 * silently falls back to local persistence and these calls never happen.
 */

import { getSupabase, SupabaseUnconfiguredError } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/ai/types";

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new SupabaseUnconfiguredError();
  return supabase;
}

export interface ChatSessionMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessage: string | null;
  pinned: boolean;
  archived: boolean;
  feedback: Record<string, "like" | "dislike">;
  bookmarks: string[];
  tags: string[];
}

type SessionRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  pinned: boolean;
  archived: boolean;
  metadata: {
    feedback?: Record<string, "like" | "dislike">;
    bookmarks?: string[];
    tags?: string[];
  };
};

type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata: {
    error?: boolean;
    badges?: string[];
    source?: unknown;
    created_at?: number;
  };
};

function mapSession(row: SessionRow): ChatSessionMeta {
  return {
    id: row.id,
    title: row.title,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    lastMessage: row.last_message,
    pinned: row.pinned,
    archived: row.archived,
    feedback: row.metadata?.feedback ?? {},
    bookmarks: row.metadata?.bookmarks ?? [],
    tags: row.metadata?.tags ?? [],
  };
}

function toMessageRow(message: ChatMessage): MessageRow {
  return {
    id: message.id,
    role: message.role,
    content: message.text,
    metadata: {
      error: message.error,
      badges: message.badges,
      source: message.source,
      created_at: message.createdAt,
    },
  };
}

function fromMessageRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    text: row.content,
    error: row.metadata?.error ?? false,
    badges: row.metadata?.badges,
    source: (row.metadata?.source as ChatMessage["source"]) ?? undefined,
    createdAt: row.metadata?.created_at,
  };
}

/** All sessions for a user, newest first (no message bodies). */
export async function listChatSessions(userId: string): Promise<ChatSessionMeta[]> {
  const { data, error } = await client()
    .from("chat_sessions")
    .select("id, title, created_at, updated_at, last_message, pinned, archived, metadata")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as SessionRow[] | null)?.map(mapSession) ?? [];
}

/** Full message list for one session, oldest first. */
export async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await client()
    .from("chat_messages")
    .select("id, role, content, metadata")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as MessageRow[] | null)?.map(fromMessageRow) ?? [];
}

/** Upserts a session row (metadata carries feedback + bookmarks + tags). */
export async function upsertChatSession(
  userId: string,
  session: {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    pinned: boolean;
    archived: boolean;
    feedback: Record<string, "like" | "dislike">;
    bookmarks: string[];
    tags: string[];
    messages: ChatMessage[];
  },
): Promise<void> {
  const lastMessage =
    session.messages.length > 0
      ? [...session.messages].reverse().find((m) => m.role === "assistant" && !m.error)
          ?.text ?? session.messages[session.messages.length - 1]?.text ?? null
      : null;
  const { error } = await client().from("chat_sessions").upsert({
    id: session.id,
    user_id: userId,
    title: session.title,
    created_at: new Date(session.createdAt).toISOString(),
    updated_at: new Date(session.updatedAt).toISOString(),
    last_message: lastMessage,
    pinned: session.pinned,
    archived: session.archived,
    metadata: {
      feedback: session.feedback,
      bookmarks: session.bookmarks,
      tags: session.tags,
    },
  });
  if (error) throw error;
}

/** Replaces all messages for a session (delete + insert keeps it consistent). */
export async function replaceChatMessages(
  sessionId: string,
  messages: ChatMessage[],
): Promise<void> {
  const { error: deleteError } = await client()
    .from("chat_messages")
    .delete()
    .eq("session_id", sessionId);
  if (deleteError) throw deleteError;

  if (messages.length === 0) return;
  const rows = messages.map((m) => ({
    ...toMessageRow(m),
    session_id: sessionId,
    created_at: new Date(m.createdAt ?? Date.now()).toISOString(),
  }));
  const { error } = await client().from("chat_messages").upsert(rows);
  if (error) throw error;
}

/** Deletes a session (messages cascade). */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await client()
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) throw error;
}
