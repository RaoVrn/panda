import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Check,
  Flame,
  Info,
  Layers,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  unreadCount,
  useNotificationCenter,
} from "./notificationCenterStore";
import type { PandaNotification, NotificationType } from "./types";

const TYPE_ICON: Record<NotificationType, typeof Trophy> = {
  achievement: Trophy,
  lesson: BookOpen,
  module: Layers,
  streak: Flame,
  system: Info,
};

function timeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Notification bell + popover. Real, persistent notifications only (loaded
 * from Supabase for the signed-in user, local persistence otherwise). Opens a
 * clean dropdown anchored to the bell, with read/unread state, mark-all-read,
 * empty + error fallbacks, and actionable items.
 */
export function NotificationsButton() {
  const items = useNotificationCenter((s) => s.items);
  const loading = useNotificationCenter((s) => s.loading);
  const error = useNotificationCenter((s) => s.error);
  const refresh = useNotificationCenter((s) => s.refresh);
  const markRead = useNotificationCenter((s) => s.markRead);
  const markAllRead = useNotificationCenter((s) => s.markAllRead);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const count = unreadCount(items);

  useEffect(() => {
    if (!open) return;
    refresh();
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, refresh]);

  const openItem = (item: PandaNotification) => {
    markRead(item.id);
    setOpen(false);
    if (item.type === "achievement" && item.metadata?.achievementId) {
      navigate(`/achievements?achievement=${item.metadata.achievementId}`);
    } else if (item.type === "lesson" && item.metadata?.lessonSlug) {
      navigate(`/lesson/${item.metadata.lessonSlug}`);
    } else if (item.type === "module") {
      navigate(`/dashboard#course-progress`);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-base-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Bell className="size-4" aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-base"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border-subtle bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-sm font-semibold text-text">Notifications</p>
              {count > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent-hover transition-colors hover:text-accent"
                >
                  <Check className="size-3" aria-hidden="true" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-96 overflow-y-auto">
              {loading && items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-text-muted">Loading…</p>
              ) : error && items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <p className="text-sm text-text-muted">Couldn't load notifications.</p>
                  <button
                    type="button"
                    onClick={refresh}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent-hover hover:text-accent"
                  >
                    <RotateCcw className="size-3" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-text">No new notifications</p>
                  <p className="mt-1 text-xs text-text-muted">You're all caught up.</p>
                </div>
              ) : (
                <ul className="flex flex-col">
                  {items.map((item) => {
                    const Icon = TYPE_ICON[item.type] ?? Info;
                    return (
                      <li key={item.id} className="border-b border-border-subtle/60 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => openItem(item)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-base-subtle",
                            !item.read && "bg-accent-soft/30",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                              item.read ? "bg-base-subtle text-text-muted" : "bg-accent-soft text-accent-hover",
                            )}
                          >
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span
                                className={cn(
                                  "truncate text-sm font-medium",
                                  item.read ? "text-text-secondary" : "text-text",
                                )}
                              >
                                {item.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-text-muted">
                                {timeAgo(item.createdAt)}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-text-muted">
                              {item.message}
                            </span>
                          </span>
                          {!item.read && (
                            <span
                              aria-hidden="true"
                              className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
