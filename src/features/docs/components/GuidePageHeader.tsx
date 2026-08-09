import type { ReactNode } from "react";

/**
 * Consistent guide page header: title + subtitle + optional right-side content.
 */
export function GuidePageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="mt-8 lg:mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </header>
  );
}
