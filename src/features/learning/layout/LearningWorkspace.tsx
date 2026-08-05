import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Menu } from "lucide-react";
import { useWorkspaceUI } from "@/stores/workspaceUIStore";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { CourseSidebar } from "@/features/learning/layout/CourseSidebar";
import { AiPanel } from "@/features/learning/layout/AiPanel";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

export interface LearningWorkspaceProps {
  children: ReactNode;
}

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 64;
const AI_WIDTH = 360;

const spring = { type: "tween", duration: 0.28, ease: [0.2, 0.8, 0.2, 1] } as const;

/**
 * Learning workspace.
 *
 * Desktop (lg+): a collapsible course sidebar (full rail or icons-only) on the
 * left, the lesson canvas in the middle, and a docked, collapsible AI panel on
 * the right. Both panels animate their width so content reflows smoothly.
 *
 * Mobile/tablet: the sidebar becomes a left drawer (starts collapsed) and the
 * AI panel a right overlay; a floating trigger opens it.
 */
export function LearningWorkspace({ children }: LearningWorkspaceProps) {
  const isDesktop = useIsDesktop();
  const { sidebarCollapsed, aiOpen, toggleSidebar, setAiOpen } =
    useWorkspaceUI();

  // Mobile drawers are ephemeral and independent of the persisted desktop state.
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mobileAi, setMobileAi] = useState(false);

  const aiActive = isDesktop ? aiOpen : mobileAi;

  // ESC closes the AI panel and the mobile sidebar drawer.
  useEffect(() => {
    if (!aiOpen && !mobileAi && !mobileSidebar) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAiOpen(false);
        setMobileAi(false);
        setMobileSidebar(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiOpen, mobileAi, mobileSidebar, setAiOpen]);

  // Docked AI on desktop: clicking the lesson content closes it.
  const handleContentClick = () => {
    if (isDesktop && aiOpen) setAiOpen(false);
  };

  return (
    <div className="flex h-screen flex-col bg-base text-text lg:flex-row">
      {/* Desktop sidebar rail */}
      <motion.aside
        aria-label="Course navigation"
        className="hidden lg:block lg:shrink-0 lg:overflow-hidden lg:border-r lg:border-border-subtle"
        animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={spring}
      >
        <CourseSidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </motion.aside>

      {/* Mobile / tablet sidebar drawer */}
      <AnimatePresence>
        {mobileSidebar && !isDesktop && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl"
              aria-label="Course navigation"
            >
              <CourseSidebar onClose={() => setMobileSidebar(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top bar (tablet / mobile) */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-base px-3 py-2 lg:hidden">
        <IconButton
          label="Open course navigation"
          aria-expanded={mobileSidebar}
          onClick={() => setMobileSidebar(true)}
        >
          <Menu className="size-4" aria-hidden="true" />
        </IconButton>
        <span className="flex items-center gap-1.5 font-semibold">
          <span aria-hidden="true">🐼</span>
          <span className="text-sm tracking-tight">Panda</span>
        </span>
      </div>

      {/* Center panel */}
      <div
        className="flex min-w-0 flex-1 flex-col overflow-y-auto"
        onClick={handleContentClick}
      >
        {children}
      </div>

      {/* Desktop AI panel: docked, animates width */}
      <motion.aside
        aria-label="Panda AI"
        aria-hidden={!aiOpen}
        className="hidden lg:block lg:overflow-hidden lg:border-l lg:border-border-subtle"
        animate={{ width: aiOpen ? AI_WIDTH : 0 }}
        transition={spring}
      >
        {aiOpen && (
          <div className="relative h-full w-[360px] shadow-card">
            <AiPanel onClose={() => setAiOpen(false)} />
          </div>
        )}
      </motion.aside>

      {/* Mobile / tablet AI overlay */}
      <AnimatePresence>
        {mobileAi && !isDesktop && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileAi(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-[360px] max-w-[92vw] shadow-2xl"
              aria-label="Panda AI"
            >
              <AiPanel onClose={() => setMobileAi(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Panda AI trigger: hidden while the panel is open */}
      <AnimatePresence>
        {!aiActive && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={() => {
              if (isDesktop) setAiOpen(true);
              else setMobileAi(true);
            }}
            aria-label="Open Panda AI"
            aria-expanded={false}
            className={cn(
              "fixed bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full",
              "bg-accent text-text-inverse shadow-glow transition-transform duration-200 hover:scale-105 active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            <Bot className="size-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}