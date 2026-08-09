import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { GuideNav } from "./GuideNav";
import type { GuidePageId } from "../guideIndex";
import { Brand } from "@/components/brand/Logo";

/**
 * The guide layout: a small sticky sidebar (Overview, Learning, Playground,
 * Panda AI) on desktop and a compact horizontal picker on mobile. The content
 * column stays at a comfortable reading width.
 */
export function GuideLayout({
  active,
  children,
}: {
  active: GuidePageId;
  children: ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <aside className="sticky top-14 hidden self-start lg:block lg:py-8">
        <div className="flex flex-col gap-5">
          <Link to="/docs" className="flex items-center gap-2.5">
            <Brand size={26} />
            <span className="text-sm font-semibold tracking-tight text-text">Panda Guide</span>
          </Link>
          <GuideNav active={active} />
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0">
      {/* Mobile picker */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-border-subtle bg-base/90 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            Guide
          </span>
          <GuideNav active={active} orientation="horizontal" />
        </div>
      </div>

        {children}
      </div>
    </div>
  );
}
