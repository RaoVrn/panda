import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/** Calm, consistent loading state shown while a route chunk is fetched. */
export function RouteFallback(): ReactNode {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Loading…</span>
      </div>
    </div>
  );
}
