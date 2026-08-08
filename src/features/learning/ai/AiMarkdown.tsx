import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowUpRight,
  Check,
  Copy,
  Info,
  Lightbulb,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getLessonBySlug } from "@/content/lessons";
import { resolveRouteLink } from "@/lib/navigation/routeRegistry";

/**
 * Renders Panda AI's markdown replies: headings, lists, GFM tables, inline
 * and fenced code with a copy button, syntax highlighting, and rich callouts.
 *
 * Action buttons: any `[Label](route:<id>)` link resolves through the route
 * registry and renders as a real button (never a raw URL). Bare `/lesson/<slug>`
 * paths and `[Label](route:lesson:slug)` both open lessons directly.
 */
export function AiMarkdown({ text }: { text: string }) {
  // Turn bare lesson paths (/lesson/<slug>) into clickable lesson buttons.
  const linked = text.replace(
    /(^|\s)\/(lesson\/[a-z0-9-]+)/g,
    (_match, prefix: string, path: string) => {
      const slug = path.replace("lesson/", "");
      const lesson = getLessonBySlug(slug);
      const label = lesson ? lesson.title : `Lesson: ${slug.split("-").join(" ")}`;
      return `${prefix}[${label}](route:lesson:${slug})`;
    },
  );
  return (
    <div className="panda-ai space-y-2.5 text-[13px] leading-relaxed text-text-secondary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={{
          code: InlineOrBlockCode,
          pre: PreBlock,
          a: MarkdownLink,
          blockquote: BlockquoteCard,
        }}
      >
        {linked}
      </ReactMarkdown>
    </div>
  );
}

/** Internal `route:` links and lesson links become action buttons. */
function MarkdownLink({
  children,
  href,
}: {
  children?: ReactNode;
  href?: string;
}) {
  const routeUrl = href && href.startsWith("route:") ? resolveRouteLink(href) : null;
  if (routeUrl) {
    return (
      <Link
        to={routeUrl}
        className="inline-flex max-w-full items-center gap-1 rounded-lg border border-accent/30 bg-accent-soft/50 px-2.5 py-1 text-[12px] font-medium text-accent-hover transition-colors hover:bg-accent-soft"
      >
        <span className="truncate">{children}</span>
        <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
      </Link>
    );
  }
  if (href && href.startsWith("/")) {
    return (
      <Link
        to={href}
        className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border-subtle bg-base-subtle/60 px-2.5 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
      >
        <span className="truncate">{children}</span>
        <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-accent-hover underline underline-offset-2"
    >
      {children}
    </a>
  );
}

/** Callouts: "> **Tip:** ..." / "> **Warning:** ..." render as rich cards. */
function BlockquoteCard({ children }: { children?: ReactNode }) {
  const text = stringFromNode(children).toLowerCase();
  const Icon = text.includes("warning")
    ? TriangleAlert
    : text.includes("tip")
      ? Lightbulb
      : text.includes("success")
        ? CircleCheck
        : text.includes("error")
          ? TriangleAlert
          : text.includes("note")
            ? Info
            : Info;
  return (
    <div className="my-2 flex items-start gap-2.5 rounded-xl border border-border-subtle bg-base-subtle/40 px-3.5 py-2.5">
      <span className="mt-0.5 shrink-0 text-accent-hover">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-[13px] leading-relaxed text-text-secondary">
        {children}
      </div>
    </div>
  );
}

function stringFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(stringFromNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    return stringFromNode((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
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

/** Fenced code block: language label, copy button, horizontal scroll. */
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
