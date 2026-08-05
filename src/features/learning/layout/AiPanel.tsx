import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  KeyRound,
  RotateCcw,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { AiMarkdown } from "@/features/learning/ai/AiMarkdown";
import { TypingDots } from "@/features/learning/ai/TypingDots";
import { MessageActions } from "@/features/learning/ai/MessageActions";
import { useAiChatStore } from "@/stores/aiChatStore";
import { suggestionsFor } from "@/lib/ai/suggestions";
import { getLessonBySlug } from "@/content/lessons";
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
 * Panda AI, the context-aware Git mentor. A ChatGPT-like chat that streams
 * answers from Groq and automatically injects the learner's current lesson,
 * section, mode, visualization, terminal, editor, quiz and practice state.
 */
export function AiPanel({ onClose }: AiPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useAiChatStore((state) => state.messages);
  const isStreaming = useAiChatStore((state) => state.isStreaming);
  const status = useAiChatStore((state) => state.status);
  const apiConfigured = useAiChatStore((state) => state.apiConfigured);
  const failedTurn = useAiChatStore((state) => state.failedTurn);
  const send = useAiChatStore((state) => state.send);
  const regenerate = useAiChatStore((state) => state.regenerate);
  const retry = useAiChatStore((state) => state.retry);
  const clear = useAiChatStore((state) => state.clear);

  const { slug } = useParams<{ slug: string }>();
  const lesson = slug ? getLessonBySlug(slug) : undefined;
  const suggestions = suggestionsFor(lesson);

  // Auto-scroll to the newest content while chatting or streaming.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    send(trimmed);
  };

  return (
    <div className="flex h-full flex-col bg-base-elevated">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft">
          🐼
        </span>
        <div>
          <p className="text-sm font-semibold text-text">Panda AI</p>
          <p className="text-[11px] text-text-muted">Your Git tutor</p>
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
          {apiConfigured ? "Groq ready" : "Add API key"}
        </span>
        {messages.length > 0 && (
          <IconButton label="Clear chat" onClick={clear} className="size-8">
            <Trash2 className="size-3.5" aria-hidden="true" />
          </IconButton>
        )}
        {onClose && (
          <IconButton label="Close Panda AI" onClick={onClose} className="size-8">
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <Bot className="size-4 text-accent-hover" aria-hidden="true" />
              </span>
              <p className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm leading-relaxed text-text-secondary shadow-card">
                Hi! I'm Panda AI. Ask me anything about Git, GitHub or version
                control. I already know exactly where you are in the lesson.
              </p>
            </div>
            <p className="px-1 pt-2 text-xs uppercase tracking-wide text-text-muted">
              Try asking
            </p>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
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
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <Bot className="size-4 text-accent-hover" aria-hidden="true" />
              </span>
              <div className="min-w-0 max-w-[85%] flex-1">
                {!msg.error && !msg.streaming && msg.text.length > 0 && (
                  <MessageActions
                    disabled={isStreaming}
                    onAction={(action: StyleAction) => regenerate(msg.id, action)}
                  />
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
                      <AiMarkdown text={msg.text} />
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

      {/* Input */}
      <div className="border-t border-border-subtle px-4 py-3">
        <form
          className="flex items-end gap-2 rounded-xl border border-border-subtle bg-base-subtle p-2 focus-within:border-border-strong"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Ask Panda…"
            aria-label="Ask Panda AI"
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="size-9"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-text-muted">
          Panda AI teaches Git visually · answers by Groq
        </p>
      </div>

      {/* Suggestions: only when the conversation is empty */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle px-4 pb-3 pt-0">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              disabled={isStreaming}
              className="rounded-full border border-border-subtle bg-base-subtle px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text disabled:pointer-events-none disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
