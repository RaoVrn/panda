import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CodeWindowProps {
  filename?: string;
  language?: string;
  copyable?: boolean;
  copyText?: string;
  children: ReactNode;
  className?: string;
}

/**
 * VS Code-style window chrome used by both Code and Editor blocks:
 * traffic lights, title, language badge and an optional copy button.
 */
export function CodeWindow({
  filename,
  language,
  copyable = false,
  copyText,
  children,
  className,
}: CodeWindowProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-[#0d1117] shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        {filename && (
          <span className="truncate font-mono text-xs text-[#8b949e]">{filename}</span>
        )}
        {language && (
          <span className="ml-auto rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-[#8b949e]">
            {language}
          </span>
        )}
        {copyable && (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy code"}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#8b949e] transition-colors hover:bg-white/[0.06] hover:text-[#e6edf3]"
          >
            {copied ? (
              <Check className="size-3.5 text-accent-hover" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}