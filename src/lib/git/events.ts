/**
 * Git State Engine  -  events.
 *
 * Every command emits events (FILE_STAGED, COMMIT_CREATED, HEAD_CHANGED, …) so
 * future animations, visualizations and the AI can react to exact changes
 * instead of diffing whole snapshots.
 */

import type { GitEvent, GitEventType } from "./types";

let seq = 0;

export function newEventId(): string {
  return `evt-${Date.now().toString(36)}-${(seq++).toString(36)}`;
}

export function createEvent(
  type: GitEventType,
  path?: string,
  payload?: Record<string, unknown>,
): GitEvent {
  return { id: newEventId(), type, path, timestamp: Date.now(), payload };
}

type Listener = (event: GitEvent) => void;

/** Tiny typed emitter used by the simulation (React-free). */
export class GitEventEmitter {
  private listeners = new Set<Listener>();

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: GitEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // A listener must never break the engine.
      }
    }
  }
}
