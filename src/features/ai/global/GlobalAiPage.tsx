import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  ArrowUp,
  Bookmark,
  Check,
  Copy,
  CornerDownLeft,
  MessageSquarePlus,
  Pin,
  PinOff,
  RefreshCw,
  RotateCcw,
  Search,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  Pencil,
  Share2,
} from "lucide-react";
import { useAuth } from "@/features/user/auth/authContext";
import { useProfile } from "@/features/user/hooks/useProfile";
import { useGlobalAiStore } from "@/stores/globalAiStore";
import { setGlobalAiUser } from "@/features/ai/global/globalContext";
import { PandaMascot, type PandaState } from "@/components/brand/PandaMascot";
import { AiMarkdown } from "@/features/learning/ai/AiMarkdown";
import { TypingDots } from "@/features/learning/ai/TypingDots";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

const SUGGESTION_POOL = [
  "Continue today's lesson",
  "Ask me anything",
  "Practice Git",
  "Need interview help?",
  "Find weak topics",
  "Teach GitHub",
  "Build a roadmap",
  "Generate project ideas",
  "Explain rebase",
  "Quiz me",
  "Review my progress",
  "Recommend today's lesson",
];

const VISIBLE = 8;

/**
 * The global Panda assistant: your Git copilot, mentor and navigator. App-wide
 * awareness (entire course, progress, achievements, preferences), a calm
 * ChatGPT-style conversation, persistent conversations and a full set of
 * message actions.
 */
