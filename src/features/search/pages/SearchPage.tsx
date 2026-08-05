import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { allLessons } from "@/content/lessons";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { formatDuration, titleCase } from "@/lib/utils";

export function SearchPage() {
  const [query, setQuery] = useState("");

  const lessons = useMemo(() => allLessons(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q) ||
        (lesson.meta.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query, lessons]);

  return (
    <div className="mx-auto w-full max-w-2xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Search</h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Search across every lesson in the course.
      </p>

      <SearchInput
        className="mt-6"
        placeholder="Try 'snapshot' or 'GitHub'..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        aria-label="Search lessons"
      />

      {query.trim() === "" ? (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Browse all lessons
          </p>
          <ul className="mt-3 flex flex-col divide-y divide-border-subtle/60 rounded-2xl border border-border-subtle bg-card shadow-card">
            {lessons.map((lesson) => (
              <SearchResult lesson={lesson} key={lesson.id} />
            ))}
          </ul>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for “
            {query.trim()}”
          </p>
          <ul className="mt-3 flex flex-col divide-y divide-border-subtle/60 rounded-2xl border border-border-subtle bg-card shadow-card">
            {results.map((lesson) => (
              <SearchResult lesson={lesson} key={lesson.id} />
            ))}
          </ul>
        </div>
      ) : (
        <Card className="mt-10 flex flex-col items-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-base-subtle">
            <Search className="size-5 text-text-muted" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-medium text-text">No lessons found</p>
          <p className="mt-1 text-sm text-text-muted">
            Nothing matches “{query.trim()}”. Try a different word or browse the
            full course.
          </p>
        </Card>
      )}
    </div>
  );
}

function SearchResult({ lesson }: { lesson: ReturnType<typeof allLessons>[number] }) {
  return (
    <li>
      <Link
        to={`/lesson/${lesson.slug}`}
        className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-base-subtle focus-visible:outline-2 focus-visible:outline-offset--2 focus-visible:outline-accent"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
          <BookOpen className="size-4 text-accent-hover" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-text">
            {lesson.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-text-muted">
            {lesson.description}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-text-muted">
          <span>{formatDuration(lesson.meta.durationMinutes ?? 0)}</span>
          <span className="rounded-md bg-base-subtle px-2 py-0.5">
            {titleCase(lesson.meta.difficulty ?? "beginner")}
          </span>
          <ArrowRight
            className="size-3.5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-hover"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}
