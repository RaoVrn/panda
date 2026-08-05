import type { ReactNode } from "react";

/**
 * Minimal, framework-safe syntax highlighter for code/editor blocks.
 * No external dependency. A token stream rendered as colored spans that match
 * the VS Code-dark aesthetic of the rest of the product.
 */

type TokenClass =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "plain";

const classes: Record<TokenClass, string> = {
  comment: "text-[#8b949e] italic",
  string: "text-[#a5d6ff]",
  keyword: "text-[#ff7b72]",
  number: "text-[#79c0ff]",
  function: "text-[#d2a8ff]",
  plain: "text-[#e6edf3]",
};

const KEYWORDS = new Set([
  "git",
  "add",
  "commit",
  "branch",
  "checkout",
  "switch",
  "merge",
  "rebase",
  "push",
  "pull",
  "clone",
  "status",
  "init",
  "const",
  "let",
  "var",
  "function",
  "return",
  "import",
  "export",
  "default",
  "from",
  "async",
  "await",
]);

function classify(word: string): TokenClass {
  if (KEYWORDS.has(word)) return "keyword";
  if (/^-?\d+(\.\d+)?$/.test(word)) return "number";
  if (/^[a-zA-Z_$][\w$]*$/.test(word)) return "function";
  return "plain";
}

/**
 * Tokenize a single line of code into colored spans.
 * Language-aware for bash; anything else falls back to the generic rules.
 */
export function highlightLine(line: string, language?: string): ReactNode[] {
  const commentPrefix = language === "bash" ? "#" : "//";
  const tokens = line.split(/(\s+|"[^"]*"|'[^']*')/g);
  return tokens.map((part, index) => {
    if (part.trim() === "") return part;
    if (part.startsWith('"') || part.startsWith("'")) {
      return (
        <span key={index} className={classes.string}>
          {part}
        </span>
      );
    }
    if (part.startsWith(commentPrefix)) {
      return (
        <span key={index} className={classes.comment}>
          {part}
        </span>
      );
    }
    const cls = classify(part);
    return (
      <span key={index} className={cls === "plain" ? undefined : classes[cls]}>
        {part}
      </span>
    );
  });
}