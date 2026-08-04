import type { ContentCodeBlock } from "@/content/schema";
import { CodeWindow } from "@/features/lesson/components/blocks/CodeWindow";
import { highlightLine } from "@/features/lesson/highlight.tsx";

export function CodeBlock({ block }: { block: ContentCodeBlock }) {
  const lines = block.code.split("\n");

  return (
    <CodeWindow
      filename={block.filename}
      language={block.language}
      copyable
      copyText={block.code}
    >
      <div className="overflow-x-auto py-3 font-mono text-[13px] leading-6">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            <span
              className="w-9 shrink-0 select-none border-r border-white/[0.03] pr-3 text-right text-[#484f58]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="whitespace-pre pl-3">
              {highlightLine(line, block.language)}
            </span>
          </div>
        ))}
      </div>
    </CodeWindow>
  );
}