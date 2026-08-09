/**
 * User-scoped local storage.
 *
 * User-specific state (progress, preferences, notifications, conversations,
 * learning history) must never leak between people sharing one browser. Every
 * affected key is suffixed with the signed-in user's stable id, e.g.
 * `panda-progress-<userId>`. When nobody is signed in (anonymous mode) keys
 * stay unscoped and are purely device-local.
 *
 * The active user is set from the auth provider on every session change, so
 * the storage adapters that call `userScopedKey()` are always pointed at the
 * right person's data.
 */

let activeUserId: string | null = null;

/** Point local storage at a user's data (call on every auth change). */
export function setActiveUser(userId: string | null): void {
  activeUserId = userId;
}

/** The active signed-in user's id, or null in anonymous mode. */
export function getActiveUser(): string | null {
  return activeUserId;
}

/** Resolve a base storage key to the user-scoped key for the active user. */
export function userScopedKey(base: string): string {
  return activeUserId ? `${base}-${activeUserId}` : base;
}
