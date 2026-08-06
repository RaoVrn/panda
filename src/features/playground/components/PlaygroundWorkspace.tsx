import { useEffect } from "react";
import type { ContentLesson } from "@/content/schema";
import { usePlaygroundStore } from "../playgroundStore";
import { InstructionsPanel } from "./InstructionsPanel";
import { MissionSummary } from "./MissionSummary";
import { MissionPanel } from "./MissionPanel";
import { Terminal } from "./Terminal";
import { RepoVisualizer } from "./RepoVisualizer";
import { RepositoryInspector } from "./RepositoryInspector";
import { MobileTabs } from "./MobileTabs";
import { PlaygroundToasts } from "./Toasts";

export interface PlaygroundWorkspaceProps {
  lesson: ContentLesson;
}

/**
 * The Interactive-mode workspace — one cohesive IDE, not a dashboard.
 *
 *   Lesson header · Mission progress strip
 *   ────────────────── Repository Visualizer ──────────────────
 *   ┌─────────────────────────────────────┬───────────┐
 *   │ Shell                               │  Mission  │
 *   ├─────────────────────────────────────┤ (sticky)  │
 *   │ Repository Inspector                │           │
 *   │ (Files & Status | History)          │           │
 *   └─────────────────────────────────────┴───────────┘
 *   [Need help? ▸] (expands hints inline)
 *
 * Panels are merged where possible so page height drops ~35%.
 */
export function PlaygroundWorkspace({ lesson }: PlaygroundWorkspaceProps) {
  const mount = usePlaygroundStore((state) => state.mount);
  const unmount = usePlaygroundStore((state) => state.unmount);
  const mounted = usePlaygroundStore((state) => state.engine !== null && state.lessonId === lesson.id);

  useEffect(() => {
    mount(lesson);
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => unmount();
  }, [lesson, mount, unmount]);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" aria-live="polite">
        <div className="text-center">
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          <p className="text-sm text-text-muted">Preparing your Git sandbox…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + mission summary */}
      <div className="hidden space-y-5 lg:block">
        <InstructionsPanel lesson={lesson} />
        <MissionSummary xpReward={lesson.xpReward} durationMinutes={lesson.meta.durationMinutes} />
      </div>

      {/* Visualizer — the centerpiece */}
      <div className="hidden lg:block">
        <RepoVisualizer />
      </div>

      {/* IDE workspace */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-12">
        <div className="min-w-0 space-y-5 lg:col-span-8">
          <Terminal />
          <RepositoryInspector />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-20">
            <MissionPanel xpReward={lesson.xpReward} durationMinutes={lesson.meta.durationMinutes} />
          </div>
        </div>
      </div>

      <MobileTabs lesson={lesson} />
      <PlaygroundToasts />
    </div>
  );
}
