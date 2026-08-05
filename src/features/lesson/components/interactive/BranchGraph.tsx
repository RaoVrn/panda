import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { GitBranch, GitCommitHorizontal, Tag } from "lucide-react";
import type { BranchGraphStep } from "@/content/schema";
import type { LessonMode } from "@/stores/lessonModeStore";
import { VizChrome } from "./VizChrome";
import type { StepPlayer } from "./useStepPlayer";
import { useReadPlayback } from "./useReadPlayback";
import { useReportAi } from "@/stores/aiContextStore";
interface GraphNode {
  hash: string;
  message: string;
  branch: string;
  parents: string[];
  row: number;
  lane: number;
  tag?: string;
  head?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
  lanes: number;
  headBranch: string;
}

const STEP_H = 46;
const LANE_W = 46;
const M = 26;

function buildGraph(steps: BranchGraphStep[], baseBranch: string): GraphModel {
  const nodes = new Map<string, GraphNode>();
  const edges = new Set<string>();
  const tips = new Map<string, string>();
  const laneOf = new Map<string, number>();
  const order: string[] = [];
  let current = baseBranch;
  let seq = 0;
  let row = 0;

  const laneFor = (branch: string): number => {
    if (!laneOf.has(branch)) {
      laneOf.set(branch, laneOf.size);
    }
    return laneOf.get(branch)!;
  };

  const tipOf = (branch: string): string | undefined => tips.get(branch);

  for (const step of steps) {
    const lane = laneFor(step.branch);
    if (step.action === "commit") {
      const parent = tipOf(step.branch);
      const hash = `c${++seq}`;
      current = step.branch;
      nodes.set(hash, {
        hash,
        message: step.message ?? step.branch,
        branch: step.branch,
        parents: parent ? [parent] : [],
        row: row++,
        lane,
        head: true,
      });
      order.push(hash);
      if (parent) edges.add(`${hash}->${parent}`);
      tips.set(step.branch, hash);
    } else if (step.action === "moveHead") {
      if (step.branch !== baseBranch || tipOf(step.branch)) current = step.branch;
    } else if (step.action === "tag") {
      const tip = tipOf(step.branch);
      if (tip && step.tag) {
        const node = nodes.get(tip)!;
        node.tag = step.tag;
      }
    } else if (step.action === "merge") {
      const head = tipOf(current);
      const target = tipOf(step.branch);
      if (!head || !target || head === target) continue;
      // Fast-forward: target is already ahead of head.
      const ff = (() => {
        let cursor: string | undefined = target;
        const seen = new Set<string>();
        while (cursor) {
          if (cursor === head) return true;
          if (seen.has(cursor)) return false;
          seen.add(cursor);
          const parents: string[] = nodes.get(cursor)?.parents ?? [];
          cursor = parents.length > 0 ? parents[0] : undefined;
        }
        return false;
      })();
      if (ff) {
        tips.set(current, target);
        continue;
      }
      const hash = `m${++seq}`;
      nodes.set(hash, {
        hash,
        message: `Merge ${step.branch} into ${current}`,
        branch: current,
        parents: [head, target],
        row: row++,
        lane: laneFor(current),
        head: true,
      });
      order.push(hash);
      edges.add(`${hash}->${head}`);
      edges.add(`${hash}->${target}`);
      tips.set(current, hash);
    }
  }

  // Recompute lanes so a branch keeps one lane across all its commits.
  const laneById = new Map<string, number>();
  let laneCount = 0;
  const assign = (branch: string) => {
    if (!laneById.has(branch)) laneById.set(branch, laneCount++);
    return laneById.get(branch)!;
  };
  for (const hash of order) {
    const node = nodes.get(hash)!;
    node.lane = assign(node.branch);
  }
  const finalLanes = laneCount;

  // Mark HEAD: the tip of the branch that HEAD ends on.
  const headTip = tips.get(current);
  for (const node of nodes.values()) node.head = false;
  if (headTip && nodes.has(headTip)) {
    nodes.get(headTip)!.head = true;
  }

  return {
    nodes: order.map((hash) => nodes.get(hash)!),
    edges: [...edges]
      .map((e) => {
        const [from, to] = e.split("->") as [string, string];
        return { from, to };
      })
      .filter((e) => nodes.has(e.from) && nodes.has(e.to)),
    lanes: finalLanes,
    headBranch: current,
  };
}

