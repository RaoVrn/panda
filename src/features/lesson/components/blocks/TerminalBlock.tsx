import type { ContentTerminalBlock } from "@/content/schema";
import { Terminal } from "@/features/learning/components/Terminal";

export function TerminalBlock({ block }: { block: ContentTerminalBlock }) {
  return (
    <Terminal
      title={block.title}
      prompt={block.prompt}
      lines={block.lines}
      height={240}
    />
  );
}