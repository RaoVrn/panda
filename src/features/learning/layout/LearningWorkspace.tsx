import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { Bot, Menu } from "lucide-react";
import { CourseSidebar } from "@/features/learning/layout/CourseSidebar";
import { AiPanel } from "@/features/learning/layout/AiPanel";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

export interface LearningWorkspaceProps {
  children: ReactNode;
}

/**
 * Three-panel learning workspace.
 *
 * - Desktop (lg): fixed sidebar (280px) + canvas + AI panel (320px).
 * - Tablet (md): canvas with side panels as overlay drawers.
 * - Mobile: drawer navigation + floating AI trigger.
 */
export function LearningWorkspace({ children }: LearningWorkspaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-base text-text lg:flex-row">
      {/* Left sidebar — static on lg+, drawer below */}
      <aside
        aria-label="Course navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] lg:static lg:z-auto lg:block lg:shrink-0 lg:border-r lg:border-border-subtle",
          "hidden",
        )}
      >
        <CourseSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile / tablet sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl lg:hidden"
              aria-label="Course navigation"
            >
              <CourseSidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top bar (tablet / mobile) */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-base px-3 py-2 lg:hidden">
        <IconButton label="Open course navigation" onClick={() => setSidebarOpen(true)}>
          <Menu className="size-4" aria-hidden="true" />
        </IconButton>
        <span className="flex items-center gap-1.5 font-semibold">
          <span aria-hidden="true">🐼</span>
          <span className="text-sm tracking-tight">Panda</span>
        </span>
      </div>

      {/* Center panel */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>

      {/* Right AI panel — static on xl+, drawer below */}
      <aside
        aria-label="Panda AI"
        className={cn(
          "hidden xl:block xl:w-[320px] xl:shrink-0 xl:border-l xl:border-border-subtle",
        )}
      >
        <AiPanel />
      </aside>

      {/* AI drawer (tablet / mobile) */}
      <AnimatePresence>
        {aiOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-[320px] shadow-2xl xl:hidden"
              aria-label="Panda AI"
            >
              <div className="flex h-full flex-col">
                <div className="flex justify-end bg-base-elevated px-2 pt-2 lg:hidden">
                  <IconButton label="Close AI panel" onClick={() => setAiOpen(false)}>
                    <span className="sr-only">Close</span>
                    ✕
                  </IconButton>
                </div>
                <div className="min-h-0 flex-1">
                  <AiPanel />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating AI trigger (tablet / mobile) */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        aria-label="Open Panda AI"
        className="fixed bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full bg-accent text-text-inverse shadow-glow transition-transform hover:scale-105 xl:hidden"
      >
        <Bot className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}