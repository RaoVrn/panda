import { cn } from "@/lib/utils";

/**
 * Render prose with lightweight inline-code: any `text` between backticks is
 * turned into a styled <code> span. Everything else stays plain, so content
 * authors can write git commands naturally without a full markdown engine.
 */
export function InlineText({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className={cn(
              "rounded-md border border-border-subtle bg-base-subtle/70 px-1.5 py-0.5 font-mono text-[0.85em] text-text",
            )}
          >
            {part}
          </code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}