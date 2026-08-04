import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Commit {
  x: number;
  y: number;
  lane: number;
  hash: string;
  accent?: boolean;
}

interface Branch {
  lane: number;
  commits: Commit[];
  label?: { x: number; y: number; text: string };
}

const COMMIT_HASHES = ["c3a9f1", "b24de0", "a1f8b3", "9d2c41", "77fe02"];

function buildGraph() {
  const space = 46;
  const y = 18;

  const main: Commit[] = [
    { x: 24, y, lane: 0, hash: COMMIT_HASHES[0]! },
    { x: 24 + space, y, lane: 0, hash: COMMIT_HASHES[1]! },
    { x: 24 + space * 2, y, lane: 0, hash: COMMIT_HASHES[2]! },
    { x: 24 + space * 3, y, lane: 0, hash: COMMIT_HASHES[3]! },
  ];

  const feature: Commit[] = [
    { x: 24 + space, y, lane: 1, hash: COMMIT_HASHES[1]! },
    { x: 24 + space * 1.5, y, lane: 1, hash: COMMIT_HASHES[4]!, accent: true },
  ];

  const branches: Branch[] = [
    {
      lane: 0,
      commits: main,
      label: { x: 24 + space * 3 + 12, y: y + 4, text: "main" },
    },
    {
      lane: 1,
      commits: feature,
      label: { x: 24 + space * 1.5 + 12, y: y + 4, text: "feature" },
    },
  ];

  return branches;
}

function branchPoints(commits: Commit[], laneOffset: number) {
  return commits.map((c) => ({
    x: c.x + c.lane * laneOffset,
    y: c.y,
  }));
}

function pathFor(points: { x: number; y: number }[]) {
  if (points.length < 2) return null;
  const curve = 12;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1]!;
    const to = points[i]!;
    const midX = from.x + (to.x - from.x) / 2;
    d += ` L ${midX} ${from.y}`;
    d += ` C ${midX + curve} ${from.y}, ${midX + curve} ${to.y}, ${to.x} ${to.y}`;
  }
  return d;
}

export interface GitCommitGraphProps {
  className?: string;
  animate?: boolean;
}

export function GitCommitGraph({
  className,
  animate = true,
}: GitCommitGraphProps) {
  const branches = buildGraph();
  const laneOffset = 16;

  const pathMotionProps = animate
    ? {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.9, ease: "easeOut" as const },
      }
    : {};

  return (
    <svg
      viewBox="0 0 320 40"
      className={cn("w-full", className)}
      role="img"
      aria-label="Git branch graph showing the main branch and a diverged feature branch"
    >
      {branches.map((branch) => {
        const points = branchPoints(branch.commits, laneOffset);
        const path = pathFor(points);
        return (
          <g key={`${branch.lane}-branch`}>
            {path && (
              <motion.path
                d={path}
                fill="none"
                stroke={
                  branch.lane === 0
                    ? "var(--color-border-strong)"
                    : "var(--color-accent)"
                }
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...pathMotionProps}
              />
            )}
            {branch.commits.map((commit) => (
              <motion.g
                key={`${branch.lane}-${commit.hash}`}
                initial={animate ? { opacity: 0, scale: 0.4 } : false}
                whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3 }}
              >
                <circle cx={commit.x + commit.lane * laneOffset} cy={commit.y} r={6.5} className="fill-base" />
                <circle
                  cx={commit.x + commit.lane * laneOffset}
                  cy={commit.y}
                  r={6.5}
                  className={commit.accent ? "stroke-accent" : "stroke-border-strong"}
                  strokeWidth={1.4}
                />
                <circle
                  cx={commit.x + commit.lane * laneOffset}
                  cy={commit.y}
                  r={2.5}
                  className={commit.accent ? "fill-accent" : "fill-text-muted"}
                />
              </motion.g>
            ))}
            {branch.label && (
              <text
                x={branch.label.x}
                y={branch.label.y}
                className="fill-text-muted font-mono text-[9px]"
              >
                {branch.label.text}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}