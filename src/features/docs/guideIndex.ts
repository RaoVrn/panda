/**
 * Panda Guide  -  the compact, product-oriented help center.
 *
 * A short, visual guide instead of a large documentation site. Four pages:
 * Overview, Learning, Playground, Panda AI. Where the guide shows real product
 * data (course modules, lessons, playgrounds) it reads from the actual sources
 * so it can never drift out of date.
 */

import { allLessons, moduleLessons } from "@/content/lessons";
import { modules } from "@/content/curriculum";

export type GuidePageId = "overview" | "learning" | "playground" | "ai";

export interface GuidePage {
  id: GuidePageId;
  /** Route slug. The overview is the guide home (/docs). */
  slug: string;
  /** Short sidebar label. */
  label: string;
  /** Full page title. */
  title: string;
  /** One-line page subtitle. */
  subtitle: string;
  /** Route this page lives at. */
  route: string;
  /** One-line description for the AI + nav. */
  description: string;
}

export const GUIDE_PAGES: GuidePage[] = [
  {
    id: "overview",
    slug: "",
    label: "Overview",
    title: "How Panda Works",
    subtitle: "Learn Git by understanding what actually happens.",
    route: "/docs",
    description: "A quick introduction to Panda and where to start.",
  },
  {
    id: "learning",
    slug: "learning",
    label: "Learning",
    title: "Learn Git Your Way",
    subtitle: "Understand the idea, see it happen, then practice it.",
    route: "/docs/learning",
    description: "How lessons work, Read vs Interactive mode, the course and progress.",
  },
  {
    id: "playground",
    slug: "playground",
    label: "Playground",
    title: "Practice Git Without the Fear",
    subtitle: "Experiment with commands and see the repository change.",
    route: "/docs/playground",
    description: "The safe, simulated playground for practicing Git.",
  },
  {
    id: "ai",
    slug: "panda-ai",
    label: "Panda AI",
    title: "Your Git Learning Companion",
    subtitle: "Ask questions whenever Git doesn't make sense.",
    route: "/docs/panda-ai",
    description: "When and how to use Panda AI, with real examples.",
  },
];

/** Ordered guide flow for previous/next navigation. */
export const GUIDE_ORDER: GuidePageId[] = ["overview", "learning", "playground", "ai"];

export function guidePageById(id: GuidePageId): GuidePage | undefined {
  return GUIDE_PAGES.find((page) => page.id === id);
}

/** Previous / next guide pages in reading order. */
export function guidePrevNext(id: GuidePageId): {
  prev?: GuidePage;
  next?: GuidePage;
} {
  const index = GUIDE_ORDER.indexOf(id);
  return {
    prev: index > 0 ? guidePageById(GUIDE_ORDER[index - 1]!) : undefined,
    next: index >= 0 && index < GUIDE_ORDER.length - 1
      ? guidePageById(GUIDE_ORDER[index + 1]!)
      : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Routing + AI integration                                            */
/* ------------------------------------------------------------------ */

/** Whether a slug is a real guide page (the overview maps to /docs). */
export function isDocSlug(slug: string): boolean {
  if (slug === "" || slug === "overview") return true;
  return GUIDE_PAGES.some((page) => page.slug === slug);
}

/** Resolve a guide slug to its real route (/docs or /docs/<slug>). */
export function resolveDocsRoute(slug: string): string {
  if (slug === "" || slug === "overview") return "/docs";
  return `/docs/${slug}`;
}

/** The first lesson in the course, for "open a lesson" CTAs. */
export function firstLessonSlug(): string {
  return allLessons()[0]?.slug ?? "";
}

/** The first lesson that ships a playground, for "try the playground" CTAs. */
export function firstPlaygroundSlug(): string {
  return allLessons().find((lesson) => lesson.playground)?.slug ?? firstLessonSlug();
}

/** All six course modules with their real lesson counts. */
export function courseModules() {
  return modules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    order: module.order,
    lessonCount: moduleLessons(module.id).length,
    icon: module.icon,
  }));
}

/** Compact, authoritative guide index so Panda AI can link to real pages. */
export function describeDocsContent(): string {
  const lines = GUIDE_PAGES.map((page) => {
    const slugLabel = page.slug === "" ? "overview (resolves to /docs)" : page.slug;
    return `  - route:docsPage:${slugLabel}: "${page.title}" (${page.description})`;
  });
  return [
    "Panda guide pages, use these EXACT slugs for guide links (route:docsPage:<slug>; use docsPage:overview for the guide home):",
    ...lines,
  ].join("\n");
}
