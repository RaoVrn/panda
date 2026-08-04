import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandBlockProps {
  label?: string;
  command: string;
  className?: string;
}

/**
 * A single Git command shown as a highlighted line, with a copy button.
 */
export function CommandBlock({ label, command, className }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn("group rounded-xl border border-border-subtle bg-base-elevated p-3", className)}>
      {label && (
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
      )}
      <div className="flex items-center gap-3">
        <span className="select-none font-mono text-accent-hover">$</span>
        <code className="flex-1 font-mono text-sm text-text">{command}</code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy command"}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle hover:text-text"
        >
          {copied ? (
            <Check className="size-3.5 text-accent-hover" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}