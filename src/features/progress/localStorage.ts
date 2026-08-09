/**
 * Storage layer abstraction.
 *
 * The whole progress feature persists through `StorageAdapter`, so swapping
 * localStorage for Supabase later only means providing a new adapter. The
 * zustand stores use `toZustandStorage` to feed the adapter into the persist
 * middleware.
 */

import { userScopedKey } from "@/lib/storage/userStorage";

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Browser localStorage adapter. */
export const localStorageAdapter: StorageAdapter = {
  get: (key) => window.localStorage.getItem(key),
  set: (key, value) => window.localStorage.setItem(key, value),
  remove: (key) => window.localStorage.removeItem(key),
};

/**
 * LocalStorage adapter that scopes keys to the signed-in user
 * (`panda-progress` → `panda-progress-<userId>`). Device-local in anonymous
 * mode. Used by every store that holds user-specific state.
 */
export const userScopedAdapter: StorageAdapter = {
  get: (key) => window.localStorage.getItem(userScopedKey(key)),
  set: (key, value) => window.localStorage.setItem(userScopedKey(key), value),
  remove: (key) => window.localStorage.removeItem(userScopedKey(key)),
};

/**
 * A no-op in-memory adapter, useful for tests and for the future Supabase
 * adapter to mirror against.
 */
export function createMemoryAdapter(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    get: (key) => store.get(key) ?? null,
    set: (key, value) => {
      store.set(key, value);
    },
    remove: (key) => {
      store.delete(key);
    },
  };
}

/** Adapts `StorageAdapter` to zustand's `StateStorage` for `persist`. */
export function toZustandStorage(adapter: StorageAdapter): {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
} {
  return {
    getItem: (name) => adapter.get(name),
    setItem: (name, value) => adapter.set(name, value),
    removeItem: (name) => adapter.remove(name),
  };
}
