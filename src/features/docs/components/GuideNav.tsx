import { NavLink } from "react-router-dom";
import { BookOpen, GraduationCap, MessageSquareText, Terminal } from "lucide-react";
import { GUIDE_PAGES, type GuidePageId } from "../guideIndex";
import { cn } from "@/lib/utils";

const PAGE_ICONS: Record<GuidePageId, typeof BookOpen> = {
  overview: BookOpen,
  learning: GraduationCap,
  playground: Terminal,
  ai: MessageSquareText,
};

/**
 * The compact guide navigation: exactly four items (Overview, Learning,
 * Playground, Panda AI). Used by the desktop sidebar and the mobile picker.
 */
export function GuideNav({
  active,
  onNavigate,
  orientation = "vertical",
}: {
  active: GuidePageId;
  onNavigate?: () => void;
  orientation?: "vertical" | "horizontal";
}) {
  const horizontal = orientation === "horizontal";
  return (
    <nav
      aria-label="Panda Guide"
      className={horizontal ? "flex gap-1" : "flex flex-col gap-0.5"}
    >
      {GUIDE_PAGES.map((page) => {
        const Icon = PAGE_ICONS[page.id];
        return (
          <NavLink
            key={page.id}
            to={page.route}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg text-[13.5px] transition-colors",
              horizontal ? "shrink-0 px-3 py-1.5" : "px-3 py-2",
              page.id === active
                ? "bg-accent-soft font-medium text-text ring-1 ring-inset ring-accent/20"
                : "text-text-secondary hover:bg-base-subtle hover:text-text",
            )}
            aria-current={page.id === active ? "page" : undefined}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                page.id === active ? "text-accent-hover" : "text-text-muted",
              )}
              aria-hidden="true"
            />
            {page.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
