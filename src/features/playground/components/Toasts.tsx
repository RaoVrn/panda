import { AnimatePresence, motion } from "framer-motion";
import { Check, Lightbulb, X } from "lucide-react";
import { usePlaygroundStore } from "../playgroundStore";
import type { PlaygroundToast } from "../playgroundStore";
import { cn } from "@/lib/utils";

function Toast({ toast }: { toast: PlaygroundToast }) {
  const dismiss = usePlaygroundStore((s) => s.dismissToast);
  const isError = toast.kind === "error";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
        isError
          ? "border-[#ff7b72]/20 bg-[#ff7b72]/[0.08]"
          : "border-[#3fb950]/20 bg-[#3fb950]/[0.08]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
          isError ? "bg-[#ff7b72]/20 text-[#ff7b72]" : "bg-[#3fb950]/20 text-[#3fb950]",
        )}
      >
        {isError ? (
          <Lightbulb className="size-3" aria-hidden="true" />
        ) : (
          <Check className="size-3" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-[13px] leading-snug text-text-secondary">
        {toast.message}
      </span>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="flex size-5 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text"
        aria-label="Dismiss"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/**
 * Fixed-position toast overlay. Toasts appear for command successes (one-sentence
 * explanations of what Git just did) and for common errors (hints teaching the
 * learner why something failed). They slide up, stay for ~3s, then fade out.
 */
export function PlaygroundToasts() {
  const toasts = usePlaygroundStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex max-w-[360px] flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
