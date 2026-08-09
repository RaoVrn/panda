/**
 * Storage switch  -  re-points every user-scoped store at the signed-in user.
 *
 * Called by the auth provider on every session change. When the user changes
 * (login, logout, account switch) it clears the previous user's in-memory
 * state and rehydrates from the new user's scoped localStorage keys, so User B
 * never inherits User A's local-only state. No-op when the user hasn't changed
 * (e.g. a token refresh).
 */

import { setActiveUser } from "@/lib/storage/userStorage";
import { useProgressStore } from "@/features/progress/progressStore";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { useNotificationCenter } from "@/features/notifications/notificationCenterStore";
import { useReadingStore } from "@/stores/readingStore";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { useMemoryStore } from "@/features/ai/memory/conversationMemory";

interface ScopedStore {
  getInitialState: () => unknown;
  persist: {
    getOptions: () => { merge?: unknown };
    setOptions: (options: { merge?: unknown }) => void;
    rehydrate: () => Promise<void>;
  };
}

/** Re-point one user-scoped store at the active user, returning after rehydrate. */
function scopeStore(store: ScopedStore): Promise<void> {
  const initial = store.getInitialState();
  const prevMerge = store.persist.getOptions().merge;
  // Rehydrate with replace semantics: the result is the store's initial
  // state plus the persisted fields, never a merge over the previous user's
  // in-memory state (which would leak their local-only fields).
  store.persist.setOptions({
    merge: (persisted: unknown) =>
      ({ ...(initial as object), ...((persisted ?? {}) as object) }) as never,
  });
  return store.persist.rehydrate().then(() => {
    store.persist.setOptions({ merge: prevMerge });
  });
}

const SCOPED_STORES: ScopedStore[] = [
  useProgressStore as unknown as ScopedStore,
  usePreferencesStore as unknown as ScopedStore,
  useNotificationCenter as unknown as ScopedStore,
  useReadingStore as unknown as ScopedStore,
  useLessonModeStore as unknown as ScopedStore,
  useMemoryStore as unknown as ScopedStore,
];

let lastUserId: string | null = null;

/**
 * Switch every user-scoped store to `userId`'s local state. Resolves once all
 * stores have rehydrated, so callers (e.g. the profile pull) can await it
 * before applying authoritative remote data.
 */
export function switchStorageUser(userId: string | null): Promise<void> {
  if (lastUserId === userId) return Promise.resolve();
  lastUserId = userId;
  setActiveUser(userId);

  const jobs = SCOPED_STORES.map(scopeStore);
  // The global AI store pulls the heavy global-context builder (which imports
  // the whole course registry), so it is loaded lazily here to keep the entry
  // bundle free of the course content.
  const globalAi = import("@/stores/globalAiStore").then(({ useGlobalAiStore }) =>
    scopeStore(useGlobalAiStore as unknown as ScopedStore),
  );

  return Promise.all([Promise.all(jobs), globalAi]).then(() => undefined);
}