export function GlobalAiPage() {
  const { userId } = useAuth();
  const { data: profile } = useProfile(userId ?? undefined);

  const sessions = useGlobalAiStore((s) => s.sessions);
  const activeSessionId = useGlobalAiStore((s) => s.activeSessionId);
  const isStreaming = useGlobalAiStore((s) => s.isStreaming);
  const apiConfigured = useGlobalAiStore((s) => s.apiConfigured);
  const failedTurn = useGlobalAiStore((s) => s.failedTurn);

  const bindUser = useGlobalAiStore((s) => s.bindUser);
  const draft = useGlobalAiStore((s) => s.draft);
  const setDraft = useGlobalAiStore((s) => s.setDraft);
  const send = useGlobalAiStore((s) => s.send);
  const regenerate = useGlobalAiStore((s) => s.regenerate);
  const retry = useGlobalAiStore((s) => s.retry);
  const continueTurn = useGlobalAiStore((s) => s.continueTurn);
  const stop = useGlobalAiStore((s) => s.stop);
  const newChat = useGlobalAiStore((s) => s.newChat);
  const openSession = useGlobalAiStore((s) => s.openSession);
  const deleteSession = useGlobalAiStore((s) => s.deleteSession);
  const renameSession = useGlobalAiStore((s) => s.renameSession);
  const duplicateSession = useGlobalAiStore((s) => s.duplicateSession);
  const togglePin = useGlobalAiStore((s) => s.togglePin);
  const toggleArchive = useGlobalAiStore((s) => s.toggleArchive);
  const setFeedback = useGlobalAiStore((s) => s.setFeedback);
  const toggleBookmark = useGlobalAiStore((s) => s.toggleBookmark);
  const setScrollTop = useGlobalAiStore((s) => s.setScrollTop);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);
  const feedback = activeSession?.feedback ?? {};
  const bookmarks = activeSession?.bookmarks ?? [];

  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | undefined>(undefined);
  const nearBottomRef = useRef(true);
  const lastSessionRef = useRef<string | null>(null);

  useEffect(() => {
    bindUser(userId ?? null);
  }, [userId, bindUser]);

  useEffect(() => {
    setGlobalAiUser({ name: profile?.name, email: profile?.email });
    return () => setGlobalAiUser(null);
  }, [profile]);

  // Track scroll position: remember it per conversation, restore it on reopen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (!activeSessionId) return;
      window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        setScrollTop(activeSessionId, el.scrollTop);
      }, 500);
    };
    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollTimerRef.current);
    };
  }, [activeSessionId, setScrollTop]);

  // Restore the saved scroll position when a conversation opens.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (lastSessionRef.current === activeSessionId) return;
    lastSessionRef.current = activeSessionId;
    const saved = activeSession?.scrollTop;
    if (saved) el.scrollTop = saved;
    nearBottomRef.current =
      saved === undefined || saved >= el.scrollHeight - el.clientHeight - 80;
  }, [activeSessionId, activeSession]);

  // Auto-scroll to the newest content only while near the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    send(trimmed);
    setDraft("");
  };

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = sessions.filter((s) => {
      if (q === "") return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q))
      );
    });
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions, query]);

  const pinned = sorted.filter((s) => s.pinned && !s.archived);
  const recent = sorted.filter((s) => !s.pinned && !s.archived);
  const archived = sorted.filter((s) => s.archived);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:flex-row">
      {/* Sidebar: conversation history */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border-subtle pb-4 lg:w-72 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0">
        <Button onClick={newChat} className="w-full justify-start" leftIcon={<MessageSquarePlus className="size-4" aria-hidden="true" />}>
          New conversation
        </Button>

        <div className="relative mt-3 lg:mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-9 w-full rounded-lg border border-border-subtle bg-base-subtle pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:border-border-strong focus:outline-none"
          />
        </div>

        <nav aria-label="Conversations" className="mt-3 flex-1 overflow-y-auto lg:mt-4">
          {pinned.length > 0 && (
            <SessionGroup
              label="Pinned"
              sessions={pinned}
              activeId={activeSessionId}
              onOpen={openSession}
              onDelete={deleteSession}
              onPin={togglePin}
              onArchive={toggleArchive}
              onDuplicate={duplicateSession}
              onRename={renameSession}
            />
          )}
          <SessionGroup
            label="Recent chats"
            sessions={recent}
            activeId={activeSessionId}
            onOpen={openSession}
            onDelete={deleteSession}
            onPin={togglePin}
            onArchive={toggleArchive}
            onDuplicate={duplicateSession}
            onRename={renameSession}
          />
          {archived.length > 0 && (
            <SessionGroup
              label="Archived"
              sessions={archived}
              activeId={activeSessionId}
              onOpen={openSession}
              onDelete={deleteSession}
              onPin={togglePin}
              onArchive={toggleArchive}
              onDuplicate={duplicateSession}
              onRename={renameSession}
            />
          )}
          {sorted.length === 0 && (
            <p className="px-1 py-2 text-xs text-text-muted">
              {query ? "No matches." : "No conversations yet."}
            </p>
          )}
        </nav>
      </aside>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState
              onSubmit={submit}
              apiConfigured={apiConfigured}
              hasSessions={sessions.length > 0}
              onResume={() => {
                const latest = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
                if (latest) openSession(latest.id);
              }}
            />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-2 py-6">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-row-reverse items-start gap-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-base-subtle">
                      <User className="size-4 text-text-secondary" aria-hidden="true" />
                    </span>
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-accent-soft px-4 py-3 text-sm leading-relaxed text-text">
                      {msg.text}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-start gap-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-inset ring-accent/20">
                      <PandaMascot
                        state={pandaStateFor(msg.streaming, msg.error)}
                        size={40}
                      />
                    </span>
                    <div className="min-w-0 max-w-[85%] flex-1">
                      {msg.text.length === 0 ? (
                        <div className="inline-flex rounded-2xl rounded-tl-sm bg-card px-4 py-3">
                          <TypingDots />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "rounded-2xl rounded-tl-sm px-4 py-3",
                            msg.error
                              ? "border border-danger/30 bg-danger-soft/30"
                              : "bg-card",
                          )}
                        >
                          {msg.error ? (
                            <div>
                              <p className="text-sm leading-relaxed text-text-secondary">{msg.text}</p>
                              {failedTurn && (
                                <button
                                  type="button"
                                  onClick={retry}
                                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-base-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                                >
                                  <RotateCcw className="size-3" aria-hidden="true" />
                                  Try again
                                </button>
                              )}
                            </div>
                          ) : (
                            <>
                              <ContextBadges badges={msg.badges} />
                              <AiMarkdown text={msg.text} />
                              {!msg.streaming && (
                                <MessageActionsRow
                                  feedback={feedback[msg.id]}
                                  bookmarked={bookmarks.includes(msg.id)}
                                  disabled={isStreaming}
                                  onCopy={() => void copyText(msg.text)}
                                  onFeedback={(r) =>
                                    setFeedback(msg.id, feedback[msg.id] === r ? null : r)
                                  }
                                  onRegenerate={() => regenerate(msg.id)}
                                  onContinue={continueTurn}
                                  onShare={() => void shareMessage(activeSession, msg)}
                                  onBookmark={() => toggleBookmark(msg.id)}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ),
              )}
              {isStreaming && (
                <p className="pl-11 text-xs text-text-muted" aria-live="polite">
                  Panda is thinking…
                </p>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="pb-4 pt-2">
          <div className="mx-auto w-full max-w-3xl">
            {!apiConfigured && (
              <p className="mb-2 rounded-lg border border-warning/30 bg-warning-soft/40 px-3 py-2 text-xs text-text-secondary">
                Panda needs a Groq API key. Add{" "}
                <code className="font-mono">VITE_GROQ_API_KEY</code> to{" "}
                <code className="font-mono">.env</code> and restart the dev server.
              </p>
            )}
            <form
              className="flex items-end gap-2 rounded-2xl border border-border-subtle bg-base-subtle p-2.5 transition-colors focus-within:border-border-strong"
              onSubmit={(e) => {
                e.preventDefault();
                submit(draft);
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                placeholder="Ask Panda anything…"
                aria-label="Ask Panda"
                className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed text-text placeholder:text-text-muted focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(draft);
                  }
                }}
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop generating"
                  title="Stop"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-elevated text-text-secondary transition-colors hover:bg-base-subtle hover:text-text"
                >
                  <Square className="size-4 fill-current" aria-hidden="true" />
                </button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className="size-10"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
              )}
            </form>
            <p className="mt-2 text-center text-xs text-text-muted">
              Panda knows your entire course, progress and learning history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function SessionGroup({
  label,
  sessions,
  activeId,
  onOpen,
  onDelete,
  onPin,
  onArchive,
  onDuplicate,
  onRename,
}: {
  label: string;
  sessions: ReturnType<typeof useGlobalAiStore.getState>["sessions"];
  activeId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  if (sessions.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <ul className="mt-1.5 flex flex-col gap-0.5">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            active={session.id === activeId}
            onOpen={onOpen}
            onDelete={onDelete}
            onPin={onPin}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
            onRename={onRename}
          />
        ))}
      </ul>
    </div>
  );
}

