import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  insertNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notificationService";
import type { NotificationInput, PandaNotification } from "./types";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface NotificationCenterState {
  items: PandaNotification[];
  userId: string | null;
  loading: boolean;
  error: boolean;
  bindUser: (userId: string | null) => void;
  /** Re-fetch from Supabase (used when the popover opens). */
  refresh: () => void;
  /** Create a notification (deduped by reference). */
  notify: (input: NotificationInput) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** Clear user-scoped notification state on sign-out. */
  clearForLogout: () => void;
}

/** Number of unread notifications. */
export function unreadCount(items: PandaNotification[]): number {
  return items.filter((item) => !item.read).length;
}

async function loadFromSupabase(
  userId: string,
  set: (partial: Partial<NotificationCenterState>) => void,
): Promise<void> {
  set({ loading: true, error: false });
  try {
    const remote = await listNotifications(userId);
    const local = useNotificationCenter.getState().items;
    const remoteRefs = new Set(remote.map((item) => item.reference));
    const pushUps = local.filter((item) => !remoteRefs.has(item.reference));
    set({ items: remote, loading: false, error: false });
    // Push any local-only notifications (e.g. earned offline) up to the cloud.
    for (const item of pushUps) {
      void insertNotification(userId, item).catch(() => {});
    }
  } catch {
    // Graceful fallback: keep local items; surface a subtle error state.
    set({ loading: false, error: true });
  }
}

export const useNotificationCenter = create<NotificationCenterState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      loading: false,
      error: false,

      bindUser: (userId) => {
        if (get().userId === userId) return;
        set({ userId, error: false });
        if (!userId || !isSupabaseConfigured()) return;
        void loadFromSupabase(userId, set);
      },

      refresh: () => {
        const { userId } = get();
        if (!userId || !isSupabaseConfigured()) return;
        void loadFromSupabase(userId, set);
      },

      notify: (input) => {
        if (get().items.some((item) => item.reference === input.reference)) return;
        const item: PandaNotification = {
          id: newId(),
          type: input.type,
          title: input.title,
          message: input.message,
          reference: input.reference,
          read: false,
          createdAt: Date.now(),
          metadata: input.metadata,
        };
        set((state) => ({ items: [item, ...state.items] }));
        const { userId } = get();
        if (userId && isSupabaseConfigured()) {
          void insertNotification(userId, item).catch(() => {});
        }
      },

      markRead: (id) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        }));
        const { userId } = get();
        if (userId && isSupabaseConfigured()) {
          void markNotificationRead(userId, id).catch(() => {});
        }
      },

      markAllRead: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, read: true })),
        }));
        const { userId } = get();
        if (userId && isSupabaseConfigured()) {
          void markAllNotificationsRead(userId).catch(() => {});
        }
      },

      clearForLogout: () => {
        set({ items: [], userId: null, error: false });
      },
    }),
    {
      name: "panda-notifications",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
