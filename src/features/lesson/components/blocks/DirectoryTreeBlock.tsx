import type { ContentDirectoryTreeBlock } from "@/content/schema";
import { DirectoryTree } from "@/features/learning/components/DirectoryTree";

export function DirectoryTreeBlock({ block }: { block: ContentDirectoryTreeBlock }) {
  return (
    <DirectoryTree nodes={block.nodes} base={block.base} title={block.title} />
  );
}