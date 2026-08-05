import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  File,
  FileCode2,
  FileText,
  Folder,
  FolderGit2,
  FolderOpen,
} from "lucide-react";
import type { FolderTreeNode } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { cn } from "@/lib/utils";
import { useStepPlayer } from "@/features/lesson/components/interactive/useStepPlayer";
import { useReadPlayback } from "@/features/lesson/components/interactive/useReadPlayback";
import { VizChrome } from "@/features/lesson/components/interactive/VizChrome";
import { DiagramContainer } from "@/features/lesson/components/DiagramContainer";
import { useReportAi } from "@/stores/aiContextStore";

function fileIcon(name: string) {
  if (name === "README.md" || name.endsWith(".md")) return FileText;
  if (name.endsWith(".json")) return FileCode2;
  return File;
}

/** Depth-first reveal order: a folder appears before its contents. */
function flatten(nodes: FolderTreeNode[], prefix = ""): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    paths.push(path);
    if (node.children) paths.push(...flatten(node.children, path));
  }
  return paths;
}

export function NodeRow({
  node,
  depth,
  path,
  revealedPaths,
  selected,
  onSelect,
  interactive,
}: {
  node: FolderTreeNode;
  depth: number;
  path: string;
  revealedPaths: Set<string>;
  selected: string | null;
  onSelect: (name: string) => void;
  interactive: boolean;
}) {
  const isDir = node.type === "directory";
  const children = isDir && node.children ? node.children : [];
  const [open, setOpen] = useState(true);
  const isGit = node.name === ".git";
  const revealed = revealedPaths.has(path);
  const active = node.highlight || selected === node.name;

  if (!revealed) return null;

  return (
    <motion.li
      initial={{ opacity: 1, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div
        className={cn(
          "group relative flex items-center gap-1.5 rounded-lg px-2 py-[3px] transition-colors",
          "hover:bg-base-subtle",
          node.ignored && "opacity-60",
        )}
        style={{ paddingLeft: 6 + depth * 14 }}
      >
        {active && (
          <span aria-hidden="true" className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent" />
        )}
        {interactive && isDir && children.length > 0 && (
          <button
            type="button"
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex size-4 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:text-text"
          >
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </motion.span>
          </button>
        )}
        {isDir && !interactive && <span className="w-4 shrink-0" />}
        {isDir && children.length === 0 && interactive && <span className="w-4 shrink-0" />}

        {isDir ? (
          interactive ? (
            <button
              type="button"
              onClick={() => isDir && children.length > 0 && setOpen((v) => !v)}
              aria-expanded={isDir && children.length > 0 ? open : undefined}
              title={node.note}
              className={cn(
                "flex min-w-0 items-center gap-1.5 rounded px-1 py-px text-[13px] transition-colors",
                active ? "bg-accent-soft font-medium text-text" : "font-medium text-text hover:text-accent-hover",
              )}
            >
              {isGit ? (
                <FolderGit2
                  className={cn("size-4 shrink-0", active ? "text-accent-hover" : "text-accent-hover")}
                  aria-hidden="true"
                />
              ) : open ? (
                <FolderOpen
                  className={cn("size-4 shrink-0", active ? "text-accent-hover" : "text-accent-hover")}
                  aria-hidden="true"
                />
              ) : (
                <Folder className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
          ) : (
            <span className="flex min-w-0 items-center gap-1.5 px-1 py-px font-medium text-[13px] text-text">
              {isGit ? (
                <FolderGit2
                  className={cn("size-4 shrink-0", active ? "text-accent-hover" : "text-accent-hover")}
                  aria-hidden="true"
                />
              ) : open ? (
                <FolderOpen
                  className={cn("size-4 shrink-0", active ? "text-accent-hover" : "text-accent-hover")}
                  aria-hidden="true"
                />
              ) : (
                <Folder className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
              )}
              <span className="truncate">{node.name}</span>
            </span>
          )
        ) : (
          interactive ? (
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(node.name)}
              title={node.note}
              className={cn(
                "flex w-full items-center gap-1.5 rounded px-1 py-px text-left text-[13px] transition-colors",
                active ? "bg-accent-soft font-medium text-text" : "text-text-secondary group-hover:text-text",
              )}
            >
              {(() => {
                const Icon = fileIcon(node.name);
                return (
                  <Icon
                    className={cn("size-4 shrink-0", active ? "text-accent-hover" : "text-text-muted")}
                    aria-hidden="true"
                  />
                );
              })()}
              <span className="truncate">{node.name}</span>
            </button>
          ) : (
            <span
              className="flex w-full items-center gap-1.5 px-1 py-px text-[13px] text-text-secondary"
              title={node.note}
            >
              {(() => {
                const Icon = fileIcon(node.name);
                return (
                  <Icon
                    className={cn("size-4 shrink-0", active ? "text-accent-hover" : "text-text-muted")}
                    aria-hidden="true"
                  />
                );
              })()}
              <span className="truncate">{node.name}</span>
            </span>
          )
        )}

        {node.tracked && (
          <span className="ml-0.5 size-1.5 shrink-0 rounded-full bg-accent" title="Tracked" />
        )}
        {node.note && (
          <span className="hidden truncate text-xs text-text-muted sm:inline">
            {node.note}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isDir && children.length > 0 && open && (
          <motion.ul
            key={`${node.name}-children`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children.map((child) => (
              <NodeRow
                key={child.name}
                node={child}
                depth={depth + 1}
                path={`${path}/${child.name}`}
                revealedPaths={revealedPaths}
                selected={selected}
                onSelect={onSelect}
                interactive={interactive}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export interface DirectoryTreeProps {
  nodes: FolderTreeNode[];
  base?: string;
  title?: string;
  className?: string;
  mode: LessonMode;
}

/**
 * Animated VS Code-style directory tree. In Read mode it plays itself once on
 * scroll: folders and files appear one by one (`.git` and its internals last,
 * right where a `git init` would create them), passive and calm. In Interactive
 * mode the learner expands/collapses and clicks nodes while stepping through
 * reveal. Hovering any node shows a purpose tooltip.
 */
export function DirectoryTree({
  nodes,
  base,
  title,
  className,
  mode,
}: DirectoryTreeProps) {
  const order = flatten(nodes);
  const player = useStepPlayer(order.length);
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 900 });

  const interactive = mode === "interactive";
  const activeIndex = Math.min(player.step, order.length - 1);
  const revealedPaths = new Set(order.slice(0, activeIndex + 1));

  const [selected, setSelected] = useState<string | null>(null);

  useReportAi(
    {
      visualization: title
        ? `${title}, step ${activeIndex + 1} of ${order.length}`
        : `Project folder, step ${activeIndex + 1} of ${order.length}`,
    },
    [activeIndex, title, order.length],
  );

  return (
    <div ref={ref}>
      <DiagramContainer
        title={title}
        caption={base}
        icon={FolderGit2}
        className={className}
        footer={
          <VizChrome mode={mode} player={player} label="Step" started={started} />
        }
      >
        <ul className="space-y-[3px] pb-1 font-mono text-sm">
          {nodes.map((node) => (
            <NodeRow
              key={node.name}
              node={node}
              depth={0}
              path={node.name}
              revealedPaths={revealedPaths}
              selected={selected}
              onSelect={setSelected}
              interactive={interactive}
            />
          ))}
        </ul>
      </DiagramContainer>
    </div>
  );
}