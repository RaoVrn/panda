import { File, Folder, FolderOpen } from "lucide-react";
import type { FolderTreeNode } from "@/types/lesson";
import { cn } from "@/lib/utils";
import { DiagramContainer } from "@/features/learning/components/DiagramContainer";

function NodeRow({ node, depth }: { node: FolderTreeNode; depth: number }) {
  const isDir = node.type === "directory";
  const children =
    isDir && node.children && node.children.length > 0 ? node.children : [];

  return (
    <li>
      <div
        className={cn("flex items-center gap-2 py-1", node.ignored && "opacity-50")}
        style={{ paddingLeft: depth * 16 }}
      >
        {isDir ? (
          <span className="flex items-center gap-1.5 text-text">
            {children.length > 0 ? (
              <FolderOpen
                className="size-4 shrink-0 text-accent-hover"
                aria-hidden="true"
              />
            ) : (
              <Folder className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
            )}
            <span className="text-sm font-medium">{node.name}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-text-secondary">
            <File className="size-4 shrink-0" aria-hidden="true" />
            <span className="text-sm">{node.name}</span>
          </span>
        )}
        {node.tracked && (
          <span
            className="ml-1 size-1.5 shrink-0 rounded-full bg-accent"
            title="Tracked"
          />
        )}
        {node.note && (
          <span className="truncate text-xs text-text-muted">— {node.note}</span>
        )}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <NodeRow key={child.name} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface DirectoryTreeProps {
  nodes: FolderTreeNode[];
  base?: string;
  title?: string;
  className?: string;
}

/**
 * Recursive, stateless directory tree. Renders structured FolderTreeData.
 * Ready to be wrapped with expand/collapse animation later.
 */
export function DirectoryTree({
  nodes,
  base,
  title,
  className,
}: DirectoryTreeProps) {
  return (
    <DiagramContainer title={title} caption={base} className={className}>
      <ul className="font-mono text-sm">
        {nodes.map((node) => (
          <NodeRow key={node.name} node={node} depth={0} />
        ))}
      </ul>
    </DiagramContainer>
  );
}