function NodeDot({
  node,
  active,
  revealed,
}: {
  node: GraphNode;
  active: boolean;
  revealed: boolean;
}) {
  const merge = node.message.startsWith("Merge ");
  const x = M + node.lane * LANE_W;
  const y = M + node.row * STEP_H;
  return (
    <g transform={`translate(${x} ${y})`}>
      {active && (
        <motion.circle
          r={11}
          fill="none"
          stroke="var(--color-accent, #e8874b)"
          strokeOpacity={0.5}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <motion.circle
        r={5.5}
        fill={merge ? "#e3b341" : "#e8874b"}
        initial={{ scale: 0, opacity: 0 }}
        animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      />
      <circle r={5.5} fill="none" stroke="#010409" strokeWidth={2} />
      {node.head && (
        <g className="pointer-events-none">
          <circle r={10} fill="none" stroke="#e8874b" strokeWidth={1.4} strokeDasharray="3 3" opacity={0.9} />
        </g>
      )}
    </g>
  );
}

export interface BranchGraphProps {
  title?: string;
  baseBranch?: string;
  steps: BranchGraphStep[];
  player: StepPlayer;
  mode: LessonMode;
}

/**
 * Animated branch graph. Commits drop onto lanes, HEAD follows the current
 * branch, branches split and merge. Read mode plays itself; Interactive mode
 * steps through with Previous/Next. The graph is computed from the authored
 * scenario, so lessons just describe what should happen.
 */
export function BranchGraph({
  title,
  baseBranch = "main",
  steps,
  player,
  mode,
}: BranchGraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { started } = useReadPlayback(ref, player, { interval: 1500 });

  const graph = useMemo(() => buildGraph(steps, baseBranch), [steps, baseBranch]);

  const step = Math.min(player.step, steps.length - 1);

  const activeNode = useMemo(() => {
    const s = steps[step];
    if (!s) return undefined;
    if (s.action === "commit") {
      return graph.nodes.find((n) => n.message === s.message);
    }
    if (s.action === "merge") {
      return graph.nodes.find((n) => n.message === `Merge ${s.branch} into ${graph.headBranch}`);
    }
    if (s.action === "tag") {
      return graph.nodes.find((n) => n.tag === s.tag);
    }
    if (s.action === "moveHead") {
      return undefined;
    }
    return undefined;
  }, [steps, step, graph]);

  const revealCount = Math.max(0, Math.min(player.step, graph.nodes.length - 1));
  const visible = graph.nodes.slice(0, revealCount + 1);

  useReportAi(
    {
      visualization: `Branch graph: ${activeNode?.message ?? steps[step]?.action ?? ""}`,
    },
    [activeNode?.message, step],
  );

  const width = Math.max(240, M * 2 + graph.lanes * LANE_W);
  const height = Math.max(90, M * 2 + (graph.nodes.length > 0 ? graph.nodes[graph.nodes.length - 1]!.row : 0) * STEP_H + 16);

  const branchTips = useMemo(() => {
    const tips = new Map<string, string>();
    for (const node of graph.nodes) tips.set(node.branch, node.hash);
    return tips;
  }, [graph]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle bg-base-subtle/50 px-4 py-3">
        <GitBranch className="size-3.5 text-accent-hover" aria-hidden="true" />
        <p className="text-sm font-medium text-text">{title ?? "Branch graph"}</p>
      </div>

      <div className="overflow-x-auto p-3">
        <svg
          role="img"
          aria-label="Branch graph"
          width={width}
          height={height}
          className="block"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Edges */}
          {graph.edges.map((edge) => {
            const from = graph.nodes.find((n) => n.hash === edge.from);
            const to = graph.nodes.find((n) => n.hash === edge.to);
            if (!from || !to) return null;
            const shown = visible.some((n) => n.hash === from.hash) && visible.some((n) => n.hash === to.hash);
            if (!shown) return null;
            const x1 = M + from.lane * LANE_W;
            const y1 = M + from.row * STEP_H;
            const x2 = M + to.lane * LANE_W;
            const y2 = M + to.row * STEP_H;
            const path =
              x1 === x2
                ? `M ${x1} ${y1} L ${x2} ${y2}`
                : `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
            return (
              <motion.path
                key={`${edge.from}-${edge.to}`}
                d={path}
                fill="none"
                stroke="var(--color-border-strong, #3d4351)"
                strokeWidth={1.6}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            );
          })}

          {/* Nodes */}
          {visible.map((node) => (
            <NodeDot
              key={node.hash}
              node={node}
              active={activeNode?.hash === node.hash}
              revealed
            />
          ))}

          {/* Labels */}
          {visible.map((node) => (
            <text
              key={`label-${node.hash}`}
              x={M + node.lane * LANE_W + 11}
              y={M + node.row * STEP_H + 4}
              className="fill-text-muted"
              fontSize={11}
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              {node.tag ? `● ${node.tag}` : node.message}
            </text>
          ))}

          {/* Branch tips */}
          {[...branchTips.entries()].map(([branch, hash]) => {
            const node = graph.nodes.find((n) => n.hash === hash);
            if (!node || !visible.some((n) => n.hash === hash)) return null;
            const isHead = branch === graph.headBranch && node.head;
            return (
              <g
                key={`tip-${branch}`}
                transform={`translate(${M + node.lane * LANE_W} ${M + node.row * STEP_H - 16})`}
              >
                <rect
                  x={-4}
                  y={-9}
                  width={4 + branch.length * 6.4 + (isHead ? 38 : 0)}
                  height={16}
                  rx={8}
                  fill={isHead ? "#e8874b" : "#3d4351"}
                />
                <text
                  x={2}
                  y={2}
                  fontSize={10}
                  fontWeight={600}
                  fill={isHead ? "#010409" : "#e6edf3"}
                >
                  {branch}
                  {isHead ? " · HEAD" : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-border-subtle bg-base-subtle/30 px-4 py-2.5">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <GitCommitHorizontal className="size-3 text-accent-hover" aria-hidden="true" />
            commit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-warning" aria-hidden="true" />
            merge commit
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="size-3" aria-hidden="true" /> tag
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full ring-2 ring-accent" aria-hidden="true" /> HEAD
          </span>
        </p>
      </div>

      <VizChrome mode={mode} player={player} label="Step" started={started} />
    </div>
  );
}
