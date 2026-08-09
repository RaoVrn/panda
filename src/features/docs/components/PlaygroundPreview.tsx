import { Check, FileCode2, GitBranch, GitCommitHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { label: "Working Tree", files: ["index.html"] },
  { label: "Staging Area", files: ["index.html"] },
  { label: "Repository", files: ["2 commits"] },
  { label: "History", files: ["main"] },
] as const;

/**
 * A static miniature preview of the Panda playground, mirroring the real
 * layout: a terminal on the left and the four-column state visualizer on the
 * right. Illustrative only; it is not a live sandbox.
 */
export function PlaygroundPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border-subtle bg-base-subtle/40 px-3 py-2">
        <span className="size-2 rounded-full bg-border" aria-hidden="true" />
        <span className="size-2 rounded-full bg-border" aria-hidden="true" />
        <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
        <span className="ml-2 font-mono text-[10px] text-text-muted">~/project · main</span>
      </div>

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Terminal */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-[#0d1117] p-3 font-mono text-[11px] leading-relaxed">
          <p className="text-[#e6edf3]">
            <span className="text-accent-hover">$</span> git add index.html
          </p>
          <p className="text-[#7ee787]">index.html is now staged</p>
          <p className="text-[#e6edf3]">
            <span className="text-accent-hover">$</span> git commit -m "Update header"
          </p>
          <p className="text-[#7ee787]">[main 3f2a9b] Update header</p>
          <p className="mt-1 text-[10px] text-text-muted">Panda Shell</p>
        </div>

        {/* Visualizer */}
        <div
          aria-hidden="true"
          className="grid grid-cols-4 gap-1.5"
        >
          {COLUMNS.map((column, i) => (
            <div
              key={column.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2.5 text-center",
                i === 0 ? "border-warning/30 bg-warning-soft/20" : "border-border-subtle bg-base-subtle/40",
              )}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">
                {column.label}
              </span>
              {column.files.map((file) => (
                <span
                  key={file}
                  className={cn(
                    "flex w-full items-center justify-center gap-1 rounded-md px-1 py-1 text-[9px] font-medium",
                    i === 0 ? "bg-warning/15 text-warning" : "bg-card text-text-secondary",
                  )}
                >
                  {i === 0 ? (
                    <FileCode2 className="size-2.5 shrink-0" aria-hidden="true" />
                  ) : i === 1 ? (
                    <Check className="size-2.5 shrink-0" aria-hidden="true" />
                  ) : i === 2 ? (
                    <GitCommitHorizontal className="size-2.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <GitBranch className="size-2.5 shrink-0" aria-hidden="true" />
                  )}
                  {file}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
