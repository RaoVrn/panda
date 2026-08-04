import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DiagramContainer } from "@/features/learning/components/DiagramContainer";

export interface BranchGraphCommit {
  id: string;
  x: number;
  y: number;
  lane: number;
  label?: string;
  accent?: boolean;
}

export interface BranchGraphLine {
  id: string;
  points: Array<{ x: number; y: number }>;
  accent?: boolean;
}

export interface BranchGraphData {
  title?: string;
  commits: BranchGraphCommit[];
  lines: BranchGraphLine[];
  width?: number;
  height?: number;
}

function pathFor(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return null;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1]!;
    const to = points[i]!;
    const midX = from.x + (to.x - from.x) / 2;
    d += ` L ${midX} ${from.y}`;
    d += ` C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  }
  return d;
}

/**
 * Reusable SVG branch graph. Fully data-driven and animation-ready:
 * pass `animate`-style props via motion or wrap in a future controller.
 */
export function BranchGraph({
  data,
}: {
  data: BranchGraphData;
}) {
  const width = data.width ?? 320;
  const height = data.height ?? 120;
  const hasData = data.commits.length > 0 || data.lines.length > 0;

  if (!hasData) {
    return (
      <DiagramContainer title={data.title}>
        <div className="py-10 text-center text-sm text-text-muted">
          Branch graph coming soon.
        </div>
      </DiagramContainer>
    );
  }

  return (
    <DiagramContainer title={data.title}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Git branch graph"
      >
        {data.lines.map((line) => {
          const path = pathFor(line.points);
          if (!path) return null as ReactNode;
          return (
            <motion.path
              key={line.id}
              d={path}
              fill="none"
              stroke={line.accent ? "var(--color-accent)" : "var(--color-border-strong)"}
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          );
        })}
        {data.commits.map((commit) => (
          <motion.g
            key={commit.id}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.25 }}
          >
            <circle
              cx={commit.x}
              cy={commit.y}
              r={6.5}
              fill="var(--color-card)"
              stroke={commit.accent ? "var(--color-accent)" : "var(--color-border-strong)"}
              strokeWidth={1.4}
            />
            <circle
              cx={commit.x}
              cy={commit.y}
              r={2.5}
              fill={commit.accent ? "var(--color-accent)" : "var(--color-text-muted)"}
            />
            {commit.label && (
              <text
                x={commit.x + 10}
                y={commit.y + 4}
                className="fill-text-muted font-mono text-[9px]"
              >
                {commit.label}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </DiagramContainer>
  );
}