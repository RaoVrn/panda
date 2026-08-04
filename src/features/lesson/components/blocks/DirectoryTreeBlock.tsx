import type { ContentDirectoryTreeBlock } from "@/content/schema";
import { DirectoryTree } from "@/features/lesson/components/DirectoryTree";
import { useLessonMode } from "@/features/lesson/lessonModeContext";

export function DirectoryTreeBlock({ block }: { block: ContentDirectoryTreeBlock }) {
  const { mode } = useLessonMode();
  return (
    <DirectoryTree
      nodes={block.nodes}
      base={block.base}
      title={block.title}
      mode={mode}
    />
  );
}