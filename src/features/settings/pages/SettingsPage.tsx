import { useState } from "react";
import { Check, Moon, RotateCcw, Sun, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/useTheme";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useLevel, useProfileStats } from "@/features/progress/hooks";
import { useAiChatStore } from "@/stores/aiChatStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function OptionPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        active
          ? "border-accent/40 bg-accent-soft text-text"
          : "border-border-subtle bg-base-subtle text-text-secondary hover:border-border-strong hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mode = useLessonModeStore((s) => s.mode);
  const setMode = useLessonModeStore((s) => s.setMode);
  const level = useLevel();
  const stats = useProfileStats();
  const resetProgress = useProgressStore((s) => s.reset);
  const clearAi = useAiChatStore((s) => s.clear);
  const aiMessages = useAiChatStore((s) => s.messages.length);

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Appearance, learning preferences and your on-device data.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Appearance
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <OptionPill active={theme === "dark"} onClick={() => setTheme("dark")}>
              <Moon className="size-4" aria-hidden="true" />
              Dark
              {theme === "dark" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
            <OptionPill active={theme === "light"} onClick={() => setTheme("light")}>
              <Sun className="size-4" aria-hidden="true" />
              Light
              {theme === "light" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
          </div>
        </Card>

        {/* Learning mode */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Default lesson mode
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            Read mode plays lessons like a documentary. Interactive mode gives
            you controls and a live sandbox.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OptionPill active={mode === "read"} onClick={() => setMode("read")}>
              Read
              {mode === "read" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
            <OptionPill
              active={mode === "interactive"}
              onClick={() => setMode("interactive")}
            >
              Interactive
              {mode === "interactive" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
          </div>
        </Card>

        {/* Progress summary */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Your progress
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Level" value={`${level.level}`} />
            <Stat label="Total XP" value={`${level.xp}`} />
            <Stat label="Lessons" value={`${stats.lessonsCompleted}`} />
            <Stat
              label="Quiz accuracy"
              value={stats.quizAccuracy === null ? "—" : `${stats.quizAccuracy}%`}
            />
          </div>
        </Card>

        {/* Data */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Data
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            Everything is saved on this device. Nothing is sent to a server.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {aiMessages > 0 && (
              <Button
                variant="secondary"
                leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
                onClick={clearAi}
              >
                Clear AI chat
              </Button>
            )}
            {!confirmReset ? (
              <Button
                variant="danger"
                leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
                onClick={() => setConfirmReset(true)}
              >
                Reset progress
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="danger" onClick={() => { resetProgress(); setConfirmReset(false); }}>
                  Confirm reset
                </Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
          {confirmReset && (
            <p className="mt-2 text-xs text-danger">
              This clears your XP, achievements, streak and lesson progress. It
              can't be undone.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-base-subtle/40 px-3 py-2.5 text-center">
      <p className="text-lg font-semibold text-text">{value}</p>
      <p className="text-[11px] text-text-muted">{label}</p>
    </div>
  );
}
