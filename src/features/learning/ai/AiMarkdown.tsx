import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

/**
 * Renders Panda AI's markdown replies inside the chat panel: headings, lists,
 * inline code, GFM tables/tasks, and fenced code blocks with a copy button and
 * syntax highlighting (token colours live in global.css under `.panda-ai`).
 */
export function AiMarkdown({ text }: { text: string }) {
  return (
    <div className="panda-ai space-y-2 text-[13px] leading-relaxed text-text-secondary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={{
          code: InlineOrBlockCode,
          pre: PreBlock,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent-hover underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/** Inline code vs. block code (block code is wrapped by <PreBlock>). */
function InlineOrBlockCode({
  className,
  children,
  inline,
}: {
  className?: string;
  children?: ReactNode;
  inline?: boolean;
}) {
  const isBlock = Boolean(!inline && /language-/.test(className ?? ""));
  if (isBlock) {
    return <code className={className}>{children}</code>;
  }
  return (
    <code className="rounded-md border border-border-subtle bg-base-subtle px-1.5 py-0.5 font-mono text-[12px] text-accent-hover">
      {children}
    </code>
  );
}

/** Pulls the raw text out of a highlighted code element for the copy button. */
function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textFromNode((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/** Fenced code block: filename-ish label, copy button, horizontal scroll. */
function PreBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeNode = Array.isArray(children) ? children[0] : children;
  const raw = textFromNode(codeNode);
  const language =
    codeNode && typeof codeNode === "object" && "props" in codeNode
      ? /language-([\w-]+)/.exec(
          (codeNode.props as { className?: string }).className ?? "",
        )?.[1]
      : undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable: no-op */
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border-subtle bg-[#0d1117]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3 text-accent-hover" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-[#e6edf3]">
        {children}
      </pre>
    </div>
  );
}
