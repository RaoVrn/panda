import { useState } from "react";
import {
  Bell,
  Check,
  Gauge,
  HelpCircle,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/useTheme";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useLevel, useProfileStats } from "@/features/progress/hooks";
import { useAiChatStore } from "@/stores/aiChatStore";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { useAuth } from "@/features/user/auth/authContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
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

  const { configured } = useAuth();
  const prefs = usePreferencesStore();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const savePrefs = (patch: Parameters<typeof prefs.set>[0]) => {
    prefs.set(patch);
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt((prev) => (prev && Date.now() - prev > 1800 ? null : prev)), 1800);
  };

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <PageHeader
        title="Settings"
        subtitle="Customize Panda for your learning style."
        back={{ to: "/course", label: "Dashboard" }}
      >
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="mb-1 flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover">
              <Check className="size-3.5" aria-hidden="true" />
              Saved
            </span>
          )}
          {configured && (
            <span className="mb-1 flex items-center gap-1.5 rounded-full bg-base-subtle px-3 py-1 text-xs font-medium text-text-muted">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Synced to your account
            </span>
          )}
        </div>
      </PageHeader>

      <div className="mt-8 flex flex-col gap-6">
        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
            Appearance
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <OptionPill active={theme === "dark"} onClick={() => { setTheme("dark"); savePrefs({ theme: "dark" }); }}>
              <Moon className="size-4" aria-hidden="true" />
              Dark
              {theme === "dark" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
            <OptionPill active={theme === "light"} onClick={() => { setTheme("light"); savePrefs({ theme: "light" }); }}>
              <Sun className="size-4" aria-hidden="true" />
              Light
              {theme === "light" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
          </div>
        </Card>

        {/* Default lesson mode */}
        <Card className="p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
            Default lesson mode
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            Read mode plays lessons like a documentary. Interactive mode gives
            you controls and a live sandbox.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OptionPill active={mode === "read"} onClick={() => { setMode("read"); savePrefs({ defaultMode: "read" }); }}>
              Read
              {mode === "read" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
            <OptionPill active={mode === "interactive"} onClick={() => { setMode("interactive"); savePrefs({ defaultMode: "interactive" }); }}>
              Interactive
              {mode === "interactive" && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
            </OptionPill>
          </div>
        </Card>

        {/* Learning preferences */}
        <Card className="p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
            Learning preferences
          </h2>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-text">
                <Gauge className="size-4 text-text-muted" aria-hidden="true" />
                Animation speed
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["fast", "normal", "slow"] as const).map((speed) => (
                  <OptionPill key={speed} active={prefs.animationSpeed === speed} onClick={() => savePrefs({ animationSpeed: speed })}>
                    {speed[0]!.toUpperCase() + speed.slice(1)}
                  </OptionPill>
                ))}
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-text">
                <Zap className="size-4 text-text-muted" aria-hidden="true" />
                Quiz feedback
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <OptionPill active={prefs.quizPreference === "immediate"} onClick={() => savePrefs({ quizPreference: "immediate" })}>
                  Explain each answer
                </OptionPill>
                <OptionPill active={prefs.quizPreference === "end"} onClick={() => savePrefs({ quizPreference: "end" })}>
                  Check at the end
                </OptionPill>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-text">
                <HelpCircle className="size-4 text-text-muted" aria-hidden="true" />
                Panda AI explanations
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["simple", "balanced", "deep"] as const).map((style) => (
                  <OptionPill key={style} active={prefs.aiExplanationStyle === style} onClick={() => savePrefs({ aiExplanationStyle: style })}>
                    {style[0]!.toUpperCase() + style.slice(1)}
                  </OptionPill>
                ))}
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-text">
                <Bell className="size-4 text-text-muted" aria-hidden="true" />
                Daily reminder
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <OptionPill active={prefs.dailyReminder} onClick={() => savePrefs({ dailyReminder: !prefs.dailyReminder })}>
                  {prefs.dailyReminder ? "On" : "Off"}
                  {prefs.dailyReminder && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
                </OptionPill>
                <span className="text-xs text-text-muted">
                  Preference saved — reminders go live soon.
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress summary */}
        <Card className="p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
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
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
            Data
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            {configured
              ? "Your progress and preferences sync to your Panda account."
              : "Your progress is saved on this device. Sign in to sync it."}
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
