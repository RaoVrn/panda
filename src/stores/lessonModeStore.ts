import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LessonMode = "read" | "interactive";

/**
 * Legacy persisted values from earlier iterations, mapped onto the current two
 * modes so returning learners aren't stranded. `live` → default read;
 * `step`/`interactive` → interactive.
 */
function normalize(mode: unknown): LessonMode {
  if (mode === "interactive" || mode === "step") return "interactive";
  return "read";
}

interface LessonModeState {
  /** Preferred visualization behavior. Read animates passively; Interactive exposes controls. */
  mode: LessonMode;
  setMode: (mode: LessonMode) => void;
  toggleMode: () => void;
}

/**
 * Dual visualization modes.
 *
 *  · Read (default): a beautiful passive lesson. Every visualization animates
 *    and teaches on its own (auto-typing, streaming, appearing nodes, moving
 *    HEAD). No Previous/Next or step controls anywhere; just a Replay.
 *    Feels like an Apple product page or an interactive documentary.
 *
 *  · Interactive: the same content, now controllable. Step through a timeline,
 *    expand a folder, edit a file, or type into a Git sandbox.
 *
 * The choice persists across lessons. Content is identical in both.
 */
export const useLessonModeStore = create<LessonModeState>()(
  persist(
    (set) => ({
      mode: "read",
      setMode: (mode) => set({ mode: normalize(mode) }),
      toggleMode: () =>
        set((state) => ({ mode: state.mode === "read" ? "interactive" : "read" })),
    }),
    { name: "panda-lesson-mode", partialize: (state) => ({ mode: state.mode }) },
  ),
);