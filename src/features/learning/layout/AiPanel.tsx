import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Copy,
  Download,
  KeyRound,
  MapPin,
  Pin,
  PinOff,
  RotateCcw,
  Square,
  Trash2,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { AiMarkdown } from "@/features/learning/ai/AiMarkdown";
import { TypingDots } from "@/features/learning/ai/TypingDots";
import { MessageActions } from "@/features/learning/ai/MessageActions";
import { useLessonContext } from "@/features/ai/hooks/useLessonContext";
import { usePandaChat } from "@/features/ai/hooks/usePandaChat";
import { Logo } from "@/components/brand/Logo";
import {
  buildEmptyState,
  buildNotice,
  buildQuickActions,
} from "@/features/ai/quick/QuickActions";
import type { AiProgressStatus, StyleAction } from "@/lib/ai/types";

const STATUS_LABELS: Record<AiProgressStatus, string> = {
  thinking: "Panda AI is thinking…",
  waiting: "Looking through the lesson…",
  switching: "Trying another model…",
  "almost-there": "Preparing an explanation…",
};

export interface AiPanelProps {
  onClose?: () => void;
}

/**
 * Panda AI  -  the mentor living inside Panda. The lesson's STRUCTURED context
 * (built from the authored lesson, not the DOM) is handed to the model every
 * turn, so it can teach the current lesson deeply and still answer anything.
 */
