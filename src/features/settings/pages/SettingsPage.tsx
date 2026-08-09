import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/contexts/useTheme";
import type { Theme } from "@/contexts/themeContext";
import { useLessonModeStore } from "@/stores/lessonModeStore";
import { useProgressStore } from "@/features/progress/progressStore";
import { useOnboardingStore } from "@/features/onboarding/onboardingStore";
import { usePreferencesStore } from "@/features/user/preferences/preferencesStore";
import { useAuth } from "@/features/user/auth/authContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

const ANIMATION_OPTIONS = [
  { value: "slow", label: "Slow" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
] as const;

const EXPLANATION_OPTIONS = [
  { value: "simple", label: "Simple" },
  { value: "balanced", label: "Balanced" },
  { value: "deep", label: "Deep" },
] as const;

const THEMES: {
  id: Theme;
  label: string;
  description: string;
  preview: { base: string; surface: string; text: string; muted: string; accent: string };
}[] = [
  {
    id: "dark",
    label: "Dark",
    description: "Panda's default look.",
    preview: { base: "#0f1115", surface: "#15181d", text: "#f7f7f8", muted: "#6b6b74", accent: "#34b3a0" },
  },
  {
    id: "light",
    label: "Light",
    description: "Bright and comfortable.",
    preview: { base: "#f6f7f9", surface: "#ffffff", text: "#1d232b", muted: "#85909c", accent: "#0d9488" },
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Deep and cool.",
    preview: { base: "#0a0e16", surface: "#0e1420", text: "#eef1f7", muted: "#6a7690", accent: "#3cc2ad" },
  },
  {
    id: "soft",
    label: "Soft",
    description: "Calm and warm for reading.",
    preview: { base: "#f7f5f2", surface: "#fdfcfb", text: "#2c2823", muted: "#948a7e", accent: "#0f8f80" },
  },
];

/**
 * Panda settings. One grouped, Apple-inspired list: Appearance, Learning,
 * Panda AI, Notifications and Account & Data. Every control maps to a real,
 * persisted preference and updates the app immediately.
 */
export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mode = useLessonModeStore((s) => s.mode);
  const setMode = useLessonModeStore((s) => s.setMode);
  const resetProgress = useProgressStore((s) => s.reset);
  const { configured } = useAuth();
  const prefs = usePreferencesStore();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const savePrefs = (patch: Parameters<typeof prefs.set>[0]) => {
    prefs.set(patch);
    setSavedAt(Date.now());
    window.setTimeout(
      () => setSavedAt((prev) => (prev && Date.now() - prev > 1800 ? null : prev)),
      1800,
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      <PageHeader
        title="Settings"
        subtitle="Customize Panda for the way you learn."
        back={{ to: "/dashboard", label: "Dashboard" }}
      >
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover">
              <Check className="size-3.5" aria-hidden="true" />
              Saved
            </span>
          )}
          {configured && (
            <span
              className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-base-subtle px-3 py-1 text-xs font-medium text-text-muted"
              title="Preferences sync to your Panda account"
            >
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Synced
            </span>
          )}
        </div>
      </PageHeader>

      <div className="mt-8 flex flex-col gap-8">
        {/* Appearance */}
        <SettingsGroup title="Appearance">
          <div className="p-4">
            <p className="text-sm font-medium text-text">Theme</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Choose the look and feel of Panda.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {THEMES.map((themeOption) => (
                <ThemeCard
                  key={themeOption.id}
                  theme={themeOption}
                  selected={theme === themeOption.id}
                  onSelect={() => setTheme(themeOption.id)}
                />
              ))}
            </div>
          </div>
        </SettingsGroup>

        {/* Learning */}
        <SettingsGroup title="Learning">
          <SettingsRow
            label="Default lesson mode"
            description="Choose how lessons open by default."
            control={
              <Segmented
                value={mode}
                onChange={(value) => {
                  const next = value as "read" | "interactive";
                  setMode(next);
                  savePrefs({ defaultMode: next });
                }}
                options={[
                  { value: "read", label: "Read" },
                  { value: "interactive", label: "Interactive" },
                ]}
              />
            }
          />
          <SettingsRow
            label="Animation speed"
            description="Control Panda's transitions and learning animations."
            control={
              <Segmented
                value={prefs.animationSpeed}
                onChange={(value) => savePrefs({ animationSpeed: value as (typeof ANIMATION_OPTIONS)[number]["value"] })}
                options={ANIMATION_OPTIONS}
              />
            }
          />
        </SettingsGroup>

        {/* Panda AI */}
        <SettingsGroup title="Panda AI">
          <SettingsRow
            label="Explanation style"
            description="How detailed should Panda's answers be? Applied to every response."
            control={
              <Segmented
                value={prefs.aiExplanationStyle}
                onChange={(value) => savePrefs({ aiExplanationStyle: value as (typeof EXPLANATION_OPTIONS)[number]["value"] })}
                options={EXPLANATION_OPTIONS}
              />
            }
          />
        </SettingsGroup>

        {/* Notifications */}
        <SettingsGroup title="Notifications">
          <SettingsRow
            label="Achievements"
            description="Notify me when I unlock an achievement."
            control={
              <Switch
                checked={prefs.notifyAchievements}
                label="Achievement notifications"
                onChange={(value) => savePrefs({ notifyAchievements: value })}
              />
            }
          />
          <SettingsRow
            label="Lesson completed"
            description="Notify me when I finish a lesson."
            control={
              <Switch
                checked={prefs.notifyLessons}
                label="Lesson completed notifications"
                onChange={(value) => savePrefs({ notifyLessons: value })}
              />
            }
          />
          <SettingsRow
            label="Module completed"
            description="Notify me when I finish a module."
            control={
              <Switch
                checked={prefs.notifyModules}
                label="Module completed notifications"
                onChange={(value) => savePrefs({ notifyModules: value })}
              />
            }
          />
        </SettingsGroup>

        {/* Account & Data */}
        <SettingsGroup title="Account & Data">
          <SettingsRow
            label="Account"
            description="Manage your profile, avatar and sign-in details."
            control={
              <Link
                to="/account"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border-subtle bg-base-subtle px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
              >
                Manage account
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <SettingsRow
            label="Replay welcome tour"
            description="See the Panda introduction again."
            control={
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="size-3.5" aria-hidden="true" />}
                onClick={() => useOnboardingStore.getState().reset()}
              >
                Replay
              </Button>
            }
          />
          <SettingsRow
            label="Reset progress"
            description="Clear your lessons, XP, streaks and achievements."
            destructive
            control={
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="size-3.5" aria-hidden="true" />}
                onClick={() => setConfirmReset(true)}
              >
                Reset
              </Button>
            }
          />
        </SettingsGroup>
      </div>

      <ResetProgressModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetProgress();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`settings-${title}`}>
      <h2
        id={`settings-${title}`}
        className="px-1 text-xs font-semibold uppercase tracking-widest text-text-muted"
      >
        {title}
      </h2>
      <div className="mt-2 overflow-hidden rounded-2xl border border-border-subtle bg-card">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  label,
  description,
  control,
  destructive = false,
}: {
  label: string;
  description: string;
  control: ReactNode;
  destructive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border-subtle p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        destructive && "sm:border-danger/20",
      )}
    >
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", destructive ? "text-danger" : "text-text")}>
          {label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
      <div className="flex shrink-0 items-center justify-start sm:justify-end">{control}</div>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string; icon?: ReactNode }[];
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-lg border border-border-subtle bg-base-subtle p-0.5"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
              active
                ? "bg-card text-text shadow-sm ring-1 ring-inset ring-accent/20"
                : "text-text-muted hover:text-text",
            )}
          >
            {option.icon}
            {option.label}
            {active && <Check className="size-3.5 text-accent-hover" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: (typeof THEMES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const p = theme.preview;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${theme.label} theme`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "border-accent/40 bg-accent-soft/30"
          : "border-border-subtle bg-card hover:border-border",
      )}
    >
      <span
        className="block h-16 overflow-hidden rounded-lg border border-border-subtle"
        style={{ background: p.base }}
        aria-hidden="true"
      >
        <span
          className="m-2 block rounded-md p-2"
          style={{ background: p.surface, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <span className="mb-1.5 block h-1.5 w-10 rounded-full" style={{ background: p.accent }} />
          <span className="mb-1 block h-1.5 w-14 rounded-full" style={{ background: p.text, opacity: 0.85 }} />
          <span className="block h-1 w-10 rounded-full" style={{ background: p.muted }} />
        </span>
      </span>
      <span className="flex items-center justify-between gap-1">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-text">{theme.label}</span>
          <span className="block truncate text-[11px] text-text-muted">{theme.description}</span>
        </span>
        {selected && <Check className="size-4 shrink-0 text-accent-hover" aria-hidden="true" />}
      </span>
    </button>
  );
}

function ResetProgressModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="reset-progress-title">
      <div className="text-left">
        <span className="flex size-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <RotateCcw className="size-5" aria-hidden="true" />
        </span>
        <h2 id="reset-progress-title" className="mt-4 text-lg font-semibold tracking-tight text-text">
          Reset learning progress?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          This will clear your lessons, XP, streak, achievements, quizzes and
          learning history. Your account, profile, preferences and saved
          conversations will be kept.
        </p>
        <p className="mt-2 text-xs text-text-muted">This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Reset progress
          </Button>
        </div>
      </div>
    </Modal>
  );
}
