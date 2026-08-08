/**
 * Panda route registry.
 *
 * Every important destination registers itself here under a stable route ID.
 * The AI never knows raw URLs: it asks for a destination by ID (via
 * `route:<id>` action links) and this registry resolves the actual URL. If a
 * path changes later, the AI keeps working unchanged.
 */

import { nextLessonToStudy } from "@/features/progress/progressService";
import { useProgressStore } from "@/features/progress/progressStore";

export interface RouteTarget {
  /** Stable identifier used by the AI and action buttons. */
  id: string;
  /** Human label for buttons. */
  label: string;
  /** One-line description, surfaced to the AI so it knows what a route does. */
  description: string;
  /** Resolves the destination URL (optionally from a param such as a slug). */
  resolve: (param?: string) => string;
  /** Whether the AI is allowed to link this route. */
  aiLinkable?: boolean;
}

export const ROUTE_REGISTRY: Record<string, RouteTarget> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    description: "Your home with the welcome hero, progress and achievements",
    resolve: () => "/dashboard",
    aiLinkable: true,
  },
  profile: {
    id: "profile",
    label: "Profile",
    description: "Your name, username and avatar",
    resolve: () => "/profile",
    aiLinkable: true,
  },
  settings: {
    id: "settings",
    label: "Settings",
    description: "Preferences, stats, explanation style and reset progress",
    resolve: () => "/settings",
    aiLinkable: true,
  },
  account: {
    id: "account",
    label: "Account",
    description: "Your sign-in details and sign out",
    resolve: () => "/account",
    aiLinkable: true,
  },
  achievements: {
    id: "achievements",
    label: "Achievements",
    description: "Your badge collection",
    resolve: () => "/achievements",
    aiLinkable: true,
  },
  courseProgress: {
    id: "courseProgress",
    label: "Course Progress",
    description: "The six modules of the course",
    resolve: () => "/dashboard#course-progress",
    aiLinkable: true,
  },
  roadmap: {
    id: "roadmap",
    label: "Roadmap",
    description: "The full learning path",
    resolve: () => "/dashboard#course-progress",
    aiLinkable: true,
  },
  search: {
    id: "search",
    label: "Search",
    description: "Search lessons, commands and concepts",
    resolve: () => "/search",
    aiLinkable: true,
  },
  pandaAi: {
    id: "pandaAi",
    label: "Panda AI",
    description: "This assistant",
    resolve: () => "/panda-ai",
    aiLinkable: true,
  },
  lesson: {
    id: "lesson",
    label: "Lesson",
    description: "Open a specific lesson by its slug",
    resolve: (param) => (param ? `/lesson/${param}` : "/dashboard"),
    aiLinkable: true,
  },
  module: {
    id: "module",
    label: "Module",
    description: "Open a specific module overview by its id",
    resolve: (param) => (param ? `/module/${param}` : "/dashboard"),
    aiLinkable: true,
  },
  lessonCurrent: {
    id: "lessonCurrent",
    label: "Continue Learning",
    description: "Your next lesson to study",
    resolve: () => {
      const next = nextLessonToStudy(useProgressStore.getState().completedLessonIds);
      return next ? `/lesson/${next.slug}` : "/dashboard";
    },
    aiLinkable: true,
  },
};

/** Resolves a route ID (and optional param) to a URL, or null when unknown. */
export function resolveRoute(routeId: string, param?: string): string | null {
  const target = ROUTE_REGISTRY[routeId];
  if (!target) return null;
  return target.resolve(param);
}

/** All route IDs the AI may link to, for the prompt and tool docs. */
export function aiRouteIds(): string[] {
  return Object.values(ROUTE_REGISTRY)
    .filter((r) => r.aiLinkable)
    .map((r) => r.id);
}

/** Human-readable tool docs for the prompt: id (label) - description. */
export function describeAiRoutes(): string {
  return Object.values(ROUTE_REGISTRY)
    .filter((r) => r.aiLinkable)
    .map((r) => `  - ${r.id} (${r.label}): ${r.description}`)
    .join("\n");
}

/**
 * Parse a `route:...` action-link href into a URL.
 *   route:dashboard                    → resolved URL
 *   route:lesson:what-is-git           → /lesson/what-is-git
 * Returns null when the route is unknown.
 */
export function resolveRouteLink(href: string): string | null {
  if (!href.startsWith("route:")) return null;
  const rest = href.slice("route:".length);
  const [id, param] = rest.split(":");
  if (!id) return null;
  return resolveRoute(id, param || undefined);
}
