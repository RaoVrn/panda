import { memo, useMemo, useState, type JSX } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BookMarked,
  Check,
  ChevronRight,
  Clock,
  Flame,
  GitBranch,
  Globe,
  History,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Rocket,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { ContentLesson, CourseModule } from "@/content/schema";
import { modules } from "@/content/curriculum";
import { allLessons, moduleLessons } from "@/content/lessons";
import { estimateMinutes } from "@/content/duration";
import { cn, formatDuration, percentComplete } from "@/lib/utils";
import { useProgressStore } from "@/features/progress/progressStore";
import { lessonStatus, moduleProgress, type LessonProgressState } from "@/features/progress/lessonProgress";
import { useLevel, useStreak } from "@/features/progress/hooks";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/IconButton";
import { Brand, Logo } from "@/components/brand/Logo";

export interface CourseSidebarProps {
  currentSlug?: string;
  currentModuleId?: string;
  onClose?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const moduleIcons: Record<string, JSX.Element> = {
  sparkles: <Sparkles className="size-4" aria-hidden="true" />,
  layers: <Layers className="size-4" aria-hidden="true" />,
  "git-branch": <GitBranch className="size-4" aria-hidden="true" />,
  globe: <Globe className="size-4" aria-hidden="true" />,
  rocket: <Rocket className="size-4" aria-hidden="true" />,
  history: <History className="size-4" aria-hidden="true" />,
};

const LessonItem = memo(function LessonItem({
  lesson,
  status,
  current,
  onNavigate,
}: {
  lesson: ContentLesson;
  status: ReturnType<typeof lessonStatus>;
  current: boolean;
  onNavigate?: () => void;
}) {
  const statusIcon =
    status === "completed" ? (
      <Check className="size-3.5 text-accent-hover" aria-hidden="true" />
    ) : status === "started" ? (
      <Play className="size-3 text-accent-hover" aria-hidden="true" />
    ) : (
      <span className="font-mono text-[10px] text-text-muted">
        {String(lesson.meta.order).padStart(2, "0")}
      </span>
    );

  const inner = (isActive: boolean) => (
    <span
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
        isActive || current
          ? "bg-accent-soft font-medium text-text ring-1 ring-inset ring-accent/20"
          : "text-text-secondary hover:bg-base-subtle hover:text-text",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center",
          (status === "completed" || status === "started") && "text-accent-hover",
        )}
      >
        {statusIcon}
      </span>
      <span className="truncate">{lesson.title}</span>
      {current && (
        <span
          aria-hidden="true"
          className="ml-auto size-1.5 rounded-full bg-accent"
          title="Current lesson"
        />
      )}
    </span>
  );

  return (
    <li>
      <NavLink to={`/lesson/${lesson.slug}`} className="block" onClick={onNavigate}>
        {({ isActive }) => inner(isActive)}
      </NavLink>
    </li>
  );
});

