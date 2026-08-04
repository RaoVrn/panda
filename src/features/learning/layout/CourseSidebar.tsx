import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Check, Lock, Search, X } from "lucide-react";
import type { Lesson, Module } from "@/types/lesson";
import { course } from "@/content/roadmap";
import {
  allLessons,
  isLessonUnlocked,
  moduleLessons,
  modulesOf,
} from "@/lib/course";
import { cn, percentComplete } from "@/lib/utils";
import { useProgressStore } from "@/stores/progressStore";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/IconButton";

export interface CourseSidebarProps {
  currentSlug?: string;
  onClose?: () => void;
}

function LessonItem({
  lesson,
  completed,
  locked,
}: {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
}) {
  const statusIcon = completed ? (
    <Check className="size-3.5 text-accent-hover" aria-hidden="true" />
  ) : locked ? (
    <Lock className="size-3.5 text-text-muted" aria-hidden="true" />
  ) : (
    <span className="font-mono text-[10px] text-text-muted">
      {String(lesson.meta.order).padStart(2, "0")}
    </span>
  );

  const inner = (isActive: boolean) => (
    <span
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-accent-soft font-medium text-text"
          : "text-text-secondary hover:bg-base-subtle hover:text-text",
        locked && "text-text-muted",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center",
          completed && "text-accent-hover",
        )}
      >
        {statusIcon}
      </span>
      <span className="truncate">{lesson.meta.title}</span>
    </span>
  );

  if (locked) {
    return (
      <li aria-disabled="true">
        <span className="cursor-not-allowed">{inner(false)}</span>
      </li>
    );
  }

  return (
    <li>
      <NavLink to={`/lesson/${lesson.meta.slug}`} className="block">
        {({ isActive }) => inner(isActive)}
      </NavLink>
    </li>
  );
}

function ModuleGroup({
  module,
  completedIds,
  query,
}: {
  module: Module;
  completedIds: string[];
  query: string;
}) {
  const lessons = moduleLessons(course, module.id);
  const visible = lessons.filter(
    (l) =>
      query === "" ||
      l.meta.title.toLowerCase().includes(query.toLowerCase()),
  );

  if (visible.length === 0) return null;

  return (
    <li className="flex flex-col gap-0.5">
      <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {module.title}
      </p>
      <ul className="flex flex-col gap-0.5">
        {visible.map((lesson) => (
          <LessonItem
            key={lesson.meta.id}
            lesson={lesson}
            completed={completedIds.includes(lesson.meta.id)}
            locked={!isLessonUnlocked(lesson, completedIds)}
          />
        ))}
      </ul>
    </li>
  );
}

export function CourseSidebar({ onClose }: CourseSidebarProps) {
  const { completedLessonIds } = useProgressStore();
  const [query, setQuery] = useState("");

  const total = allLessons(course);
  const pct = useMemo(
    () => percentComplete(completedLessonIds.length, total.length),
    [completedLessonIds.length, total.length],
  );

  return (
    <div className="flex h-full flex-col bg-base-elevated">
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-5">
        <Link
          to="/course"
          className="flex items-center gap-2 font-semibold"
          onClick={onClose}
        >
          <span aria-hidden="true">🐼</span>
          <span className="tracking-tight">Panda</span>
        </Link>
        {onClose && (
          <IconButton label="Close navigation" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-text-secondary">Course progress</span>
          <span className="font-medium text-accent-hover">{pct}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 overflow-hidden rounded-full bg-base-subtle"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
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
          {modulesOf(course).map((module) => (
            <ModuleGroup
              key={module.id}
              module={module}
              completedIds={completedLessonIds}
              query={query}
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