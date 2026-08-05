import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { allLessons } from "@/content/lessons";
import {
  buildSearchIndex,
  searchKindLabel,
  type SearchHit,
  type SearchKind,
} from "@/content/searchIndex";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn, formatDuration, titleCase } from "@/lib/utils";

const KIND_STYLE: Record<SearchKind, string> = {
  lesson: "bg-accent-soft text-accent-hover",
  module: "bg-accent-soft text-accent-hover",
  section: "bg-base-subtle text-text-secondary",
  command: "bg-base-subtle text-text-secondary",
  quiz: "bg-warning-soft text-warning",
  takeaway: "bg-base-subtle text-text-secondary",
  concept: "bg-base-subtle text-text-secondary",
};

export function SearchPage() {
  const [query, setQuery] = useState("");

  const lessons = useMemo(() => allLessons(), []);
  const index = useMemo(() => buildSearchIndex(), []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const moduleHits: SearchHit[] = [];
    const byLesson = new Map<string, SearchHit[]>();
    for (const hit of index) {
      if (!hit.text.toLowerCase().includes(q)) continue;
      if (hit.kind === "module") {
        moduleHits.push(hit);
        continue;
      }
      const group = byLesson.get(hit.lessonSlug) ?? [];
      group.push(hit);
      byLesson.set(hit.lessonSlug, group);
    }

    return {
      moduleHits,
      byLesson,
    };
  }, [query, index]);

  const lessonOrder = useMemo(
    () => lessons.map((lesson) => lesson.slug),
    [lessons],
  );
  const orderedSlugs = groups
    ? lessonOrder.filter((slug) => groups.byLesson.has(slug))
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Search</h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Find lessons, commands, concepts and quiz questions across the course.
      </p>

      <SearchInput
        className="mt-6"
        placeholder="Try 'git init' or 'snapshot'..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        aria-label="Search lessons, commands, concepts"
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
      ) : groups && (groups.moduleHits.length > 0 || orderedSlugs.length > 0) ? (
        <div className="mt-10 flex flex-col gap-8">
          {groups.moduleHits.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Modules
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {groups.moduleHits.map((hit) => (
                  <Link
                    key={hit.text}
                    to="/course"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-base-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                  >
                    <BookOpen className="size-3.5 text-accent-hover" aria-hidden="true" />
                    {hit.text}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {orderedSlugs.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {groups.moduleHits.length > 0 ? "Lessons" : "Results"}
              </p>
              <div className="mt-3 flex flex-col gap-4">
                {orderedSlugs.map((slug) => {
                  const hits = groups.byLesson!.get(slug)!;
                  const lesson = lessons.find((l) => l.slug === slug);
                  if (!lesson) return null;
                  return (
                    <Card key={slug} className="overflow-hidden p-0">
                      <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-base-subtle/40 px-5 py-3">
                        <p className="truncate text-sm font-semibold text-text">
                          {hits[0]!.lessonTitle}
                        </p>
                        <Link
                          to={`/lesson/${lesson.slug}`}
                          className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent-hover transition-colors hover:text-text"
                        >
                          Open lesson
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                      <ul className="flex flex-col divide-y divide-border-subtle/60">
                        {hits.slice(0, 6).map((hit, i) => (
                          <li
                            key={`${hit.kind}-${i}`}
                            className="flex items-start gap-3 px-5 py-3"
                          >
                            <span
                              className={cn(
                                "mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium",
                                KIND_STYLE[hit.kind],
                              )}
                            >
                              {searchKindLabel(hit.kind)}
                            </span>
                            <span className="min-w-0 text-sm leading-relaxed text-text-secondary">
                              {hit.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      ) : (
        <Card className="mt-10 flex flex-col items-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-base-subtle">
            <Search className="size-5 text-text-muted" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-medium text-text">No results found</p>
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