export function AiPanel({ onClose }: AiPanelProps) {
  const [input, setInput] = useState("");
  const [dismissedNotice, setDismissedNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    status,
    apiConfigured,
    failedTurn,
    submit,
    regenerate,
    retry,
    stop,
    clear,
    pinnedIds,
    togglePinned,
  } = usePandaChat();

  const context = useLessonContext();

  const quickActions = useMemo(() => buildQuickActions(context), [context]);
  const emptyState = useMemo(() => buildEmptyState(context), [context]);
  const notice = buildNotice(context);

  // Auto-scroll to the newest content while chatting or streaming.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const sendQuick = (text: string) => {
    if (submit(text)) setInput("");
  };

  const exportChat = () => {
    const text = messages
      .map((message) => `${message.role === "user" ? "You" : "Panda"}:\n${message.text}`)
      .join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "panda-ai-conversation.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col bg-base-elevated">
      {/* Header */}
      <div className="border-b border-border-subtle">
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft">
            <Logo size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-text">Panda AI</p>
            <p className="text-[11px] text-text-muted">Your mentor</p>
          </div>
          <span
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
              apiConfigured
                ? "bg-accent-soft text-accent-hover"
                : "bg-warning-soft text-warning",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                apiConfigured ? "animate-pulse bg-accent" : "bg-warning",
              )}
            />
            {apiConfigured ? "Ready" : "Add API key"}
          </span>
          {messages.length > 0 && (
            <>
              <IconButton label="Export conversation" onClick={exportChat} className="size-8">
                <Download className="size-3.5" aria-hidden="true" />
              </IconButton>
              <IconButton label="New conversation" onClick={clear} className="size-8">
                <Trash2 className="size-3.5" aria-hidden="true" />
              </IconButton>
            </>
          )}
          {onClose && (
            <IconButton label="Close Panda AI" onClick={onClose} className="size-8">
              <X className="size-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>

        {/* Currently helping with  -  the learner's live location */}
        {context.contextReady && (context.module || context.lessonTitle) && (
          <div className="border-t border-border-subtle bg-base-subtle/40 px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Currently helping with
            </p>
            <div className="mt-1 flex flex-col gap-0.5 text-xs leading-tight">
              {context.module && (
                <span className="truncate text-text-muted">{context.module}</span>
              )}
              {context.lessonTitle && (
                <>
                  <ChevronDown className="size-3 text-text-muted/50" aria-hidden="true" />
                  <span className="truncate font-semibold text-text">
                    {context.lessonTitle}
                  </span>
                </>
              )}
              {context.currentSection && (
                <>
                  <ChevronDown className="size-3 text-text-muted/50" aria-hidden="true" />
                  <span className="truncate text-text-secondary">
                    {context.currentSection}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3.5 shadow-card">
              <p className="text-sm font-medium text-text">
                Ask anything about this lesson.
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                Panda already knows the course, the lesson and what you're
                reading. Ask anything, lesson or not.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 px-1">
              {emptyState.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => sendQuick(item.prompt)}
                  disabled={isStreaming}
                  className="rounded-full border border-border-subtle bg-base-subtle px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text disabled:pointer-events-none disabled:opacity-40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
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
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-accent-soft px-4 py-3 text-sm leading-relaxed text-text shadow-card">
                  {msg.text}
                </p>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-start gap-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <Bot className="size-4 text-accent-hover" aria-hidden="true" />
              </span>
              <div className="min-w-0 max-w-[85%] flex-1">
                {!msg.error && !msg.streaming && msg.text.length > 0 && (
                  <div className="mb-1 flex items-center gap-1">
                    <MessageActions
                      disabled={isStreaming}
                      onAction={(action: StyleAction) => regenerate(msg.id, action)}
                    />
                    <CopyButton text={msg.text} />
                    <button
                      type="button"
                      onClick={() => togglePinned(msg.id)}
                      aria-label={pinnedIds.includes(msg.id) ? "Unpin explanation" : "Pin explanation"}
                      title={pinnedIds.includes(msg.id) ? "Unpin" : "Pin"}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md transition-colors",
                        pinnedIds.includes(msg.id)
                          ? "bg-accent-soft text-accent-hover"
                          : "text-text-muted hover:bg-base-subtle hover:text-text",
                      )}
                    >
                      {pinnedIds.includes(msg.id) ? (
                        <PinOff className="size-3" aria-hidden="true" />
                      ) : (
                        <Pin className="size-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                )}
                {msg.text.length === 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="inline-flex rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-card">
                      <TypingDots />
                    </div>
                    {isStreaming && status && (
                      <p className="text-[10px] text-text-muted" aria-live="polite">
                        {STATUS_LABELS[status]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "rounded-2xl rounded-tl-sm px-4 py-3 shadow-card",
                      msg.error
                        ? "border border-danger/30 bg-danger-soft/30"
                        : "bg-card",
                    )}
                  >
                    {msg.error ? (
                      <>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          {msg.text}
                        </p>
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
                      </>
                    ) : (
                      <>
                        <AssistantAnswer text={msg.text} />
                        {msg.source?.lesson && (
                          <div className="mt-3 flex items-start gap-1.5 border-t border-border-subtle/70 pt-2 text-[10px] leading-relaxed text-text-muted">
                            <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                            <span>
                              Based on{" "}
                              {[msg.source.course, msg.source.module, msg.source.lesson, msg.source.section]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* API key notice */}
      {!apiConfigured && (
        <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft/40 px-3 py-2.5">
          <KeyRound className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-text-secondary">
            Panda AI needs a Groq API key. Copy <code className="font-mono">.env.example</code>{" "}
            to <code className="font-mono">.env</code>, add{" "}
            <code className="font-mono">VITE_GROQ_API_KEY</code>, then restart the
            dev server.
          </p>
        </div>
      )}

      {/* Proactive nudge  -  dismissed once, reappears when it changes */}
      <AnimatePresence>
        {notice && notice !== dismissedNotice && (
          <motion.div
            key={notice}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-soft/40 px-3 py-2"
          >
            <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-text-secondary">
              {notice}
            </p>
            <button
              type="button"
              onClick={() => sendQuick(notice.includes("quiz") ? "Hint" : "Explain this section differently")}
              className="shrink-0 rounded-md bg-base px-2 py-1 text-[11px] font-medium text-text transition-colors hover:bg-base-subtle"
            >
              Yes
            </button>
            <IconButton
              label="Dismiss"
              onClick={() => setDismissedNotice(notice)}
              className="size-6"
            >
              <X className="size-3" aria-hidden="true" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-border-subtle px-4 py-3">
        <form
          className="flex items-end gap-2 rounded-xl border border-border-subtle bg-base-subtle p-2 focus-within:border-border-strong"
          onSubmit={(e) => {
            e.preventDefault();
            if (submit(input)) setInput("");
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Ask anything…"
            aria-label="Ask Panda AI"
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (submit(input)) setInput("");
              }
            }}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              title="Stop"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-base-subtle text-text-secondary transition-colors hover:bg-base-elevated hover:text-text"
            >
              <Square className="size-3.5 fill-current" aria-hidden="true" />
            </button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              aria-label="Send message"
              className="size-9"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </Button>
          )}
        </form>
      </div>

      {/* Context-aware quick actions */}
      <div className="flex gap-1.5 overflow-x-auto border-t border-border-subtle px-4 pb-3 pt-2 [scrollbar-width:none]">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => sendQuick(action.prompt)}
            disabled={isStreaming}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition-colors disabled:pointer-events-none disabled:opacity-40",
              action.label === "Explain selection"
                ? "border-accent/40 bg-accent-soft text-accent-hover"
                : "border-border-subtle bg-base-subtle text-text-secondary hover:border-border-strong hover:text-text",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Tiny copy button for assistant explanations. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy explanation"
      title="Copy explanation"
      className="flex size-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle hover:text-text"
    >
      {copied ? (
        <Check className="size-3 text-accent-hover" aria-hidden="true" />
      ) : (
        <Copy className="size-3" aria-hidden="true" />
      )}
    </button>
  );
}

function AssistantAnswer({ text }: { text: string }) {
  const long = text.length > 1600;
  const [expanded, setExpanded] = useState(!long);
  return (
    <>
      <div className={cn(!expanded && "max-h-64 overflow-hidden")}>
        <AiMarkdown text={text} />
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-medium text-accent-hover hover:text-accent"
        >
          {expanded ? "Show less" : "Show full explanation"}
        </button>
      )}
    </>
  );
}
