import { useState } from "react";
import { BookOpen, ListChecks, Rocket, Server, TerminalSquare, FolderTree } from "lucide-react";
import type { ContentLesson } from "@/content/schema";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { InstructionsPanel } from "./InstructionsPanel";
import { MissionSummary } from "./MissionSummary";
import { MissionPanel } from "./MissionPanel";
import { Terminal } from "./Terminal";
import { RepoVisualizer } from "./RepoVisualizer";
import { RepositoryInspector } from "./RepositoryInspector";
import { HintPanel } from "./HintPanel";
import { cn } from "@/lib/utils";

type Tab = "terminal" | "repository" | "inspector" | "mission" | "hints";

const TABS: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
  { id: "repository", label: "Repository", icon: Server },
  { id: "inspector", label: "Files", icon: FolderTree },
  { id: "mission", label: "Mission", icon: Rocket },
  { id: "hints", label: "Hints", icon: ListChecks },
];

export interface MobileTabsProps {
  lesson: ContentLesson;
}

/**
 * Mobile / tablet tabbed layout. Desktop renders the IDE grid instead.
 */
export function MobileTabs({ lesson }: MobileTabsProps) {
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<Tab>("terminal");

  if (isDesktop) return null;

  return (
    <div>
      <div className="sticky top-12 z-20 -mx-5 mb-4 border-b border-white/[0.03] bg-base/90 px-5 backdrop-blur-sm sm:-mx-8 sm:px-8">
        <div role="tablist" aria-label="Playground sections" className="flex gap-1 overflow-x-auto py-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id} type="button" role="tab" aria-selected={active} onClick={() => setTab(id)}
                className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150", active ? "bg-base-elevated text-text shadow-sm" : "text-text-muted hover:text-text")}>
                <Icon className={cn("size-3.5", active && "text-accent-hover")} />{label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "terminal" && <Terminal />}

      {tab === "repository" && (
        <div className="space-y-4">
          <RepoVisualizer />
          <MissionSummary xpReward={lesson.xpReward} durationMinutes={lesson.meta.durationMinutes} />
        </div>
      )}

      {tab === "inspector" && <RepositoryInspector />}

      {tab === "mission" && (
        <div className="space-y-4">
          <InstructionsPanel lesson={lesson} />
          <MissionPanel xpReward={lesson.xpReward} durationMinutes={lesson.meta.durationMinutes} />
        </div>
      )}

      {tab === "hints" && <HintPanel />}
    </div>
  );
}