function ModuleGroup({
  module,
  state,
  query,
  currentLessonId,
  onNavigate,
}: {
  module: CourseModule;
  state: LessonProgressState;
  query: string;
  currentLessonId?: string;
  onNavigate?: () => void;
}) {
  const lessons = moduleLessons(module.id);
  const visible = lessons.filter(
    (l) => query === "" || l.title.toLowerCase().includes(query.toLowerCase()),
  );
  const progress = moduleProgress(module.id, state);
  const [open, setOpen] = useState(true);

  const remaining = progress.total - progress.completed;
  const estMin = lessons
    .filter((l) => !state.completedLessonIds.includes(l.id))
    .reduce((sum, l) => sum + estimateMinutes(l), 0);
  const comingSoon = lessons.length === 0;

  if (visible.length === 0) return null;

  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex w-full items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-base-subtle">
        <Link
          to={`/module/${module.id}`}
          title={module.title}
          aria-label={`Open ${module.title} module`}
          className="group flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition-colors hover:text-text"
        >
          {moduleIcons[module.icon ?? ""] ?? (
            <BookMarked className="size-3.5" aria-hidden="true" />
          )}
          <span className="truncate">{module.title}</span>
        </Link>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {progress.total > 0 && (
            <span className="text-[10px] tabular-nums text-text-muted">
              {progress.completed}/{progress.total}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${module.title}` : `Expand ${module.title}`}
            className="flex size-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-base-subtle hover:text-text"
          >
            <ChevronRight
              className={cn("size-3 transition-transform", open && "rotate-90")}
              aria-hidden="true"
            />
          </button>
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 px-2 pb-1">
        <div
          role="progressbar"
          aria-label={`${module.title} progress`}
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1 flex-1 overflow-hidden rounded-full bg-base-subtle"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-text-muted">
          {comingSoon ? (
            <Clock className="size-2.5" aria-hidden="true" />
          ) : (
            <Check className="size-2.5 text-accent-hover" aria-hidden="true" />
          )}
          {comingSoon ? "Coming soon" : remaining > 0 ? `${formatDuration(estMin)} left` : "Done"}
        </span>
      </div>

      {open && (
        <ul className="flex flex-col gap-0.5">
          {visible.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              status={lessonStatus(lesson, state)}
              current={lesson.id === currentLessonId}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Collapsed rail: module icons plus a level/streak summary. */
function CollapsedRail({
  onToggle,
  level,
  streak,
  currentModuleId,
}: {
  onToggle?: () => void;
  level: number;
  streak: number;
  currentModuleId?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center bg-base-elevated">
      <div className="flex flex-col items-center gap-1 pt-5">
        <Link
          to="/dashboard"
          className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-base-subtle"
          aria-label="Panda home"
          title="Panda"
        >
          <Logo size={22} />
        </Link>
      </div>

      <nav aria-label="Course" className="mt-4 flex-1 overflow-y-auto px-2">
        <ul className="flex flex-col items-center gap-1">
          {modules.map((module) => {
            const isActive = module.id === currentModuleId;
            const inner = (
              <>
                {moduleIcons[module.icon ?? ""] ?? (
                  <BookMarked className="size-4" aria-hidden="true" />
                )}
              </>
            );
            return (
              <li key={module.id}>
                <Link
                  to={`/module/${module.id}`}
                  title={module.title}
                  aria-label={module.title}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-accent-soft text-accent-hover"
                      : "text-text-muted hover:bg-base-subtle hover:text-text",
                  )}
                >
                  {inner}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col items-center gap-3 px-2 py-3">
        <span
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-accent-hover"
          title={`Level ${level} · ${streak} day streak`}
        >
          Lv {level}
        </span>
        {streak > 0 && (
          <span className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-warning">
            <Flame className="size-3.5" aria-hidden="true" />
            {streak}
          </span>
        )}
        <IconButton label="Expand sidebar" onClick={onToggle}>
          <PanelLeftOpen className="size-4" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}

export function CourseSidebar({
  currentSlug,
  currentModuleId,
  onClose,
  collapsed = false,
  onToggle,
}: CourseSidebarProps) {
  const { completedLessonIds, startedLessonIds } = useProgressStore();
  const level = useLevel();
  const streak = useStreak();
  const [query, setQuery] = useState("");

  const state: LessonProgressState = { completedLessonIds, startedLessonIds };

  const total = allLessons();
  const pct = useMemo(
    () => percentComplete(completedLessonIds.length, total.length),
    [completedLessonIds.length, total.length],
  );

  const currentLessonId = useMemo(() => {
    const next = total.find(
      (lesson) => !completedLessonIds.includes(lesson.id),
    );
    return next?.id;
  }, [total, completedLessonIds]);

  if (collapsed) {
    return (
      <CollapsedRail
        onToggle={onToggle}
        level={level.level}
        streak={streak.current}
        currentModuleId={currentModuleId}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-base-elevated">
      <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-5">
        <Link
          to="/dashboard"
          className="flex items-center"
          onClick={onClose}
        >
          <Brand size={26} />
        </Link>
        <div className="flex items-center gap-1">
          {onToggle && (
            <IconButton label="Collapse sidebar" onClick={onToggle}>
              <PanelLeftClose className="size-4" aria-hidden="true" />
            </IconButton>
          )}
          {onClose && (
            <IconButton label="Close navigation" onClick={onClose}>
              <X className="size-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Level + streak summary */}
      <div className="px-4 pb-3">
        <div className="rounded-xl border border-border-subtle bg-base-subtle/50 px-3 py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-text">Level {level.level}</span>
            <span className="ml-auto text-xs tabular-nums text-text-muted">{level.xp} XP</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div
              role="progressbar"
              aria-label="Progress to next level"
              aria-valuenow={Math.round(level.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-subtle"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${level.progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-text-muted">
              {level.remaining} XP
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
            <span>
              <span className="tabular-nums">{completedLessonIds.length}</span>/{total.length}{" "}
              lessons
            </span>
            {streak.current > 0 && (
              <span className="flex items-center gap-1 font-medium text-warning">
                <Flame className="size-3" aria-hidden="true" />
                {streak.current} day streak
              </span>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div
              role="progressbar"
              aria-label="Course progress"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1 flex-1 overflow-hidden rounded-full bg-base-subtle"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-text-muted">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <SearchInput
          placeholder="Search lessons"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <nav aria-label="Course" className="flex-1 overflow-y-auto px-2 pb-6">
        <ul className="flex flex-col">
          {modules.map((module) => (
            <ModuleGroup
              key={module.id}
              module={module}
              state={state}
              query={query}
              currentLessonId={currentSlug ? undefined : currentLessonId}
              onNavigate={onClose}
            />
          ))}
        </ul>
        <p className="flex items-center gap-1.5 px-3 py-4 text-xs text-text-muted">
          <Search className="size-3" aria-hidden="true" />
          {total.length} lessons
        </p>
      </nav>
    </div>
  );
}
