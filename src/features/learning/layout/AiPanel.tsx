import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const suggestions = [
  "What is a commit?",
  "Why do we use branches?",
  "What is HEAD?",
  "Explain merge.",
  "What is staging?",
];

export function AiPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: trimmed },
      {
        id: Date.now() + 1,
        role: "assistant",
        text: "I’ll explain that visually very soon. Panda AI is being wired up!",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-base-elevated">
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft">
          🐼
        </span>
        <div>
          <p className="text-sm font-semibold text-text">Panda AI</p>
          <p className="text-[11px] text-text-muted">Your Git tutor</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-text-muted">
          <span className="size-1.5 animate-pulse rounded-full bg-accent" />
          demo
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <Bot className="size-4 text-accent-hover" aria-hidden="true" />
              </span>
              <p className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm leading-relaxed text-text-secondary shadow-card">
                Hi! Ask me anything about Git, GitHub or version control.
              </p>
            </div>
            <p className="px-1 pt-2 text-xs uppercase tracking-wide text-text-muted">
              Suggestions
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "flex items-start gap-3",
              msg.role === "user" && "flex-row-reverse",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                msg.role === "assistant"
                  ? "bg-accent-soft"
                  : "bg-base-subtle",
              )}
            >
              {msg.role === "assistant" ? (
                <Bot className="size-4 text-accent-hover" aria-hidden="true" />
              ) : (
                <User className="size-4 text-text-secondary" aria-hidden="true" />
              )}
            </span>
            <p
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card",
                msg.role === "assistant"
                  ? "rounded-tl-sm bg-card text-text-secondary"
                  : "rounded-tr-sm bg-accent-soft text-text",
              )}
            >
              {msg.text}
            </p>
          </motion.div>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border-subtle bg-base-subtle px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle px-4 py-3">
        <form
          className="flex items-end gap-2 rounded-xl border border-border-subtle bg-base-subtle p-2 focus-within:border-border-strong"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
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
                send(input);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            aria-label="Send message"
            className="size-9"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-text-muted">
          Panda AI is a preview — no responses are sent yet.
        </p>
      </div>
    </div>
  );
}