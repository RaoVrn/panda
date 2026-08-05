import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional "back" link shown above the title so no page feels trapped. */
  back?: { to: string; label: string };
  children?: ReactNode;
}

/**
 * One page-header pattern for every major page: optional back link, title,
 * subtitle. Keeps navigation and typography consistent across the app.
 */
export function PageHeader({ title, subtitle, back, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
