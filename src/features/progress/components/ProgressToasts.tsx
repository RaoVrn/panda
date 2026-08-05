import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useProgressStore } from "../progressStore";
import type { ProgressToast } from "../types";

function ToastView({ toast }: { toast: ProgressToast }) {
  const dismiss = useProgressStore((state) => state.dismissToast);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 2800);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast.id]);

  return (
    <motion.div
      role="status"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.9 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="pointer-events-none flex items-center gap-2 rounded-full border border-border-subtle bg-card px-4 py-2.5 shadow-card"
    >
      {toast.type === "xp" && (
        <>
          <motion.span
            className="text-sm font-semibold text-accent-hover"
            initial={reduceMotion ? false : { scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            +{toast.amount} XP
          </motion.span>
          <span className="text-xs text-text-muted">Nice work!</span>
        </>
      )}

      {toast.type === "achievement" && (
        <>
          <motion.span
            aria-hidden="true"
            className="text-base"
            initial={reduceMotion ? false : { scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            {toast.emoji}
          </motion.span>
          <span className="text-sm font-medium text-text">{toast.title}</span>
        </>
      )}

      {toast.type === "levelup" && (
        <>
          <motion.span
            aria-hidden="true"
            className="text-base"
            initial={reduceMotion ? false : { scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
          >
            ⭐
          </motion.span>
          <span className="text-sm font-semibold text-accent-hover">
            {toast.title}
          </span>
          <span className="text-xs text-text-muted">Level up!</span>
        </>
      )}

      {toast.type === "section" && (
        <>
          <span aria-hidden="true" className="text-base">
            {toast.emoji}
          </span>
          <span className="text-sm font-medium text-text">{toast.title}</span>
        </>
      )}
    </motion.div>
  );
}

/**
 * Global toast host for XP gains, achievements, level-ups and section
 * completions. Rendered once at the app root so notifications appear no
 * matter which page fires them.
 */
export function ProgressToasts() {
  const toasts = useProgressStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