function SessionRow({
  session,
  active,
  onOpen,
  onDelete,
  onPin,
  onArchive,
  onDuplicate,
  onRename,
}: {
  session: ReturnType<typeof useGlobalAiStore.getState>["sessions"][number];
  active: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(session.title);

  if (editing) {
    return (
      <li className="px-1 py-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onRename(session.id, value);
            setEditing(false);
          }}
          className="flex items-center gap-1.5"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-full rounded-lg border border-border-subtle bg-base-subtle px-2 text-sm text-text focus:border-accent focus:outline-none"
            aria-label="Rename conversation"
          />
          <IconButton label="Save" type="submit" className="size-8 shrink-0">
            <Check className="size-3.5" aria-hidden="true" />
          </IconButton>
        </form>
      </li>
    );
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onOpen(session.id)}
        className={cn(
          "flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left transition-colors",
          active
            ? "bg-accent-soft text-text"
            : "text-text-secondary hover:bg-base-subtle hover:text-text",
        )}
      >
        <span className="flex w-full items-center gap-1.5">
          {session.pinned && <Pin className="size-3 shrink-0 text-accent-hover" aria-hidden="true" />}
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{session.title}</span>
          <span className="shrink-0 text-[10px] text-text-muted">{formatDay(session.updatedAt)}</span>
        </span>
        {session.tags.length > 0 && (
          <span className="flex items-center gap-1">
            {session.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-1.5 py-px text-[9px] font-medium",
                  tag === "git"
                    ? "bg-accent-soft text-accent-hover"
                    : tag === "lesson"
                      ? "bg-base-subtle text-text-secondary"
                      : "bg-base-subtle text-text-muted",
                )}
              >
                {tag === "git" ? "Git" : tag === "lesson" ? "Lesson" : tag === "panda" ? "Panda" : "Chat"}
              </span>
            ))}
            <span className="ml-auto max-w-[60%] truncate text-[10px] text-text-muted">
              {previewOf(session)}
            </span>
          </span>
        )}
      </button>
      <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg bg-base-elevated p-0.5 shadow-card group-hover:flex">
        <IconButton label="Pin" onClick={() => onPin(session.id)} className="size-6">
          {session.pinned ? <PinOff className="size-3" aria-hidden="true" /> : <Pin className="size-3" aria-hidden="true" />}
        </IconButton>
        <IconButton label="Archive" onClick={() => onArchive(session.id)} className="size-6">
          {session.archived ? <ArchiveRestore className="size-3" aria-hidden="true" /> : <Archive className="size-3" aria-hidden="true" />}
        </IconButton>
        <IconButton label="Duplicate" onClick={() => onDuplicate(session.id)} className="size-6">
          <Copy className="size-3" aria-hidden="true" />
        </IconButton>
        <IconButton label="Rename" onClick={() => setEditing(true)} className="size-6">
          <Pencil className="size-3" aria-hidden="true" />
        </IconButton>
        <IconButton label="Delete" onClick={() => onDelete(session.id)} className="size-6 hover:text-danger">
          <Trash2 className="size-3" aria-hidden="true" />
        </IconButton>
      </div>
    </li>
  );
}

