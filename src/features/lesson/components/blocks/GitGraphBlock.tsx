import { useId } from "react";
import type { ContentGitGraphBlock } from "@/content/schema";

function pathFor(points: ContentGitGraphBlock["lines"][number]["points"]) {
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
 * Static SVG branch graph — circles and connecting lines only. No animation
 * yet, so it renders purely from block data and stays framework-light.
 */
export function GitGraphBlock({ block }: { block: ContentGitGraphBlock }) {
  const gradientId = useId();
  const width = block.width ?? 320;
  const height = block.height ?? 120;

  return (
    <figure className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      {block.title && (
        <figcaption className="border-b border-border-subtle px-5 py-3 text-sm font-medium text-text">
          {block.title}
        </figcaption>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Git branch graph">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-hover)" />
          </linearGradient>
        </defs>

        {block.lines.map((line) => {
          const path = pathFor(line.points);
          if (!path) return null;
          return (
            <path
              key={line.id}
              d={path}
              fill="none"
              stroke={line.accent ? `url(#${gradientId})` : "var(--color-border-strong)"}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          );
        })}

        {block.commits.map((commit) => (
          <g key={commit.id}>
            <circle
              cx={commit.x}
              cy={commit.y}
              r={6.5}
              fill="var(--color-base)"
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
          </g>
        ))}
      </svg>
    </figure>
  );
}