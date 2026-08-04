import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceUIState {
  sidebarCollapsed: boolean;
  aiOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAiOpen: (open: boolean) => void;
}

/**
 * Persisted workspace chrome state: the collapse state of the course
 * sidebar (icons-only rail vs full) and whether the floating AI panel is open.
 * Mobile always starts with the sidebar drawer closed regardless of this.
 */
export const useWorkspaceUI = create<WorkspaceUIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      aiOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setAiOpen: (aiOpen) => set({ aiOpen }),
    }),
    { name: "panda-workspace-ui" },
  ),
);