function ContextBadges({ badges }: { badges?: string[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted">
      <span>Using:</span>
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-base-subtle/60 px-1.5 py-0.5"
        >
          <Check className="size-2.5 text-accent-hover" aria-hidden="true" />
          {badge}
        </span>
      ))}
    </div>
  );
}

function MessageActionsRow({
  feedback,
  bookmarked,
  disabled,
  onCopy,
  onFeedback,
  onRegenerate,
  onContinue,
  onShare,
  onBookmark,
}: {
  feedback?: "like" | "dislike";
  bookmarked: boolean;
  disabled: boolean;
  onCopy: () => void;
  onFeedback: (rating: "like" | "dislike") => void;
  onRegenerate: () => void;
  onContinue: () => void;
  onShare: () => void;
  onBookmark: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2.5 flex items-center gap-0.5 border-t border-border-subtle/60 pt-2">
      <IconButton
        label="Copy"
        onClick={() => {
          onCopy();
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="size-7"
      >
        {copied ? <Check className="size-3 text-accent-hover" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
      </IconButton>
      <IconButton
        label="Like"
        onClick={() => onFeedback("like")}
        className={cn("size-7", feedback === "like" && "text-accent-hover")}
        disabled={disabled}
      >
        <ThumbsUp className="size-3" aria-hidden="true" />
      </IconButton>
      <IconButton
        label="Dislike"
        onClick={() => onFeedback("dislike")}
        className={cn("size-7", feedback === "dislike" && "text-danger")}
        disabled={disabled}
      >
        <ThumbsDown className="size-3" aria-hidden="true" />
      </IconButton>
      <IconButton label="Regenerate" onClick={onRegenerate} className="size-7" disabled={disabled}>
        <RefreshCw className="size-3" aria-hidden="true" />
      </IconButton>
      <IconButton label="Continue" onClick={onContinue} className="size-7" disabled={disabled}>
        <CornerDownLeft className="size-3" aria-hidden="true" />
      </IconButton>
      <IconButton label="Share" onClick={onShare} className="size-7">
        <Share2 className="size-3" aria-hidden="true" />
      </IconButton>
      <IconButton
        label="Bookmark"
        onClick={onBookmark}
        className={cn("size-7", bookmarked && "text-accent-hover")}
      >
        <Bookmark className={cn("size-3", bookmarked && "fill-current")} aria-hidden="true" />
      </IconButton>
    </div>
  );
}

function EmptyState({
  onSubmit,
  apiConfigured,
  hasSessions,
  onResume,
}: {
  onSubmit: (text: string) => void;
  apiConfigured: boolean;
  hasSessions: boolean;
  onResume: () => void;
}) {
  const [start, setStart] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStart((v) => (v + 3) % SUGGESTION_POOL.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < VISIBLE; i++) {
      out.push(SUGGESTION_POOL[(start + i) % SUGGESTION_POOL.length]!);
    }
    return out;
  }, [start]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 scale-110 rounded-full bg-accent-soft blur-3xl"
          />
          <PandaMascot state="idle" size={120} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          How can Panda help?
        </h1>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-text-secondary">
          Ask anything about Git, GitHub, software engineering, learning,
          projects or your progress.
        </p>
        {hasSessions && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onResume}
            className="mt-5"
            leftIcon={<RotateCcw className="size-3.5" aria-hidden="true" />}
          >
            Resume last chat
          </Button>
        )}
      </motion.div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((prompt) => (
            <motion.button
              key={`${start}-${prompt}`}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => onSubmit(prompt)}
              disabled={!apiConfigured}
              className="rounded-xl border border-border-subtle bg-card px-3.5 py-2.5 text-left text-[13px] font-medium text-text-secondary transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:text-text disabled:pointer-events-none disabled:opacity-40"
            >
              {prompt}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function pandaStateFor(streaming?: boolean, error?: boolean): PandaState {
  if (error) return "confused";
  if (streaming) return "thinking";
  return "success";
}

/** A short preview line for a conversation (last assistant reply or question). */
function previewOf(session: {
  messages: Array<{ role: string; text: string; error?: boolean }>;
}): string {
  const lastReply = [...session.messages]
    .reverse()
    .find((m) => m.role === "assistant" && !m.error && m.text.length > 0);
  const fallback = [...session.messages].reverse().find((m) => m.role === "user");
  const text = (lastReply?.text ?? fallback?.text ?? "").replace(/\s+/g, " ").trim();
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}

async function shareMessage(
  session: ReturnType<typeof useGlobalAiStore.getState>["sessions"][number] | null,
  message: { text: string },
): Promise<void> {
  const header = session ? `Panda · ${session.title}` : "Panda";
  await copyText(`${header}\n\n${message.text}`);
}

function formatDay(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
