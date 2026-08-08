/**
 * Notification types + the in-memory shape used across the app.
 */

export type NotificationType = "achievement" | "lesson" | "module" | "streak" | "system";

export interface PandaNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Stable dedupe key, e.g. "achievement:first-lesson". */
  reference: string;
  read: boolean;
  /** Epoch ms. */
  createdAt: number;
  metadata?: {
    achievementId?: string;
    lessonSlug?: string;
    moduleId?: string;
  };
}

export interface NotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  reference: string;
  metadata?: PandaNotification["metadata"];
}
